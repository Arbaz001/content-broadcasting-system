// ============================================================
// Server Entry Point — Bootstrap and start
// ============================================================

require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/models');
const { initRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 3000;

/**
 * Start the server:
 * 1. Test database connection
 * 2. Sync models (create tables if not exist)
 * 3. Initialize Redis (optional)
 * 4. Start listening
 */
async function startServer() {
  try {
    // 1. Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // 2. Sync models — creates tables if they don't exist
    //    In production, use migrations instead of sync
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized.');

    // 3. Initialize Redis (graceful — app works without it)
    initRedis();

    // 4. Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Content Broadcasting System is running!`);
      console.log(`   Server:    http://localhost:${PORT}`);
      console.log(`   API Docs:  http://localhost:${PORT}/api-docs`);
      console.log(`   Health:    http://localhost:${PORT}/api/health`);
      console.log(`   Env:       ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();
