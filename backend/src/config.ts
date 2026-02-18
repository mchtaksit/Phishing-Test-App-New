import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  corsOrigin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || [],
  isProduction: process.env.NODE_ENV === 'production',
};
