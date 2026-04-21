import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET', 'FFMPEG_PATH'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  rtmpPort: Number(process.env.RTMP_PORT ?? 1935),
  mediaHttpPort: Number(process.env.MEDIA_HTTP_PORT ?? 8000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  ffmpegPath: process.env.FFMPEG_PATH,
  baseDomain: process.env.BASE_DOMAIN ?? 'localhost'
};
