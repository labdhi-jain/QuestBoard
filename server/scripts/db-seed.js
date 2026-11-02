const { execSync } = require('child_process');
const path = require('path');

const serverDir = path.resolve(__dirname, '..');
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

console.log('🌱 Seeding database with DATABASE_URL:', dbUrl);

try {
  execSync('npx tsx prisma/seed.ts', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
    cwd: serverDir,
  });
  console.log('✅ Database seeded successfully.');
} catch (error) {
  console.error('❌ Failed to seed database:', error.message);
  process.exit(1);
}
