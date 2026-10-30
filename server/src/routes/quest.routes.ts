import { Router, Request, Response, NextFunction } from 'express';
import { QuestService } from '../services/quest.service';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/quests
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quests = await QuestService.getAllForStudent(req.user?.id);
    res.json({ quests });
  } catch (err) {
    next(err);
  }
});

// GET /api/quests/:id
router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quest = await QuestService.getByIdForStudent(req.params.id, req.user?.id);
    res.json({ quest });
  } catch (err) {
    next(err);
  }
});

export default router;
