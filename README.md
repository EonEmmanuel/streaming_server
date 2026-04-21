# Production-Ready Live Streaming Platform

Node.js + Prisma + Neon + Node-Media-Server + React reference implementation for RTMP ingest and HLS playback.

## Architecture

- **Ingest**: vMix pushes RTMP to `rtmp://server-ip/live/{streamKey}`
- **Transcoding/packaging**: Node-Media-Server with FFmpeg outputs HLS at `/hls/{streamKey}/index.m3u8`
- **API**: Express + JWT + Prisma (Neon PostgreSQL)
- **Frontend**: React admin, test page, and public playback page via `hls.js`

## Setup

1. Copy `.env.example` to `.env` and update credentials.
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Prepare database:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npm run prisma:generate
   node src/seedAdmin.js
   ```
4. Run services in separate terminals:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

## API Endpoints

- `POST /api/auth/login`
- `GET/POST/PATCH/DELETE /api/streams`
- `GET/POST/PATCH/DELETE /api/keys`
- `GET/POST /api/domains`
- `GET /api/streams/status/:streamKey`
- `GET /api/public/resolve?streamKey=<key-or-slug>`

## Frontend Routes

- `/admin/login`
- `/admin`
- `/test-stream`
- `/live/:streamKey`

## VMix Configuration

- RTMP URL: `rtmp://server-ip/live`
- Stream Key: use generated key from admin dashboard

## Custom Domain Notes

- Add entries in `DomainMapping` table via admin panel.
- Use NGINX or edge proxy to route `/live/*`, `/hls/*`, and `/api/public/*` as shown in `nginx.stream.conf`.
- Public playback uses host header resolution so `https://stream.domain.com/live/foo` can automatically resolve correct stream.

## Production Hardening Checklist

- Add rate limiting and request throttling.
- Run backend and frontend behind TLS (Let's Encrypt / managed certs).
- Use managed background process supervisor (systemd, PM2, or container orchestration).
- Add metrics/alerts (Prometheus, Grafana, or OpenTelemetry).
- Set signed JWT refresh flow and secret rotation policy.
