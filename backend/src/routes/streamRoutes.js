import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

const createSchema = z.object({
  streamKeyId: z.string().min(1)
});

const updateSchema = z.object({
  viewerCount: z.number().int().nonnegative().optional(),
  isLive: z.boolean().optional()
});

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const streams = await prisma.stream.findMany({
    include: {
      streamKey: { select: { id: true, key: true, name: true, customSlug: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(streams);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const stream = await prisma.stream.create({
    data: {
      streamKeyId: parsed.data.streamKeyId,
      isLive: false,
      viewerCount: 0
    }
  });

  return res.status(201).json(stream);
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const stream = await prisma.stream.update({
    where: { id: req.params.id },
    data: parsed.data
  });

  return res.json(stream);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.stream.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

router.get('/status/:streamKey', async (req, res) => {
  const key = await prisma.streamKey.findFirst({
    where: {
      OR: [{ key: req.params.streamKey }, { customSlug: req.params.streamKey }]
    }
  });

  if (!key) {
    return res.status(404).json({ isLive: false, message: 'Stream key not found' });
  }

  const stream = await prisma.stream.findFirst({
    where: { streamKeyId: key.id },
    orderBy: { createdAt: 'desc' }
  });

  return res.json({
    isLive: stream?.isLive ?? false,
    startedAt: stream?.startedAt ?? null,
    viewerCount: stream?.viewerCount ?? 0,
    hlsUrl: `/hls/${key.key}/index.m3u8`
  });
});

export default router;
