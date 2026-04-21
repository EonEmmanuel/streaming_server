import express from 'express';
import { prisma } from '../config/prisma.js';

const router = express.Router();

router.get('/resolve', async (req, res) => {
  const host = (req.headers.host || '').split(':')[0];
  const streamKey = req.query.streamKey;

  let keyRecord = null;
  if (host) {
    const domainMapping = await prisma.domainMapping.findUnique({
      where: { domain: host },
      include: { streamKey: true }
    });

    if (domainMapping) {
      keyRecord = domainMapping.streamKey;
    }
  }

  if (!keyRecord && streamKey) {
    keyRecord = await prisma.streamKey.findFirst({
      where: {
        OR: [{ key: String(streamKey) }, { customSlug: String(streamKey) }],
        isActive: true
      }
    });
  }

  if (!keyRecord) {
    return res.status(404).json({ message: 'No stream mapping found' });
  }

  return res.json({
    streamKey: keyRecord.key,
    customSlug: keyRecord.customSlug,
    hlsPath: `/hls/${keyRecord.key}/index.m3u8`
  });
});

export default router;
