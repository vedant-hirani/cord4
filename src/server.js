import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import logger from './config/logger.js';

let server;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Start Listening on Configured Port
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port: ${env.PORT}`);
    });

  } catch (error) {
    logger.error(`Fatal crash occurred during bootstrap: ${error.message}`);
    process.exit(1);
  }
};

// 3. Graceful Shutdown & Unhandled Exception Triggers
const handleFatalError = (error, origin) => {
  logger.error(`💥 Unhandled Exception / Rejection at ${origin}: ${error.message}`);
  if (error.stack) {
    logger.debug(error.stack);
  }

  if (server) {
    logger.warn('⚠️ Closing down HTTP server connection pool gracefully...');
    server.close(() => {
      logger.info('💤 HTTP Server closed. Exiting process.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => handleFatalError(err, 'uncaughtException'));
process.on('unhandledRejection', (err) => handleFatalError(err, 'unhandledRejection'));

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Initiating graceful shutdown.');
  if (server) {
    server.close(() => {
      logger.info('💤 Process terminated gracefully.');
    });
  }
});

// Boot the server
startServer();
