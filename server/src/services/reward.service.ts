import { db } from '../utils/db';
import { AppError, NotFoundError } from '../utils/errors';
import { CreateRewardInput, UpdateRewardInput } from '../validators/reward.validator';

export class RewardService {
  /**
   * Get active rewards for student view
   * US-06: Rewards list shows point cost and remaining stock
   */
  static async getAllActive() {
    return db.reward.findMany({
      where: { active: true },
      orderBy: { pointCost: 'asc' },
    });
  }

  /**
   * Admin view of all rewards with redemption stats
   * US-11
   */
  static async getAllForAdmin() {
    return db.reward.findMany({
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: create reward
   * US-11
   */
  static async createReward(input: CreateRewardInput) {
    return db.reward.create({
      data: {
        title: input.title,
        description: input.description,
        pointCost: input.pointCost,
        stock: input.stock,
        active: input.active ?? true,
      },
    });
  }

  /**
   * Admin: update reward
   * US-11
   */
  static async updateReward(rewardId: string, input: UpdateRewardInput) {
    const existing = await db.reward.findUnique({ where: { id: rewardId } });
    if (!existing) {
      throw new NotFoundError('Reward not found', 'REWARD_NOT_FOUND');
    }

    return db.reward.update({
      where: { id: rewardId },
      data: {
        title: input.title,
        description: input.description,
        pointCost: input.pointCost,
        stock: input.stock,
        active: input.active,
      },
    });
  }

  /**
   * Student: redeem reward
   * US-06:
   * - Block if pointsBalance < pointCost or stock <= 0
   * - Deduct from pointsBalance only (never from lifetimePoints)
   * - Decrement stock atomically (stock can never go below zero)
   * - Create RewardRedemption inside one transaction
   */
  static async redeemReward(userId: string, rewardId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const reward = await db.reward.findUnique({ where: { id: rewardId } });
    if (!reward || !reward.active) {
      throw new NotFoundError('Reward not found or unavailable', 'REWARD_NOT_FOUND');
    }

    if (reward.stock <= 0) {
      throw new AppError('This reward is currently out of stock!', 400, 'OUT_OF_STOCK');
    }

    if (user.pointsBalance < reward.pointCost) {
      const shortage = reward.pointCost - user.pointsBalance;
      throw new AppError(
        `Insufficient points! You need ${shortage} more points to redeem "${reward.title}".`,
        400,
        'INSUFFICIENT_POINTS'
      );
    }

    return db.$transaction(async (tx) => {
      // Re-check and decrement stock safely
      const currentReward = await tx.reward.findUnique({ where: { id: rewardId } });
      if (!currentReward || currentReward.stock <= 0) {
        throw new AppError('This reward just sold out!', 400, 'OUT_OF_STOCK');
      }

      const updatedReward = await tx.reward.update({
        where: { id: rewardId },
        data: {
          stock: { decrement: 1 },
        },
      });

      // Deduct pointsBalance ONLY, preserving lifetimePoints for Leaderboard integrity
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          pointsBalance: { decrement: reward.pointCost },
        },
      });

      const redemption = await tx.rewardRedemption.create({
        data: {
          userId,
          rewardId,
          pointsSpent: reward.pointCost,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          message: `🎁 Claimed! You redeemed "${reward.title}" for ${reward.pointCost} points. Show your confirmation to orientation staff!`,
        },
      });

      return {
        redemption,
        reward: updatedReward,
        pointsSpent: reward.pointCost,
        newPointsBalance: updatedUser.pointsBalance,
        lifetimePoints: updatedUser.lifetimePoints,
      };
    });
  }
}
