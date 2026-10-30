import { describe, it, expect, beforeEach } from 'vitest';
import { LeaderboardService } from '../src/services/leaderboard.service';
import { db } from '../src/utils/db';

describe('LeaderboardService (US-05: Leaderboard & Tie-Breaker)', () => {
  beforeEach(async () => {
    // Ensure clean state without temporary test users
    await db.rewardRedemption.deleteMany({
      where: { user: { email: { contains: 'tester' } } },
    });
    await db.checkIn.deleteMany({
      where: { user: { email: { contains: 'tester' } } },
    });
    await db.user.deleteMany({
      where: { email: { contains: 'tester' } },
    });
  });

  it('correctly ranks students and breaks ties by earliest timestamp', async () => {
    const aisha = await db.user.findFirst({ where: { email: 'aisha@college.edu' } });
    const ben = await db.user.findFirst({ where: { email: 'ben@college.edu' } });
    const evan = await db.user.findFirst({ where: { email: 'evan@college.edu' } });

    const leaderboard = await LeaderboardService.getLeaderboard(evan!.id);

    expect(leaderboard.topStudents.length).toBeGreaterThanOrEqual(4);

    const aishaEntry = leaderboard.topStudents.find((s) => s.name === 'Aisha Patel');
    const benEntry = leaderboard.topStudents.find((s) => s.name === 'Ben Zhang');

    expect(aishaEntry).toBeDefined();
    expect(benEntry).toBeDefined();
    expect(aishaEntry?.lifetimePoints).toBe(50);
    expect(benEntry?.lifetimePoints).toBe(50);

    // Tie-break rule: Aisha completed her latest quest earlier than Ben,
    // so Aisha's rank MUST be strictly higher (lower numerical rank) than Ben's!
    expect(aishaEntry!.rank).toBeLessThan(benEntry!.rank);

    // Evan (0 pts) rank is returned in myRank
    expect(leaderboard.myRank).not.toBeNull();
    expect(leaderboard.myRank?.name).toBe('Evan Wright');
    expect(leaderboard.myRank?.lifetimePoints).toBe(0);
    expect(leaderboard.myRank?.rank).toBeGreaterThanOrEqual(4);
  });
});
