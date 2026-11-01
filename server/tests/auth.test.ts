import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../src/services/auth.service';
import { db } from '../src/utils/db';

describe('AuthService (US-01: Registration and Login)', () => {
  beforeEach(async () => {
    // Clean test user if exists
    await db.user.deleteMany({
      where: { email: { in: ['teststudent@vitapstudent.ac.in', 'hacker@gmail.com', 'outsider@college.edu'] } },
    });
  });

  it('allows registration with a valid @vitapstudent.ac.in email', async () => {
    const result = await AuthService.register({
      name: 'Test Student',
      email: 'teststudent@vitapstudent.ac.in',
      password: 'Password123!',
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('teststudent@vitapstudent.ac.in');
    expect(result.user.role).toBe('STUDENT');
    expect(result.token).toBeDefined();

    // Verify stored in DB
    const dbUser = await db.user.findUnique({ where: { email: 'teststudent@vitapstudent.ac.in' } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.passwordHash).not.toBe('Password123!'); // Hashed
  });

  it('rejects registration with a non-vitap email domain (e.g. gmail.com, college.edu)', async () => {
    await expect(
      AuthService.register({
        name: 'Hacker Joe',
        email: 'hacker@gmail.com',
        password: 'Password123!',
      })
    ).rejects.toThrowError(/@vitapstudent.ac.in/);

    await expect(
      AuthService.register({
        name: 'Old College User',
        email: 'outsider@college.edu',
        password: 'Password123!',
      })
    ).rejects.toThrowError(/@vitapstudent.ac.in/);
  });

  it('prevents duplicate email registration', async () => {
    await AuthService.register({
      name: 'Test Student',
      email: 'teststudent@vitapstudent.ac.in',
      password: 'Password123!',
    });

    await expect(
      AuthService.register({
        name: 'Duplicate Student',
        email: 'teststudent@vitapstudent.ac.in',
        password: 'AnotherPassword123!',
      })
    ).rejects.toThrowError(/already exists/);
  });

  it('authenticates valid credentials and rejects invalid passwords', async () => {
    await AuthService.register({
      name: 'Test Student',
      email: 'teststudent@vitapstudent.ac.in',
      password: 'Password123!',
    });

    // Valid login
    const loginRes = await AuthService.login({
      email: 'teststudent@vitapstudent.ac.in',
      password: 'Password123!',
    });
    expect(loginRes.token).toBeDefined();
    expect(loginRes.user.name).toBe('Test Student');

    // Invalid login
    await expect(
      AuthService.login({
        email: 'teststudent@vitapstudent.ac.in',
        password: 'WrongPassword',
      })
    ).rejects.toThrowError(/Invalid email or password/);
  });
});
