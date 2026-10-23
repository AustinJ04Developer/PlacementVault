import dotenv from 'dotenv';
import path from 'path';

// Load .env from cwd or common locations
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_vault',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_placement_vault_jwt_key_2026_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  FRONTEND_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@placementvault.edu').toLowerCase().trim(),
  ADMIN_PASSWORD: (process.env.ADMIN_PASSWORD || 'AdminSecure@2026!').trim(),
};

