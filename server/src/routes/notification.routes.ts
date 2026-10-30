import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';

const router = Router();

router.use(requireAuth);

// GET /api/notifications
// US-07: In-app notifications
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user!.id);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user!.id);
    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all
router.post('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NotificationService.markAllAsRead(req.user!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
