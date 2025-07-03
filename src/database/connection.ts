import { Pool, PoolConfig, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database connection configuration interface
 */
interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig(): DatabaseConfig {
  const config: DatabaseConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'todolist_db',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '2000', 10)
  };

  return config;
}

/**
 * Get database configuration for testing
 */
function getTestDatabaseConfig(): DatabaseConfig {
  const config = getDatabaseConfig();
  return {
    ...config,
    database: process.env.TEST_DATABASE_NAME || 'todolist_test_db'
  };
}

/**
 * Database connection manager
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool | null = null;
  private isConnected = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initialize database connection pool
   */
  async connect(isTest = false): Promise<Pool> {
    if (this.pool && this.isConnected) {
      return this.pool;
    }

    const config = isTest ? getTestDatabaseConfig() : getDatabaseConfig();

    this.pool = new Pool(config);

    // Test the connection
    try {
      const client = await this.pool.connect();
      console.log(`✅ Database connected successfully to ${config.database}`);
      client.release();
      this.isConnected = true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }

    // Handle pool errors
    this.pool.on('error', (err: Error) => {
      console.error('❌ Unexpected database pool error:', err);
      this.isConnected = false;
    });

    // Handle pool connection events
    this.pool.on('connect', () => {
      console.log('🔌 New database client connected');
    });

    this.pool.on('remove', () => {
      console.log('🔌 Database client removed from pool');
    });

    return this.pool;
  }

  /**
   * Get the current database pool
   */
  getPool(): Pool {
    if (!this.pool || !this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Check if database is connected
   */
  isHealthy(): boolean {
    return this.isConnected && this.pool !== null;
  }

  /**
   * Test database connectivity
   */
  async testConnection(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  }> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('🔌 Database connections closed');
      this.pool = null;
      this.isConnected = false;
    }
  }

  /**
   * Execute a query with automatic connection handling
   */
  async query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
    const pool = this.getPool();
    const result = await pool.query(text, params);
    return result.rows as T[];
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

/**
 * Get singleton database connection instance
 */
export const db = DatabaseConnection.getInstance();

/**
 * Create a new database pool (for testing or specific use cases)
 */
export function createDatabasePool(isTest = false): Pool {
  const config = isTest ? getTestDatabaseConfig() : getDatabaseConfig();
  return new Pool(config);
}

/**
 * Parse database URL into configuration
 */
export function parseDatabaseUrl(url: string): Partial<DatabaseConfig> {
  if (!url) {
    throw new Error('Database URL is required');
  }

  try {
    const dbUrl = new URL(url);
    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10) || 5432,
      database: dbUrl.pathname.slice(1),
      user: dbUrl.username,
      password: dbUrl.password,
      ssl: dbUrl.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : false
    };
  } catch (error) {
    throw new Error(`Invalid database URL: ${error}`);
  }
}
