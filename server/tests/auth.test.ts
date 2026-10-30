import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../src/services/auth.service';
import { db } from '../src/utils/db';

describe('AuthService (US-01: Registration and Login)', () => {
  beforeEach(async () => {
    // Clean test user if exists
    await db.user.deleteMany({
      where: { email: { in: ['teststudent@college.edu', 'hacker@gmail.com'] } },
    });
  });

  it('allows registration with a valid college email domain', async () => {
    const result = await AuthService.register({
      name: 'Test Student',
      email: 'teststudent@college.edu',
      password: 'Password123!',
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('teststudent@college.edu');
    expect(result.user.role).toBe('STUDENT');
    expect(result.token).toBeDefined();

    // Verify stored in DB
    const dbUser = await db.user.findUnique({ where: { email: 'teststudent@college.edu' } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.passwordHash).not.toBe('Password123!'); // Hashed
  });

  it('rejects registration with a non-college email domain', async () => {
    await expect(
      AuthService.register({
        name: 'Hacker Joe',
        email: 'hacker@gmail.com',
        password: 'Password123!',
      })
    ).rejects.toThrowError(/Invalid college email/);
  });

  it('prevents duplicate email registration', async () => {
    await AuthService.register({
      name: 'Test Student',
      email: 'teststudent@college.edu',
      password: 'Password123!',
    });

    await expect(
      AuthService.register({
        name: 'Duplicate Student',
        email: 'teststudent@college.edu',
        password: 'AnotherPassword123!',
      })
    ).rejects.toThrowError(/already exists/);
  });

  it('authenticates valid credentials and rejects invalid passwords', async () => {
    await AuthService.register({
      name: 'Test Student',
      email: 'teststudent@college.edu',
      password: 'Password123!',
    });

    // Valid login
    const loginRes = await AuthService.login({
      email: 'teststudent@college.edu',
      password: 'Password123!',
    });
    expect(loginRes.token).toBeDefined();
    expect(loginRes.user.name).toBe('Test Student');

    // Invalid login
    await expect(
      AuthService.login({
        email: 'teststudent@college.edu',
        password: 'WrongPassword',
      })
    ).rejects.toThrowError(/Invalid email or password/);
  });
});
