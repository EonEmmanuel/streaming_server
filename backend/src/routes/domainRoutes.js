import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

const domainSchema = z.object({
  domain: z.string().min(3),
  streamKeyId: z.string().min(1)
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const parsed = domainSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const mapping = await prisma.domainMapping.create({
    data: parsed.data,
    include: { streamKey: true }
  });

  return res.status(201).json(mapping);
});

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const mappings = await prisma.domainMapping.findMany({
    include: {
      streamKey: { select: { id: true, key: true, name: true, customSlug: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return res.json(mappings);
});

export default router;
