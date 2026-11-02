const { execSync } = require('child_process');
const path = require('path');

const serverDir = path.resolve(__dirname, '..');
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

console.log('🔄 Syncing database schema with DATABASE_URL:', dbUrl);

try {
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
    cwd: serverDir,
  });
  console.log('✅ Database schema pushed successfully.');
} catch (error) {
  console.error('❌ Failed to push database schema:', error.message);
  process.exit(1);
}
