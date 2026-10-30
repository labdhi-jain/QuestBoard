import { Router, Request, Response, NextFunction } from 'express';
import { optionalAuth } from '../middleware/auth.middleware';
import { LeaderboardService } from '../services/leaderboard.service';

const router = Router();

// GET /api/leaderboard
// US-05: Top 20 students by lifetimePoints + tie-break + own rank
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await LeaderboardService.getLeaderboard(req.user?.id);
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

export default router;
