import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { QuestService } from '../services/quest.service';
import { QRService } from '../services/qr.service';
import { CheckInService } from '../services/checkin.service';
import { RewardService } from '../services/reward.service';
import { StatsService } from '../services/stats.service';
import { createQuestSchema, updateQuestSchema } from '../validators/quest.validator';
import { reviewCheckInSchema } from '../validators/checkin.validator';
import { createRewardSchema, updateRewardSchema } from '../validators/reward.validator';
import { db } from '../utils/db';
import { NotFoundError } from '../utils/errors';

const router = Router();

// Protect all admin endpoints with requireAuth and requireAdmin
router.use(requireAuth, requireAdmin);

// === Quests (US-08) ===
router.get('/quests', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const quests = await QuestService.getAllForAdmin();
    res.json({ quests });
  } catch (err) {
    next(err);
  }
});

router.post('/quests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createQuestSchema.parse(req.body);
    const quest = await QuestService.createQuest(req.user!.id, input);
    res.status(201).json({ quest });
  } catch (err) {
    next(err);
  }
});

router.patch('/quests/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateQuestSchema.parse(req.body);
    const quest = await QuestService.updateQuest(req.params.id, input);
    res.json({ quest });
  } catch (err) {
    next(err);
  }
});

// === QR Codes (US-09) ===
router.post('/quests/:id/qr', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
    const result = await QRService.generateCode(req.params.id, expiresAt);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/quests/:id/qr.png', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeQR = await db.qRCode.findFirst({
      where: { questId: req.params.id, active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeQR) {
      throw new NotFoundError('No active QR code for this quest', 'QR_NOT_FOUND');
    }

    const pngBuffer = await QRService.generatePNG(activeQR.token);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="quest-${req.params.id}-qr.png"`);
    res.send(pngBuffer);
  } catch (err) {
    next(err);
  }
});

// === Manual Verification Queue (US-10) ===
router.get('/checkins', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pending = await CheckInService.getPendingManualQueue();
    res.json({ checkIns: pending });
  } catch (err) {
    next(err);
  }
});

router.patch('/checkins/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = reviewCheckInSchema.parse(req.body);
    const result = await CheckInService.reviewManualCheckIn(req.user!.id, req.params.id, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// === Rewards Management (US-11) ===
router.get('/rewards', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rewards = await RewardService.getAllForAdmin();
    res.json({ rewards });
  } catch (err) {
    next(err);
  }
});

router.post('/rewards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createRewardSchema.parse(req.body);
    const reward = await RewardService.createReward(input);
    res.status(201).json({ reward });
  } catch (err) {
    next(err);
  }
});

router.patch('/rewards/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateRewardSchema.parse(req.body);
    const reward = await RewardService.updateReward(req.params.id, input);
    res.json({ reward });
  } catch (err) {
    next(err);
  }
});

// === Analytics & Stats (US-12) ===
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await StatsService.getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
