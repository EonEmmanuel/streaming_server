import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import keyRoutes from './routes/keyRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import streamRoutes from './routes/streamRoutes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(morgan('combined'));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/streams', streamRoutes);
  app.use('/api/keys', keyRoutes);
  app.use('/api/domains', domainRoutes);
  app.use('/api/public', publicRoutes);

  app.use((error, _req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
