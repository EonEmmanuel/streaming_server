import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(2),
  userId: z.string().min(1),
  customSlug: z.string().min(2).max(128).optional()
});

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const keys = await prisma.streamKey.findMany({
    include: {
      user: { select: { id: true, username: true } },
      streams: { take: 1, orderBy: { createdAt: 'desc' } },
      domainMaps: true
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(keys);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const key = await prisma.streamKey.create({
    data: {
      key: crypto.randomBytes(16).toString('hex'),
      name: parsed.data.name,
      userId: parsed.data.userId,
      customSlug: parsed.data.customSlug
    }
  });

  return res.status(201).json(key);
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const schema = z.object({
    isActive: z.boolean().optional(),
    customSlug: z.string().min(2).max(128).nullable().optional(),
    name: z.string().min(2).optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const updated = await prisma.streamKey.update({
    where: { id: req.params.id },
    data: parsed.data
  });

  res.json(updated);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.streamKey.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
