import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { db } from '../utils/db';
import { NotFoundError } from '../utils/errors';

const router = Router();

router.use(requireAuth);

// GET /api/me/progress
// US-04: Total points, completed vs remaining quests
router.get('/progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        lifetimePoints: true,
        pointsBalance: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Get all published quests
    const publishedQuests = await db.quest.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        description: true,
        locationHint: true,
        pointValue: true,
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get student's verified check-ins
    const verifiedCheckIns = await db.checkIn.findMany({
      where: {
        userId,
        status: 'VERIFIED',
      },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            pointValue: true,
            category: true,
          },
        },
      },
      orderBy: { verifiedAt: 'desc' },
    });

    const completedQuestIds = new Set(verifiedCheckIns.map((ci) => ci.questId));
    const completedQuests = publishedQuests.filter((q) => completedQuestIds.has(q.id));
    const remainingQuests = publishedQuests.filter((q) => !completedQuestIds.has(q.id));

    res.json({
      user,
      points: {
        lifetimePoints: user.lifetimePoints,
        pointsBalance: user.pointsBalance,
      },
      stats: {
        totalPublishedQuests: publishedQuests.length,
        completedCount: completedQuests.length,
        remainingCount: remainingQuests.length,
        completionPercentage:
          publishedQuests.length > 0
            ? Math.round((completedQuests.length / publishedQuests.length) * 100)
            : 0,
      },
      completedQuests: verifiedCheckIns.map((ci) => ({
        checkInId: ci.id,
        questId: ci.questId,
        title: ci.quest.title,
        pointValue: ci.quest.pointValue,
        category: ci.quest.category,
        method: ci.method,
        verifiedAt: ci.verifiedAt,
      })),
      remainingQuests,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
