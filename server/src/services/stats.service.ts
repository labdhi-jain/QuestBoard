import { db } from '../utils/db';

export class StatsService {
  /**
   * Generates admin dashboard metrics and quest performance analytics
   * US-12: Completion rate and total check-ins per quest
   */
  static async getAdminStats() {
    const [
      totalStudents,
      totalQuests,
      totalCheckIns,
      pendingVerifications,
      totalRedemptions,
      quests,
    ] = await Promise.all([
      db.user.count({ where: { role: 'STUDENT' } }),
      db.quest.count(),
      db.checkIn.count({ where: { status: 'VERIFIED' } }),
      db.checkIn.count({ where: { status: 'PENDING' } }),
      db.rewardRedemption.count(),
      db.quest.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          _count: {
            select: {
              checkIns: {
                where: { status: 'VERIFIED' },
              },
            },
          },
        },
      }),
    ]);

    const questAnalytics = quests.map((q) => {
      const verifiedCount = q._count.checkIns;
      const completionRate = totalStudents > 0 ? Math.round((verifiedCount / totalStudents) * 100) : 0;
      return {
        id: q.id,
        title: q.title,
        category: q.category,
        pointValue: q.pointValue,
        verifiedCount,
        completionRate,
      };
    }).sort((a, b) => b.verifiedCount - a.verifiedCount);

    return {
      overview: {
        totalStudents,
        totalQuests,
        totalCheckIns,
        pendingVerifications,
        totalRedemptions,
      },
      questAnalytics,
    };
  }
}
