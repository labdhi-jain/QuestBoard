import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { RewardService } from '../src/services/reward.service';
import { db } from '../src/utils/db';

describe('RewardService (US-06 & US-11: Reward Redemption & Stock Management)', () => {
  let studentId: string;
  let stickerRewardId: string;
  let pinRewardId: string;

  beforeEach(async () => {
    await db.rewardRedemption.deleteMany({
      where: { user: { email: 'reward.tester@college.edu' } },
    });
    await db.user.deleteMany({
      where: { email: 'reward.tester@college.edu' },
    });

    const student = await db.user.create({
      data: {
        name: 'Reward Tester',
        email: 'reward.tester@college.edu',
        passwordHash: 'hashed',
        role: 'STUDENT',
        lifetimePoints: 100,
        pointsBalance: 50, // Has 50 spendable points
      },
    });
    studentId = student.id;

    // Reset test reward stock
    const sticker = await db.reward.findFirst({ where: { title: 'College Vinyl Sticker Pack' } });
    await db.reward.update({ where: { id: sticker!.id }, data: { stock: 25 } });
    stickerRewardId = sticker!.id;

    const pin = await db.reward.findFirst({ where: { title: 'Exclusive QuestBoard Enamel Pin' } });
    await db.reward.update({ where: { id: pin!.id }, data: { stock: 1 } });
    pinRewardId = pin!.id;
  });

  afterAll(async () => {
    await db.rewardRedemption.deleteMany({
      where: { user: { email: 'reward.tester@college.edu' } },
    });
    await db.user.deleteMany({
      where: { email: 'reward.tester@college.edu' },
    });
  });

  it('successfully redeems a reward: decrements pointsBalance and stock, preserves lifetimePoints', async () => {
    const sticker = await db.reward.findUnique({ where: { id: stickerRewardId } });
    const initialStock = sticker!.stock;

    // Sticker costs 15 points
    const result = await RewardService.redeemReward(studentId, stickerRewardId);

    expect(result.pointsSpent).toBe(15);
    expect(result.newPointsBalance).toBe(35); // 50 - 15 = 35
    expect(result.lifetimePoints).toBe(100); // Unchanged!
    expect(result.reward.stock).toBe(initialStock - 1);

    // Verify User record in DB
    const userInDb = await db.user.findUnique({ where: { id: studentId } });
    expect(userInDb?.pointsBalance).toBe(35);
    expect(userInDb?.lifetimePoints).toBe(100); // MUST NEVER decrease!
  });

  it('blocks redemption when pointsBalance is insufficient', async () => {
    // Bookstore Gift Card costs 80 points, student only has 50
    const card = await db.reward.findFirst({ where: { title: 'University Bookstore $15 Gift Card' } });

    await expect(RewardService.redeemReward(studentId, card!.id)).rejects.toThrowError(
      /Insufficient points/
    );

    // Points intact
    const userInDb = await db.user.findUnique({ where: { id: studentId } });
    expect(userInDb?.pointsBalance).toBe(50);
  });

  it('blocks redemption when item is out of stock', async () => {
    // Pin costs 50 points, initial stock is 1
    // First redemption succeeds and drops stock to 0
    await RewardService.redeemReward(studentId, pinRewardId);

    // Give student more points to try again
    await db.user.update({
      where: { id: studentId },
      data: { pointsBalance: 100 },
    });

    // Second redemption must fail due to zero stock
    await expect(RewardService.redeemReward(studentId, pinRewardId)).rejects.toThrowError(
      /out of stock/
    );

    const pinInDb = await db.reward.findUnique({ where: { id: pinRewardId } });
    expect(pinInDb?.stock).toBe(0);
  });
});
