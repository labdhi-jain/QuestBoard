import { db } from '../utils/db';
import { AppError, ConflictError, NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class CheckInService {
  /**
   * Processes a QR scan check-in.
   * US-03: Scanning a valid, unexpired code creates a verified check-in within 2 seconds.
   * Duplicate scans return a friendly already-completed response.
   */
  static async scanCheckIn(userId: string, rawToken: string) {
    const token = rawToken.trim();

    // 1. Validate QR code token
    const qrCode = await db.qRCode.findUnique({
      where: { token },
      include: { quest: true },
    });

    if (!qrCode || !qrCode.active) {
      throw new AppError('This QR code is invalid or has been replaced.', 400, 'QR_INVALID');
    }

    if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) {
      throw new AppError('This QR code has expired and is no longer valid.', 400, 'QR_EXPIRED');
    }

    const quest = qrCode.quest;
    if (quest.status !== 'PUBLISHED') {
      throw new AppError('This quest is not currently active.', 400, 'QUEST_NOT_PUBLISHED');
    }

    // 2. Check Prerequisite
    if (quest.prerequisiteQuestId) {
      const prereqCheckIn = await db.checkIn.findUnique({
        where: {
          userId_questId: {
            userId,
            questId: quest.prerequisiteQuestId,
          },
        },
      });

      if (!prereqCheckIn || prereqCheckIn.status !== 'VERIFIED') {
        const prereqQuest = await db.quest.findUnique({
          where: { id: quest.prerequisiteQuestId },
          select: { title: true },
        });
        throw new AppError(
          `Prerequisite locked: You must first complete "${prereqQuest?.title || 'the prerequisite quest'}".`,
          400,
          'PREREQUISITE_LOCKED'
        );
      }
    }

    // 3. Check for existing check-in
    const existingCheckIn = await db.checkIn.findUnique({
      where: {
        userId_questId: {
          userId,
          questId: quest.id,
        },
      },
    });

    if (existingCheckIn) {
      if (existingCheckIn.status === 'VERIFIED') {
        throw new ConflictError('You have already completed this quest! No extra points awarded.', 'ALREADY_COMPLETED');
      }
      if (existingCheckIn.status === 'PENDING') {
        throw new ConflictError('Your check-in is already pending admin verification.', 'CHECKIN_PENDING');
      }
    }

    // 4. Atomic database transaction to award points and record verified check-in
    try {
      return await db.$transaction(async (tx) => {
        const checkIn = await tx.checkIn.create({
          data: {
            userId,
            questId: quest.id,
            status: 'VERIFIED',
            method: 'QR',
            verifiedAt: new Date(),
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            lifetimePoints: { increment: quest.pointValue },
            pointsBalance: { increment: quest.pointValue },
          },
        });

        // Check if completing this quest unlocked any dependent quests for notifications (US-07)
        const unlockedQuests = await tx.quest.findMany({
          where: {
            prerequisiteQuestId: quest.id,
            status: 'PUBLISHED',
          },
        });

        for (const unlocked of unlockedQuests) {
          await tx.notification.create({
            data: {
              userId,
              message: `🎉 Quest Unlocked! "${unlocked.title}" is now available to explore!`,
            },
          });
        }

        return {
          checkIn,
          quest: {
            id: quest.id,
            title: quest.title,
            pointValue: quest.pointValue,
            category: quest.category,
          },
          pointsAwarded: quest.pointValue,
          lifetimePoints: updatedUser.lifetimePoints,
          pointsBalance: updatedUser.pointsBalance,
        };
      });
    } catch (err) {
      // Handle race condition on duplicate rapid scan hitting the unique constraint
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('You have already completed this quest!', 'ALREADY_COMPLETED');
      }
      throw err;
    }
  }

  /**
   * Submits a manual check-in for quests that cannot use QR codes (e.g., "Meet a Senior")
   * US-10
   */
  static async submitManualCheckIn(userId: string, questId: string, note?: string) {
    const quest = await db.quest.findUnique({ where: { id: questId } });
    if (!quest || quest.status !== 'PUBLISHED') {
      throw new NotFoundError('Quest not found or not published', 'QUEST_NOT_FOUND');
    }

    if (quest.verificationType !== 'MANUAL') {
      throw new AppError('This quest requires scanning a QR code at the physical location.', 400, 'QR_REQUIRED');
    }

    // Prerequisite check
    if (quest.prerequisiteQuestId) {
      const prereq = await db.checkIn.findUnique({
        where: {
          userId_questId: {
            userId,
            questId: quest.prerequisiteQuestId,
          },
        },
      });
      if (!prereq || prereq.status !== 'VERIFIED') {
        throw new AppError('You must complete the prerequisite quest first.', 400, 'PREREQUISITE_LOCKED');
      }
    }

    const existing = await db.checkIn.findUnique({
      where: {
        userId_questId: {
          userId,
          questId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'VERIFIED') {
        throw new ConflictError('You have already completed this quest.', 'ALREADY_COMPLETED');
      }
      if (existing.status === 'PENDING') {
        throw new ConflictError('You have already submitted a pending check-in for this quest.', 'CHECKIN_PENDING');
      }
    }

    return db.checkIn.create({
      data: {
        userId,
        questId,
        status: 'PENDING',
        method: 'MANUAL',
        note: note?.trim() || null,
      },
      include: {
        quest: {
          select: { title: true, pointValue: true },
        },
      },
    });
  }

  /**
   * Admin verification queue
   * US-10: Admin sees a queue of pending manual check-ins
   */
  static async getPendingManualQueue() {
    return db.checkIn.findMany({
      where: {
        status: 'PENDING',
        method: 'MANUAL',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        quest: {
          select: { id: true, title: true, pointValue: true, category: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Admin approves or rejects a manual check-in
   * US-10: Approving awards points atomically reusing same transaction logic
   */
  static async reviewManualCheckIn(adminId: string, checkInId: string, status: 'VERIFIED' | 'REJECTED') {
    const checkIn = await db.checkIn.findUnique({
      where: { id: checkInId },
      include: { quest: true, user: true },
    });

    if (!checkIn) {
      throw new NotFoundError('Check-in record not found', 'CHECKIN_NOT_FOUND');
    }

    if (checkIn.status !== 'PENDING') {
      throw new AppError('This check-in has already been reviewed', 400, 'ALREADY_REVIEWED');
    }

    if (status === 'REJECTED') {
      const updated = await db.checkIn.update({
        where: { id: checkInId },
        data: {
          status: 'REJECTED',
          verifiedById: adminId,
          verifiedAt: new Date(),
        },
      });

      await db.notification.create({
        data: {
          userId: checkIn.userId,
          message: `Your check-in for "${checkIn.quest.title}" was not approved. You can try again!`,
        },
      });

      return { checkIn: updated, status: 'REJECTED' };
    }

    // Approved: award points in transaction
    return db.$transaction(async (tx) => {
      const updatedCheckIn = await tx.checkIn.update({
        where: { id: checkInId },
        data: {
          status: 'VERIFIED',
          verifiedById: adminId,
          verifiedAt: new Date(),
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: checkIn.userId },
        data: {
          lifetimePoints: { increment: checkIn.quest.pointValue },
          pointsBalance: { increment: checkIn.quest.pointValue },
        },
      });

      await tx.notification.create({
        data: {
          userId: checkIn.userId,
          message: `🎉 Quest Approved! You earned +${checkIn.quest.pointValue} pts for "${checkIn.quest.title}"!`,
        },
      });

      return {
        checkIn: updatedCheckIn,
        status: 'VERIFIED',
        pointsAwarded: checkIn.quest.pointValue,
        lifetimePoints: updatedUser.lifetimePoints,
        pointsBalance: updatedUser.pointsBalance,
      };
    });
  }
}
