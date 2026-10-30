import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { CheckInService } from '../services/checkin.service';
import { scanCheckInSchema, manualCheckInSchema } from '../validators/checkin.validator';

const router = Router();

// POST /api/checkins/scan
// US-03: QR scan check-in
router.post('/scan', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = scanCheckInSchema.parse(req.body);
    const result = await CheckInService.scanCheckIn(req.user!.id, token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/checkins/manual
// US-10: Student submits "I did it" for manual verification
router.post('/manual', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { questId, note } = manualCheckInSchema.parse(req.body);
    const result = await CheckInService.submitManualCheckIn(req.user!.id, questId, note);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
