import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/prisma.js';
import { startSlaMonitor } from './jobs/slaMonitorJob.js';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    startSlaMonitor();

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();
