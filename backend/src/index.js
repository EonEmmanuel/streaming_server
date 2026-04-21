import { createApp } from './app.js';
import { env } from './config/env.js';
import { createMediaServer } from './services/streamingService.js';

const app = createApp();
const mediaServer = createMediaServer();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${env.port}`);
});

mediaServer.run();
