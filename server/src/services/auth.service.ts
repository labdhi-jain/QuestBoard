import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../utils/db';
import { ENV } from '../config/env';
import { AppError, ConflictError, UnauthorizedError } from '../utils/errors';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { AuthUser } from '../middleware/auth.middleware';

export class AuthService {
  /**
   * Validates if the email belongs to an authorized college domain
   */
  static validateEmailDomain(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return ENV.ALLOWED_EMAIL_DOMAINS.some((allowed) => domain === allowed || domain.endsWith('.' + allowed));
  }

  /**
   * Registers a new student account
   * US-01: Rejects non-college email domains with a clear error
   */
  static async register(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
    const email = input.email.trim().toLowerCase();

    if (!this.validateEmailDomain(email)) {
      throw new AppError(
        `Invalid college email. Please use your official university email (@${ENV.ALLOWED_EMAIL_DOMAINS.join(', @')})`,
        400,
        'INVALID_EMAIL_DOMAIN'
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await db.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        role: 'STUDENT',
        lifetimePoints: 0,
        pointsBalance: 0,
      },
    });

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'STUDENT' | 'ADMIN',
      lifetimePoints: user.lifetimePoints,
      pointsBalance: user.pointsBalance,
    };

    const token = this.generateToken(authUser);
    return { user: authUser, token };
  }

  /**
   * Logs in a student or admin user
   */
  static async login(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
    const email = input.email.trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'STUDENT' | 'ADMIN',
      lifetimePoints: user.lifetimePoints,
      pointsBalance: user.pointsBalance,
    };

    const token = this.generateToken(authUser);
    return { user: authUser, token };
  }

  /**
   * Generates a signed JWT token
   */
  static generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lifetimePoints: user.lifetimePoints,
        pointsBalance: user.pointsBalance,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Returns fresh user profile by ID
   */
  static async getMe(userId: string): Promise<AuthUser> {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'STUDENT' | 'ADMIN',
      lifetimePoints: user.lifetimePoints,
      pointsBalance: user.pointsBalance,
    };
  }
}
