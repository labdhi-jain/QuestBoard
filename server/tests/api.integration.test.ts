import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('QuestBoard Full RESTful API Integration Test', () => {
  let studentCookie: string;
  let adminCookie: string;
  let demoQuestId: string;
  let demoToken: string;

  it('Health Check responds with 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('US-01: Admin Login succeeds and sets cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@college.edu', password: 'Admin@123' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.headers['set-cookie']).toBeDefined();
    adminCookie = res.headers['set-cookie'][0];
  });

  it('US-01: Student Login succeeds and sets cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aisha@college.edu', password: 'Student@123' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('STUDENT');
    expect(res.headers['set-cookie']).toBeDefined();
    studentCookie = res.headers['set-cookie'][0];
  });

  it('US-01: Registration rejects invalid email domain with clear 400 error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hacker Dave',
        email: 'dave@gmail.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_EMAIL_DOMAIN');
    expect(res.body.error.message).toMatch(/Invalid college email/);
  });

  it('US-02: Student browses quests with computed per-student statuses', async () => {
    const res = await request(app)
      .get('/api/quests')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.quests.length).toBeGreaterThanOrEqual(8);

    // Aisha has completed Quest 1 and Quest 2
    const quest1 = res.body.quests.find((q: any) => q.title === 'Find the Silent Floor');
    expect(quest1.studentStatus).toBe('COMPLETED');

    demoQuestId = quest1.id;
  });

  it('US-08: Admin creates a new quest and publishes it', async () => {
    const res = await request(app)
      .post('/api/admin/quests')
      .set('Cookie', adminCookie)
      .send({
        title: 'Visit Campus Art Gallery',
        description: 'Explore the modern sculpture wing and sketch your favorite piece.',
        locationHint: 'Fine Arts Building, 1st Floor Atrium',
        pointValue: 30,
        category: 'EXPLORE',
        verificationType: 'QR',
        status: 'PUBLISHED',
      });

    expect(res.status).toBe(201);
    expect(res.body.quest.title).toBe('Visit Campus Art Gallery');
    expect(res.body.quest.pointValue).toBe(30);

    const newQuestId = res.body.quest.id;

    // US-09: Generate QR Code for this new quest
    const qrRes = await request(app)
      .post(`/api/admin/quests/${newQuestId}/qr`)
      .set('Cookie', adminCookie)
      .send({});

    expect(qrRes.status).toBe(201);
    expect(qrRes.body.qrCode.token).toBeDefined();
    demoToken = qrRes.body.qrCode.token;

    // Test PNG generation endpoint
    const pngRes = await request(app)
      .get(`/api/admin/quests/${newQuestId}/qr.png`)
      .set('Cookie', adminCookie);

    expect(pngRes.status).toBe(200);
    expect(pngRes.headers['content-type']).toBe('image/png');
  });

  it('US-03: Student scans the freshly generated QR code and earns points', async () => {
    // Register a fresh student to test check-in
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New Scan Tester',
        email: 'scantester@college.edu',
        password: 'Password123!',
      });
    expect(regRes.status).toBe(201);
    const newStudentCookie = regRes.headers['set-cookie'][0];

    // Scan the token
    const scanRes = await request(app)
      .post('/api/checkins/scan')
      .set('Cookie', newStudentCookie)
      .send({ token: demoToken });

    expect(scanRes.status).toBe(200);
    expect(scanRes.body.pointsAwarded).toBe(30);
    expect(scanRes.body.lifetimePoints).toBe(30);
    expect(scanRes.body.pointsBalance).toBe(30);

    // Duplicate scan must return 409 friendly already-completed
    const dupRes = await request(app)
      .post('/api/checkins/scan')
      .set('Cookie', newStudentCookie)
      .send({ token: demoToken });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('ALREADY_COMPLETED');
  });

  it('US-05: Leaderboard returns top 20 with tie-break and user personal rank', async () => {
    const res = await request(app)
      .get('/api/leaderboard')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.topStudents.length).toBeGreaterThanOrEqual(2);
    expect(res.body.myRank).toBeDefined();
    expect(res.body.myRank.name).toBe('Aisha Patel');
  });

  it('US-10: Student submits manual check-in and Admin reviews/approves it', async () => {
    // Find the manual quest
    const questsRes = await request(app)
      .get('/api/quests')
      .set('Cookie', studentCookie);
    const manualQuest = questsRes.body.quests.find((q: any) => q.verificationType === 'MANUAL');

    // Create a fresh student for manual submission
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Manual Queue Tester',
        email: 'manualqueue@college.edu',
        password: 'Password123!',
      });
    const queueStudentCookie = regRes.headers['set-cookie'][0];

    // Student submits "I did it"
    const submitRes = await request(app)
      .post('/api/checkins/manual')
      .set('Cookie', queueStudentCookie)
      .send({
        questId: manualQuest.id,
        note: 'Met senior mentor Sarah at student union!',
      });
    expect(submitRes.status).toBe(201);
    const submittedId = submitRes.body.id;

    // Admin checks pending queue
    const queueRes = await request(app)
      .get('/api/admin/checkins')
      .set('Cookie', adminCookie);

    expect(queueRes.status).toBe(200);
    expect(queueRes.body.checkIns.some((ci: any) => ci.id === submittedId)).toBe(true);

    // Approve the check-in
    const approveRes = await request(app)
      .patch(`/api/admin/checkins/${submittedId}`)
      .set('Cookie', adminCookie)
      .send({ status: 'VERIFIED' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe('VERIFIED');
  });

  it('US-12: Admin stats dashboard returns overview counts and quest completion metrics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.overview.totalStudents).toBeGreaterThan(0);
    expect(res.body.questAnalytics.length).toBeGreaterThan(0);
  });
});
