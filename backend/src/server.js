const app = require('./app');
const logger = require('./utils/logger');
const { pool } = require('./db/pool');

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
pool.query('SELECT NOW()')
  .then(() => {
    logger.info('✅ Database connection established');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, closing server gracefully');
      server.close(() => {
        logger.info('Server closed');
        pool.end();
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    logger.error('❌ Database connection failed', { error: error.message });
    process.exit(1);
  });
