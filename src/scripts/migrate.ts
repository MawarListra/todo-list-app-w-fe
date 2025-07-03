#!/usr/bin/env tsx

/**
 * Database Migration Runner
 *
 * This script runs database migrations in order, tracks which migrations
 * have been applied, and provides rollback functionality.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'todolist',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

interface MigrationFile {
  filename: string;
  fullPath: string;
  description: string;
  version: string;
  content: string;
  checksum: string;
}

interface MigrationRecord {
  id: number;
  filename: string;
  description: string;
  version: string;
  checksum: string;
  applied_at: Date;
  execution_time_ms: number;
  success: boolean;
  error_message?: string;
}

class MigrationRunner {
  private pool: Pool;
  private migrationsDir: string;

  constructor() {
    this.pool = new Pool(dbConfig);
    this.migrationsDir = join(__dirname, '../../migrations');
  }

  /**
   * Initialize the migration tracking table
   */
  async initializeMigrationTable(): Promise<void> {
    const client = await this.pool.connect();
    try {
      const trackerSql = await fs.readFile(
        join(this.migrationsDir, 'migration_tracker.sql'),
        'utf8'
      );
      await client.query(trackerSql);
      console.log('✅ Migration tracking table initialized');
    } catch (error) {
      console.error('❌ Failed to initialize migration table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all migration files from the migrations directory
   */
  async getMigrationFiles(): Promise<MigrationFile[]> {
    try {
      const files = await fs.readdir(this.migrationsDir);
      const migrationFiles = files
        .filter(file => file.endsWith('.sql') && file !== 'migration_tracker.sql')
        .sort(); // Ensure files are processed in order

      const migrations: MigrationFile[] = [];

      for (const filename of migrationFiles) {
        const fullPath = join(this.migrationsDir, filename);
        const content = await fs.readFile(fullPath, 'utf8');
        const checksum = createHash('sha256').update(content).digest('hex');

        // Extract description and version from the SQL file comments
        const descriptionMatch = content.match(/-- Description: (.+)/);
        const versionMatch = content.match(/-- Version: (.+)/);

        migrations.push({
          filename,
          fullPath,
          description: descriptionMatch?.[1]?.trim() || '',
          version: versionMatch?.[1]?.trim() || '1.0',
          content,
          checksum
        });
      }

      return migrations;
    } catch (error) {
      console.error('❌ Failed to read migration files:', error);
      throw error;
    }
  }

  /**
   * Get applied migrations from the database
   */
  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM schema_migrations ORDER BY applied_at ASC');
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get applied migrations:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Apply a single migration
   */
  async applyMigration(migration: MigrationFile): Promise<void> {
    const client = await this.pool.connect();
    const startTime = Date.now();

    try {
      await client.query('BEGIN');

      console.log(`📄 Applying migration: ${migration.filename}`);
      console.log(`   Description: ${migration.description}`);

      // Execute the migration
      await client.query(migration.content);

      const executionTime = Date.now() - startTime;

      // Record the migration in the tracking table
      await client.query(
        `INSERT INTO schema_migrations 
         (filename, description, version, checksum, execution_time_ms, success)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          migration.filename,
          migration.description,
          migration.version,
          migration.checksum,
          executionTime,
          true
        ]
      );

      await client.query('COMMIT');
      console.log(`✅ Migration applied successfully (${executionTime}ms)`);
    } catch (error) {
      await client.query('ROLLBACK');

      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Record the failed migration
      try {
        await client.query(
          `INSERT INTO schema_migrations 
           (filename, description, version, checksum, execution_time_ms, success, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            migration.filename,
            migration.description,
            migration.version,
            migration.checksum,
            executionTime,
            false,
            errorMessage
          ]
        );
      } catch (recordError) {
        console.error('❌ Failed to record migration failure:', recordError);
      }

      console.error(`❌ Migration failed: ${migration.filename}`);
      console.error(`   Error: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      console.log('🚀 Starting database migrations...');

      // Initialize migration table if needed
      await this.initializeMigrationTable();

      // Get all migration files and applied migrations
      const migrationFiles = await this.getMigrationFiles();
      const appliedMigrations = await this.getAppliedMigrations();

      const appliedFilenames = new Set(
        appliedMigrations.filter(m => m.success).map(m => m.filename)
      );

      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        migration => !appliedFilenames.has(migration.filename)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found. Database is up to date.');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
      pendingMigrations.forEach(migration => {
        console.log(`   - ${migration.filename}: ${migration.description}`);
      });

      // Apply each pending migration
      for (const migration of pendingMigrations) {
        await this.applyMigration(migration);
      }

      console.log('✅ All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration process failed:', error);
      process.exit(1);
    }
  }

  /**
   * Show migration status
   */
  async showStatus(): Promise<void> {
    try {
      await this.initializeMigrationTable();

      const migrationFiles = await this.getMigrationFiles();
      const appliedMigrations = await this.getAppliedMigrations();

      console.log('\n📊 Migration Status:');
      console.log('==================');

      const appliedMap = new Map(appliedMigrations.map(m => [m.filename, m]));

      for (const file of migrationFiles) {
        const applied = appliedMap.get(file.filename);
        if (applied) {
          const status = applied.success ? '✅ Applied' : '❌ Failed';
          const time = applied.applied_at.toISOString().split('T')[0];
          console.log(`${status} | ${file.filename} | ${time} | ${file.description}`);
        } else {
          console.log(`⏳ Pending | ${file.filename} | | ${file.description}`);
        }
      }

      console.log(`\nTotal migrations: ${migrationFiles.length}`);
      console.log(`Applied: ${appliedMigrations.filter(m => m.success).length}`);
      console.log(`Failed: ${appliedMigrations.filter(m => !m.success).length}`);
      console.log(
        `Pending: ${migrationFiles.length - appliedMigrations.filter(m => m.success).length}`
      );
    } catch (error) {
      console.error('❌ Failed to show migration status:', error);
      process.exit(1);
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'run';
  const runner = new MigrationRunner();

  try {
    switch (command) {
      case 'run':
        await runner.runMigrations();
        break;
      case 'status':
        await runner.showStatus();
        break;
      case 'init':
        await runner.initializeMigrationTable();
        console.log('✅ Migration tracking table initialized');
        break;
      default:
        console.log('Usage: npm run migrate [run|status|init]');
        console.log('  run    - Apply all pending migrations (default)');
        console.log('  status - Show migration status');
        console.log('  init   - Initialize migration tracking table');
        process.exit(1);
    }
  } finally {
    await runner.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

export { MigrationRunner };
