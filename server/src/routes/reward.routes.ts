import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { RewardService } from '../services/reward.service';

const router = Router();

// GET /api/rewards
// US-06: Rewards list shows point cost and remaining stock
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rewards = await RewardService.getAllActive();
    res.json({ rewards });
  } catch (err) {
    next(err);
  }
});

// POST /api/rewards/:id/redeem
// US-06: Student redeems points for reward
router.post('/:id/redeem', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RewardService.redeemReward(req.user!.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
