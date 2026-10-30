import { db } from '../utils/db';
import { AppError, NotFoundError } from '../utils/errors';
import { CreateQuestInput, UpdateQuestInput } from '../validators/quest.validator';

export type StudentQuestStatus = 'LOCKED' | 'AVAILABLE' | 'PENDING' | 'COMPLETED';

export class QuestService {
  /**
   * Returns all published quests with each quest's status computed for the given student
   * US-02: Lists all quests with status (Locked/Available/Completed)
   */
  static async getAllForStudent(studentId?: string) {
    const quests = await db.quest.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        prerequisiteQuest: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!studentId) {
      return quests.map((q) => ({
        ...q,
        studentStatus: (q.prerequisiteQuestId ? 'LOCKED' : 'AVAILABLE') as StudentQuestStatus,
      }));
    }

    // Load student's check-ins
    const userCheckIns = await db.checkIn.findMany({
      where: { userId: studentId },
      select: { questId: true, status: true },
    });

    const checkInMap = new Map<string, string>();
    const verifiedQuestIds = new Set<string>();

    for (const ci of userCheckIns) {
      checkInMap.set(ci.questId, ci.status);
      if (ci.status === 'VERIFIED') {
        verifiedQuestIds.add(ci.questId);
      }
    }

    return quests.map((quest) => {
      let studentStatus: StudentQuestStatus = 'AVAILABLE';

      const checkInStatus = checkInMap.get(quest.id);
      if (checkInStatus === 'VERIFIED') {
        studentStatus = 'COMPLETED';
      } else if (checkInStatus === 'PENDING') {
        studentStatus = 'PENDING';
      } else if (quest.prerequisiteQuestId && !verifiedQuestIds.has(quest.prerequisiteQuestId)) {
        studentStatus = 'LOCKED';
      }

      return {
        ...quest,
        studentStatus,
      };
    });
  }

  /**
   * Get single quest details for student
   */
  static async getByIdForStudent(questId: string, studentId?: string) {
    const quest = await db.quest.findUnique({
      where: { id: questId },
      include: {
        prerequisiteQuest: {
          select: { id: true, title: true },
        },
      },
    });

    if (!quest || quest.status !== 'PUBLISHED') {
      throw new NotFoundError('Quest not found or not currently available', 'QUEST_NOT_FOUND');
    }

    let studentStatus: StudentQuestStatus = 'AVAILABLE';
    let checkIn = null;

    if (studentId) {
      checkIn = await db.checkIn.findUnique({
        where: {
          userId_questId: {
            userId: studentId,
            questId,
          },
        },
      });

      if (checkIn?.status === 'VERIFIED') {
        studentStatus = 'COMPLETED';
      } else if (checkIn?.status === 'PENDING') {
        studentStatus = 'PENDING';
      } else if (quest.prerequisiteQuestId) {
        const prereqCheckIn = await db.checkIn.findUnique({
          where: {
            userId_questId: {
              userId: studentId,
              questId: quest.prerequisiteQuestId,
            },
          },
        });
        if (prereqCheckIn?.status !== 'VERIFIED') {
          studentStatus = 'LOCKED';
        }
      }
    }

    return {
      ...quest,
      studentStatus,
      checkIn,
    };
  }

  /**
   * Admin view: get all quests (including drafts and archived)
   * US-08
   */
  static async getAllForAdmin() {
    return db.quest.findMany({
      include: {
        prerequisiteQuest: {
          select: { id: true, title: true },
        },
        qrCodes: {
          where: { active: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { checkIns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: create quest
   * US-08: Admin cannot publish a quest with a missing title or zero point value
   */
  static async createQuest(adminId: string, input: CreateQuestInput) {
    if (input.status === 'PUBLISHED' && (!input.title || input.pointValue <= 0)) {
      throw new AppError('Cannot publish quest without title or positive point value', 400, 'INVALID_QUEST');
    }

    return db.quest.create({
      data: {
        title: input.title,
        description: input.description,
        locationHint: input.locationHint,
        pointValue: input.pointValue,
        category: input.category,
        verificationType: input.verificationType || 'QR',
        status: input.status || 'DRAFT',
        prerequisiteQuestId: input.prerequisiteQuestId || null,
        createdById: adminId,
      },
      include: {
        prerequisiteQuest: {
          select: { id: true, title: true },
        },
      },
    });
  }

  /**
   * Admin: update quest
   * US-08
   */
  static async updateQuest(questId: string, input: UpdateQuestInput) {
    const existing = await db.quest.findUnique({ where: { id: questId } });
    if (!existing) {
      throw new NotFoundError('Quest not found', 'QUEST_NOT_FOUND');
    }

    const nextStatus = input.status || existing.status;
    const nextTitle = input.title !== undefined ? input.title : existing.title;
    const nextPoints = input.pointValue !== undefined ? input.pointValue : existing.pointValue;

    if (nextStatus === 'PUBLISHED' && (!nextTitle || nextPoints <= 0)) {
      throw new AppError('Cannot publish quest without title or positive point value', 400, 'INVALID_QUEST');
    }

    return db.quest.update({
      where: { id: questId },
      data: {
        title: input.title,
        description: input.description,
        locationHint: input.locationHint,
        pointValue: input.pointValue,
        category: input.category,
        verificationType: input.verificationType,
        status: input.status,
        prerequisiteQuestId: input.prerequisiteQuestId !== undefined ? input.prerequisiteQuestId : existing.prerequisiteQuestId,
      },
      include: {
        prerequisiteQuest: {
          select: { id: true, title: true },
        },
      },
    });
  }
}
