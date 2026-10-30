import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'questboard-dev-secret-key-12345',
  ALLOWED_EMAIL_DOMAINS: (process.env.ALLOWED_EMAIL_DOMAIN || 'college.edu')
    .split(',')
    .map((d) => d.trim().toLowerCase()),
  APP_URL: process.env.APP_URL || 'http://localhost:5173',
};
