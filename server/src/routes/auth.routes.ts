import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { requireAuth } from '../middleware/auth.middleware';
import { ENV } from '../config/env';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = registerSchema.parse(req.body);
    const { user, token } = await AuthService.register(validated);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({
      user,
      message: 'Account created! Welcome to campus.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);
    const { user, token } = await AuthService.login(validated);

    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({
      user,
      message: 'Logged in successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
