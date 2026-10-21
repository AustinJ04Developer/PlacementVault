import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      console.log(`[PlacementVault API] Server is running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode.`);
      console.log(`[PlacementVault API] API Base URL: http://localhost:${ENV.PORT}/api/v1`);
    });

    const shutdown = async () => {
      console.log('\n[PlacementVault API] Gracefully shutting down...');
      server.close(() => {
        console.log('[PlacementVault API] Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[PlacementVault API] Startup failure:', error);
    process.exit(1);
  }
};

startServer();
