import { createServer } from 'http';
import dotenv from 'dotenv';
import app from './app';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the HTTP server with error handling and graceful shutdown
 */
const startServer = () => {
  const httpServer = createServer(app);

  const server = httpServer.listen(PORT, () => {
    logger.info(`============== SERVER STARTUP ==============`);
    logger.info(`API Status:   Running`);
    logger.info(`Environment:  ${NODE_ENV}`);
    logger.info(`Port:         ${PORT}`);
    logger.info(`Base URL:     http://localhost:${PORT}`);
    logger.info(`Started at:   ${new Date().toLocaleString()}`);
    logger.info(`============================================`);
  });

  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') throw error;

    switch (error.code) {
      case 'EACCES':
        logger.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
      case 'EADDRINUSE':
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      default:
        throw error;
    }
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      // Add database disconnection or other cleanup here if needed
      process.exit(0);
    });

    // If server takes too long to close, force exit
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
    // Recommended to exit and let a process manager restart in production
    if (NODE_ENV === 'production') {
      shutdown('UNHANDLED_REJECTION');
    }
  });
};

startServer();
