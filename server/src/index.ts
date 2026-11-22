import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { initSocketServer } from './sockets/socketServer';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.IO with Real-time event streams
  initSocketServer(server);

  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 DATAPULSE Backend Server running on port ${config.port}`);
    console.log(`🔗 REST API base URL: http://localhost:${config.port}/api/v1`);
    console.log(`⚡ WebSocket Server: ws://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });

  const shutdown = () => {
    console.log('Stopping server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

