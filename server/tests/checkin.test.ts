import { describe, it, expect, beforeEach } from 'vitest';
import { CheckInService } from '../src/services/checkin.service';
import { QRService } from '../src/services/qr.service';
import { db } from '../src/utils/db';

describe('CheckInService (US-03: QR Scan Check-in & Business Rules)', () => {
  let studentId: string;
  let adminId: string;

  beforeEach(async () => {
    // Clean test checkins and users
    await db.checkIn.deleteMany({
      where: { user: { email: 'checkin.tester@college.edu' } },
    });
    await db.user.deleteMany({
      where: { email: 'checkin.tester@college.edu' },
    });

    const admin = await db.user.findFirst({ where: { role: 'ADMIN' } });
    adminId = admin!.id;

    const student = await db.user.create({
      data: {
        name: 'Checkin Tester',
        email: 'checkin.tester@college.edu',
        passwordHash: 'hashed',
        role: 'STUDENT',
        lifetimePoints: 0,
        pointsBalance: 0,
      },
    });
    studentId = student.id;
  });

  it('awards points atomically upon scanning a valid unexpired QR code', async () => {
    // Find quest 4 (15 pts)
    const quest = await db.quest.findFirst({ where: { title: 'Locate Your Department Office' } });
    const qr = await db.qRCode.findFirst({ where: { questId: quest!.id, active: true } });

    const result = await CheckInService.scanCheckIn(studentId, qr!.token);

    expect(result.pointsAwarded).toBe(15);
    expect(result.lifetimePoints).toBe(15);
    expect(result.pointsBalance).toBe(15);

    // Verify DB state
    const user = await db.user.findUnique({ where: { id: studentId } });
    expect(user?.lifetimePoints).toBe(15);
    expect(user?.pointsBalance).toBe(15);

    const checkIn = await db.checkIn.findUnique({
      where: { userId_questId: { userId: studentId, questId: quest!.id } },
    });
    expect(checkIn?.status).toBe('VERIFIED');
    expect(checkIn?.method).toBe('QR');
  });

  it('blocks duplicate check-in and awards no additional points', async () => {
    const quest = await db.quest.findFirst({ where: { title: 'Locate Your Department Office' } });
    const qr = await db.qRCode.findFirst({ where: { questId: quest!.id, active: true } });

    // First scan succeeds
    await CheckInService.scanCheckIn(studentId, qr!.token);

    // Second scan must be rejected
    await expect(CheckInService.scanCheckIn(studentId, qr!.token)).rejects.toThrowError(
      /already completed/
    );

    // Verify user points did not increase again
    const user = await db.user.findUnique({ where: { id: studentId } });
    expect(user?.lifetimePoints).toBe(15);
    expect(user?.pointsBalance).toBe(15);
  });

  it('rejects an expired QR code and awards zero points', async () => {
    await expect(CheckInService.scanCheckIn(studentId, 'EXPIRED-DEMO-CODE')).rejects.toThrowError(
      /expired/
    );

    const user = await db.user.findUnique({ where: { id: studentId } });
    expect(user?.lifetimePoints).toBe(0);
    expect(user?.pointsBalance).toBe(0);
  });

  it('rejects an inactive QR code when a new code has been regenerated', async () => {
    const quest = await db.quest.findFirst({ where: { title: 'Gym & Recreation Induction' } });
    const oldQR = await db.qRCode.findFirst({ where: { questId: quest!.id, active: true } });

    // Regenerate code (US-09)
    const newQR = await QRService.generateCode(quest!.id);

    // Old code is now inactive
    await expect(CheckInService.scanCheckIn(studentId, oldQR!.token)).rejects.toThrowError(
      /invalid or has been replaced/
    );

    // New code works
    const result = await CheckInService.scanCheckIn(studentId, newQR.qrCode.token);
    expect(result.pointsAwarded).toBe(20);
  });

  it('enforces prerequisite quests (LOCKED status)', async () => {
    // Quest 6 (Rooftop Garden) requires Quest 1 (Silent Floor)
    const quest6 = await db.quest.findFirst({ where: { title: 'Discover the Secret Rooftop Garden' } });
    const qr6 = await db.qRCode.findFirst({ where: { questId: quest6!.id, active: true } });

    // Student has not completed Quest 1 yet -> Should fail
    await expect(CheckInService.scanCheckIn(studentId, qr6!.token)).rejects.toThrowError(
      /Prerequisite locked/
    );

    // Now complete Quest 1 (prereq)
    const quest1 = await db.quest.findFirst({ where: { title: 'Find the Silent Floor' } });
    const qr1 = await db.qRCode.findFirst({ where: { questId: quest1!.id, active: true } });
    await CheckInService.scanCheckIn(studentId, qr1!.token);

    // Now scanning Quest 6 succeeds!
    const result = await CheckInService.scanCheckIn(studentId, qr6!.token);
    expect(result.pointsAwarded).toBe(35);
  });
});
