import { App } from './app.js';
import { db } from './database/connection.js';

/**
 * Server startup and initialization
 */
async function startServer(): Promise<void> {
  try {
    console.log('🚀 Starting TODO List API Server...');

    // Initialize database connection (if using SQL repository)
    if (process.env.REPOSITORY_TYPE === 'sql') {
      console.log('📦 Initializing database connection...');
      await db.connect();

      // Test database connectivity
      const isHealthy = await db.testConnection();
      if (!isHealthy) {
        throw new Error('Database connection test failed');
      }
      console.log('✅ Database connection established');
    } else {
      console.log('📦 Using memory repository (no database required)');
    }

    // Create and configure Express app
    const app = new App();

    // Start the server
    await app.start();

    console.log('✅ Server started successfully');
  } catch (error) {
    console.error('❌ Failed to start server:', error);

    // Cleanup on startup failure
    if (db.isHealthy()) {
      await db.close();
    }

    process.exit(1);
  }
}

/**
 * Graceful shutdown handling
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close database connections
    if (db.isHealthy()) {
      console.log('🔌 Closing database connections...');
      await db.close();
      console.log('✅ Database connections closed');
    }

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION').catch(() => {
    process.exit(1);
  });
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('💥 Unhandled Promise Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION').catch(() => {
    process.exit(1);
  });
});

/**
 * Handle process termination signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Handle process warnings
 */
process.on('warning', (warning: Error) => {
  console.warn('⚠️  Process Warning:', warning.name, warning.message);
});

// Start the server
startServer().catch(error => {
  console.error('💥 Server startup failed:', error);
  process.exit(1);
});

export { startServer };
