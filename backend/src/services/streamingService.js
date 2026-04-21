import NodeMediaServer from 'node-media-server';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

export async function resolveStreamKey(rawPath) {
  const streamKey = rawPath.split('/').pop();
  if (!streamKey) {
    return null;
  }

  return prisma.streamKey.findFirst({
    where: {
      key: streamKey,
      isActive: true
    }
  });
}

async function setLive(streamKeyId, isLive) {
  const latest = await prisma.stream.findFirst({
    where: { streamKeyId },
    orderBy: { createdAt: 'desc' }
  });

  if (latest && isLive) {
    return prisma.stream.update({
      where: { id: latest.id },
      data: {
        isLive: true,
        startedAt: latest.startedAt ?? new Date(),
        endedAt: null
      }
    });
  }

  if (latest && !isLive) {
    return prisma.stream.update({
      where: { id: latest.id },
      data: {
        isLive: false,
        endedAt: new Date()
      }
    });
  }

  return prisma.stream.create({
    data: {
      streamKeyId,
      isLive,
      startedAt: isLive ? new Date() : null,
      endedAt: null,
      viewerCount: 0
    }
  });
}

export function createMediaServer() {
  const nms = new NodeMediaServer({
    logType: 2,
    rtmp: {
      port: env.rtmpPort,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    },
    http: {
      port: env.mediaHttpPort,
      mediaroot: './media',
      allow_origin: '*'
    },
    trans: {
      ffmpeg: env.ffmpegPath,
      tasks: [
        {
          app: 'live',
          hls: true,
          hlsFlags: '[hls_time=2:hls_list_size=10:hls_flags=delete_segments]'
        }
      ]
    }
  });

  nms.on('prePublish', async (id, streamPath) => {
    try {
      const key = await resolveStreamKey(streamPath);
      if (!key) {
        const session = nms.getSession(id);
        session.reject();
      }
    } catch (_error) {
      const session = nms.getSession(id);
      session.reject();
    }
  });

  nms.on('postPublish', async (_id, streamPath) => {
    const key = await resolveStreamKey(streamPath);
    if (!key) return;
    await setLive(key.id, true);
  });

  nms.on('donePublish', async (_id, streamPath) => {
    const key = await resolveStreamKey(streamPath);
    if (!key) return;
    await setLive(key.id, false);
  });

  return nms;
}
