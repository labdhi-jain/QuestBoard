import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding QuestBoard database...');

  // Clean existing tables in correct order
  await db.notification.deleteMany();
  await db.rewardRedemption.deleteMany();
  await db.reward.deleteMany();
  await db.checkIn.deleteMany();
  await db.qRCode.deleteMany();
  await db.quest.deleteMany();
  await db.user.deleteMany();

  // 1. Create Admin
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await db.user.create({
    data: {
      name: 'Campus Orientation Admin',
      email: 'admin@college.edu',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      lifetimePoints: 0,
      pointsBalance: 0,
    },
  });
  console.log('👤 Admin created: admin@college.edu / Admin@123');

  // 2. Create Quests
  // Quest 1: Silent Floor
  const quest1 = await db.quest.create({
    data: {
      title: 'Find the Silent Floor',
      description: 'Head up to the library 4th floor quiet study zone and experience the absolute silence for deep focus.',
      locationHint: 'Library, 4th Floor North Wing (by the study carrels)',
      pointValue: 20,
      category: 'ACADEMICS',
      verificationType: 'QR',
      status: 'PUBLISHED',
      createdById: admin.id,
    },
  });

  // Quest 2: Grab a Coffee
  const quest2 = await db.quest.create({
    data: {
      title: 'Grab a Coffee at the Canteen',
      description: 'Visit the central student canteen, grab your favorite brew, and say hello to the student baristas.',
      locationHint: 'Student Union, Ground Floor Central Dining Hall',
      pointValue: 30,
      category: 'SOCIAL',
      verificationType: 'QR',
      status: 'PUBLISHED',
      createdById: admin.id,
    },
  });

  // Quest 3: Join a Club
  const quest3 = await db.quest.create({
    data: {
      title: 'Join a Student Club',
      description: 'Browse the student clubs directory at the Student Life desk and register your interest in a society.',
      locationHint: 'Student Activities Pavilion, Desk 4',
      pointValue: 25,
      category: 'SOCIAL',
      verificationType: 'QR',
      status: 'PUBLISHED',
      createdById: admin.id,
    },
  });

  // Quest 4: Locate Department Office
  const quest4 = await db.quest.create({
    data: {
      title: 'Locate Your Department Office',
      description: 'Find the academic office for your major so you know where to drop off forms and meet your advisor.',
      locationHint: 'Academic Quad, Hall of Science & Engineering, Room 204',
      pointValue: 15,
      category: 'ACADEMICS',
      verificationType: 'QR',
      status: 'PUBLISHED',
      createdById: admin.id,
    },
  });

  // Quest 5: Health Centre
  const quest5 = await db.quest.create({
    data: {
      title: 'Find the Campus Health Centre',
      description: 'Know where to go for wellness checks, vaccinations, and first aid assistance.',
      locationHint: 'Wellness Complex, Building C, Room 102',
      pointValue: 25,
      category: 'WELLNESS',
      verificationType: 'QR',
      status: 'PUBLISHED',
      createdById: admin.id,
    },
  });

  // Quest 6: Rooftop Garden (Has Prerequisite: Quest 1 "Find the Silent Floor")
  const quest6 = await db.quest.create({
    data: {
      title: 'Discover the Secret Rooftop Garden',
      description: 'Take the stairwell past the quiet floor to the ecological green roof sanctuary with skyline views.',
      locationHint: 'Library East Stairwell, Roof Access Door',
      pointValue: 35,
      category: 'EXPLORE',
      verificationType: 'QR',
      status: 'PUBLISHED',
      prerequisiteQuestId: quest1.id,
      createdById: admin.id,
    },
  });

  // Quest 7: Meet a Senior Mentor (MANUAL verification)
  const quest7 = await db.quest.create({
    data: {
      title: 'Meet a Senior Mentor',
      description: 'Have a chat with an orientation peer mentor or senior student and ask for their #1 campus tip.',
      locationHint: 'Orientation Lounge / Campus Quad Benches',
      pointValue: 40,
      category: 'SOCIAL',
      verificationType: 'MANUAL',
      status: 'PUBLISHED',
      createdById: admin.id,
    },
  });

  // Quest 8: Gym & Recreation
  const quest8 = await db.quest.create({
    data: {
      title: 'Gym & Recreation Induction',
      description: 'Activate your recreational access pass and take a 5-minute induction tour of the athletic center.',
      locationHint: 'Varsity Recreation Center, Front Reception',
      pointValue: 20,
      category: 'WELLNESS',
      verificationType: 'QR',
      status: 'PUBLISHED',
      createdById: admin.id,
    },
  });

  // Quest 9: Draft Quest (Not published yet)
  await db.quest.create({
    data: {
      title: 'Attend the Career Fair Keynote',
      description: 'Draft quest for week 4 career readiness week.',
      locationHint: 'Grand Auditorium',
      pointValue: 50,
      category: 'ACADEMICS',
      verificationType: 'QR',
      status: 'DRAFT',
      createdById: admin.id,
    },
  });

  console.log('📜 8 Published Quests + 1 Draft Quest created');

  // 3. Create QR Codes
  // Standard active QR codes
  await db.qRCode.create({
    data: {
      questId: quest1.id,
      token: 'SILENT-FLOOR-2026',
      active: true,
    },
  });

  await db.qRCode.create({
    data: {
      questId: quest2.id,
      token: 'COFFEE-CANTEEN-2026',
      active: true,
    },
  });

  await db.qRCode.create({
    data: {
      questId: quest3.id,
      token: 'JOIN-CLUB-2026',
      active: true,
    },
  });

  await db.qRCode.create({
    data: {
      questId: quest4.id,
      token: 'DEPT-OFFICE-2026',
      active: true,
    },
  });

  await db.qRCode.create({
    data: {
      questId: quest5.id,
      token: 'HEALTH-CTR-2026',
      active: true,
    },
  });

  await db.qRCode.create({
    data: {
      questId: quest6.id,
      token: 'ROOFTOP-GARDEN-2026',
      active: true,
    },
  });

  await db.qRCode.create({
    data: {
      questId: quest8.id,
      token: 'GYM-INDUCTION-2026',
      active: true,
    },
  });

  // Deliberately EXPIRED QR Code for Live Demo error state testing
  await db.qRCode.create({
    data: {
      questId: quest1.id,
      token: 'EXPIRED-DEMO-CODE',
      active: true,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired 24 hours ago
    },
  });
  console.log('🔲 QR codes generated (including EXPIRED-DEMO-CODE)');

  // 4. Create Demo Students with points spread and tie-break
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  // Base timestamps
  const t0 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
  const tAishaLatest = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (Earlier completion)
  const tBenLatest = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);   // 1 day ago (Later completion)

  // Student 1: Aisha Patel (50 pts, completed tAishaLatest) -> Tied with Ben, Aisha wins tie-break!
  const aisha = await db.user.create({
    data: {
      name: 'Aisha Patel',
      email: 'aisha@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      lifetimePoints: 50,
      pointsBalance: 50,
      createdAt: t0,
    },
  });
  await db.checkIn.create({
    data: {
      userId: aisha.id,
      questId: quest1.id,
      status: 'VERIFIED',
      method: 'QR',
      verifiedAt: new Date(t0.getTime() + 10000),
    },
  });
  await db.checkIn.create({
    data: {
      userId: aisha.id,
      questId: quest2.id,
      status: 'VERIFIED',
      method: 'QR',
      verifiedAt: tAishaLatest,
    },
  });

  // Student 2: Ben Zhang (50 pts, completed tBenLatest) -> Tied with Aisha, ranked 2nd because later
  const ben = await db.user.create({
    data: {
      name: 'Ben Zhang',
      email: 'ben@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      lifetimePoints: 50,
      pointsBalance: 50,
      createdAt: t0,
    },
  });
  await db.checkIn.create({
    data: {
      userId: ben.id,
      questId: quest3.id,
      status: 'VERIFIED',
      method: 'QR',
      verifiedAt: new Date(t0.getTime() + 20000),
    },
  });
  await db.checkIn.create({
    data: {
      userId: ben.id,
      questId: quest5.id,
      status: 'VERIFIED',
      method: 'QR',
      verifiedAt: tBenLatest,
    },
  });

  // Student 3: Carlos Gomez (30 pts)
  const carlos = await db.user.create({
    data: {
      name: 'Carlos Gomez',
      email: 'carlos@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      lifetimePoints: 30,
      pointsBalance: 30,
      createdAt: t0,
    },
  });
  await db.checkIn.create({
    data: {
      userId: carlos.id,
      questId: quest2.id,
      status: 'VERIFIED',
      method: 'QR',
      verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 4: Dana Lee (20 pts)
  const dana = await db.user.create({
    data: {
      name: 'Dana Lee',
      email: 'dana@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      lifetimePoints: 20,
      pointsBalance: 20,
      createdAt: t0,
    },
  });
  await db.checkIn.create({
    data: {
      userId: dana.id,
      questId: quest1.id,
      status: 'VERIFIED',
      method: 'QR',
      verifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Student 5: Evan Wright (0 pts - Freshie)
  await db.user.create({
    data: {
      name: 'Evan Wright',
      email: 'evan@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      lifetimePoints: 0,
      pointsBalance: 0,
      createdAt: new Date(),
    },
  });

  // Pending Manual CheckIn for Quest 7 to populate the Admin Verification Queue!
  await db.checkIn.create({
    data: {
      userId: carlos.id,
      questId: quest7.id,
      status: 'PENDING',
      method: 'MANUAL',
      note: 'Met senior mentor Sarah at the quad picnic table. She gave great advice on registering for CS201!',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  });
  console.log('👥 5 Demo students seeded + 1 pending manual check-in in queue');

  // 5. Create Rewards
  await db.reward.createMany({
    data: [
      {
        title: 'College Vinyl Sticker Pack',
        description: 'Pack of 5 holographic matte vinyl stickers featuring campus mascots & retro landmarks.',
        pointCost: 15,
        stock: 25,
        active: true,
      },
      {
        title: 'Campus Canteen Free Coffee Voucher',
        description: 'Enjoy any hot specialty drink or cold brew on the house at the student center cafe.',
        pointCost: 30,
        stock: 15,
        active: true,
      },
      {
        title: 'Exclusive QuestBoard Enamel Pin',
        description: 'Limited edition gold-plated enamel pin for early campus pioneers (Only 1 left!).',
        pointCost: 50,
        stock: 1, // To demo sold-out state upon redemption
        active: true,
      },
      {
        title: 'University Bookstore $15 Gift Card',
        description: 'Redeemable for textbooks, college apparel, or school supplies at the official store.',
        pointCost: 80,
        stock: 5,
        active: true,
      },
    ],
  });
  console.log('🎁 4 Rewards created (including 1 with stock=1 for sold-out testing)');

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
