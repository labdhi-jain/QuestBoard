import { db } from '../utils/db';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  lifetimePoints: number;
  completedQuestsCount: number;
  latestVerifiedAt: string | null;
}

export class LeaderboardService {
  /**
   * Generates the competitive leaderboard
   * US-05:
   * - Top 20 students by lifetimePoints
   * - Tie-breaker: earliest time of their latest verified check-in
   * - Always returns the requesting student's rank and highlights it
   */
  static async getLeaderboard(currentUserId?: string) {
    const students = await db.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        lifetimePoints: true,
        createdAt: true,
        checkIns: {
          where: { status: 'VERIFIED' },
          select: { verifiedAt: true },
          orderBy: { verifiedAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            checkIns: {
              where: { status: 'VERIFIED' },
            },
          },
        },
      },
    });

    // Sort according to business rules:
    // 1. lifetimePoints DESC
    // 2. Earliest timestamp of latest verified check-in (or createdAt if no checkins)
    const sorted = students.map((s) => {
      const latestVerified = s.checkIns[0]?.verifiedAt || null;
      const tieBreakTimestamp = latestVerified ? new Date(latestVerified).getTime() : new Date(s.createdAt).getTime();

      return {
        id: s.id,
        name: s.name,
        lifetimePoints: s.lifetimePoints,
        completedQuestsCount: s._count.checkIns,
        latestVerifiedAt: latestVerified ? latestVerified.toISOString() : null,
        tieBreakTimestamp,
      };
    }).sort((a, b) => {
      if (b.lifetimePoints !== a.lifetimePoints) {
        return b.lifetimePoints - a.lifetimePoints;
      }
      return a.tieBreakTimestamp - b.tieBreakTimestamp;
    });

    // Assign 1-based rank
    const ranked: LeaderboardEntry[] = sorted.map((entry, idx) => ({
      rank: idx + 1,
      id: entry.id,
      name: entry.name,
      lifetimePoints: entry.lifetimePoints,
      completedQuestsCount: entry.completedQuestsCount,
      latestVerifiedAt: entry.latestVerifiedAt,
    }));

    const top20 = ranked.slice(0, 20);

    let myRank: LeaderboardEntry | null = null;
    if (currentUserId) {
      myRank = ranked.find((entry) => entry.id === currentUserId) || null;
    }

    return {
      topStudents: top20,
      totalParticipants: ranked.length,
      myRank,
    };
  }
}
