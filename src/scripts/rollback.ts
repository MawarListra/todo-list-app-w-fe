#!/usr/bin/env tsx

/**
 * Database Migration Rollback Runner
 *
 * This script provides rollback functionality for database migrations.
 * It can rollback the last migration or rollback to a specific migration.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

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

interface RollbackInfo {
  tables: string[];
  views: string[];
  functions: string[];
  indexes: string[];
}

class RollbackRunner {
  private pool: Pool;
  private migrationsDir: string;

  constructor() {
    this.pool = new Pool(dbConfig);
    this.migrationsDir = join(__dirname, '../../migrations');
  }

  /**
   * Get applied migrations from the database in reverse order
   */
  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM schema_migrations WHERE success = true ORDER BY applied_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to get applied migrations:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Prompt user for confirmation
   */
  async promptConfirmation(message: string): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(`${message} (y/N): `, answer => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  /**
   * Analyze what would be affected by rollback
   */
  async analyzeRollbackImpact(migrations: MigrationRecord[]): Promise<RollbackInfo> {
    const client = await this.pool.connect();
    const info: RollbackInfo = {
      tables: [],
      views: [],
      functions: [],
      indexes: []
    };

    try {
      // Get all tables that would be affected
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN ('lists', 'tasks')
      `);
      info.tables = tablesResult.rows.map(row => row.table_name);

      // Get all views
      const viewsResult = await client.query(`
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
      `);
      info.views = viewsResult.rows.map(row => row.table_name);

      // Get all functions
      const functionsResult = await client.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
      `);
      info.functions = functionsResult.rows.map(row => row.routine_name);

      // Get relevant indexes
      const indexesResult = await client.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND tablename IN ('lists', 'tasks')
      `);
      info.indexes = indexesResult.rows.map(row => row.indexname);

      return info;
    } catch (error) {
      console.error('❌ Failed to analyze rollback impact:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate rollback SQL for a specific migration
   */
  generateRollbackSQL(migration: MigrationRecord): string {
    const filename = migration.filename;

    switch (filename) {
      case '001_create_lists_table.sql':
        return `
          -- Rollback: Drop lists table and related objects
          DROP TRIGGER IF EXISTS update_lists_updated_at ON lists;
          DROP FUNCTION IF EXISTS update_updated_at_column();
          DROP TABLE IF EXISTS lists CASCADE;
        `;

      case '002_create_tasks_table.sql':
        return `
          -- Rollback: Drop tasks table and related objects
          DROP TRIGGER IF EXISTS set_task_completed_at ON tasks;
          DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
          DROP FUNCTION IF EXISTS set_completed_at();
          DROP TABLE IF EXISTS tasks CASCADE;
        `;

      case '003_add_indexes.sql':
        return `
          -- Rollback: Drop additional indexes and constraints
          DROP INDEX IF EXISTS idx_lists_name_partial_active;
          DROP INDEX IF EXISTS idx_lists_name_gin;
          DROP INDEX IF EXISTS idx_tasks_title_partial;
          DROP INDEX IF EXISTS idx_tasks_search_gin;
          DROP INDEX IF EXISTS idx_tasks_upcoming_deadlines;
          DROP INDEX IF EXISTS idx_tasks_overdue;
          DROP INDEX IF EXISTS idx_tasks_high_priority_incomplete;
          DROP INDEX IF EXISTS idx_tasks_summary_covering;
          DROP INDEX IF EXISTS idx_tasks_active_by_priority;
          DROP INDEX IF EXISTS idx_tasks_completion_stats;
          DROP INDEX IF EXISTS idx_tasks_recent;
          
          -- Drop function
          DROP FUNCTION IF EXISTS get_list_task_stats(UUID);
          
          -- Remove constraints (if they exist)
          ALTER TABLE lists DROP CONSTRAINT IF EXISTS lists_name_length_check;
          ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_title_length_check;
          ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_completed_at_not_future;
          ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_deadline_reasonable;
        `;

      case '004_seed_default_data.sql':
        return `
          -- Rollback: Remove all seeded data and views
          DROP VIEW IF EXISTS upcoming_deadlines;
          DROP VIEW IF EXISTS task_analytics;
          
          -- Delete seeded data (in reverse dependency order)
          DELETE FROM tasks WHERE list_id IN (
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000004'
          );
          
          DELETE FROM lists WHERE id IN (
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000004'
          );
        `;

      default:
        throw new Error(`No rollback strategy defined for migration: ${filename}`);
    }
  }

  /**
   * Execute rollback for a specific migration
   */
  async rollbackMigration(migration: MigrationRecord): Promise<void> {
    const client = await this.pool.connect();
    const startTime = Date.now();

    try {
      await client.query('BEGIN');

      console.log(`🔄 Rolling back migration: ${migration.filename}`);
      console.log(`   Description: ${migration.description}`);

      const rollbackSQL = this.generateRollbackSQL(migration);
      await client.query(rollbackSQL);

      // Remove the migration record
      await client.query('DELETE FROM schema_migrations WHERE filename = $1', [migration.filename]);

      await client.query('COMMIT');

      const executionTime = Date.now() - startTime;
      console.log(`✅ Migration rolled back successfully (${executionTime}ms)`);
    } catch (error) {
      await client.query('ROLLBACK');
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Rollback failed: ${migration.filename}`);
      console.error(`   Error: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Rollback the last migration
   */
  async rollbackLast(): Promise<void> {
    try {
      const appliedMigrations = await this.getAppliedMigrations();

      if (appliedMigrations.length === 0) {
        console.log('ℹ️  No migrations to rollback.');
        return;
      }

      const lastMigration = appliedMigrations[0];
      if (!lastMigration) {
        console.log('ℹ️  No migrations to rollback.');
        return;
      }

      console.log(`\n🔍 Last applied migration: ${lastMigration.filename}`);
      console.log(`   Description: ${lastMigration.description}`);
      console.log(`   Applied at: ${lastMigration.applied_at}`);

      // Analyze impact
      const impact = await this.analyzeRollbackImpact([lastMigration]);
      console.log('\n⚠️  Rollback Impact:');
      if (impact.tables.length > 0) {
        console.log(`   Tables affected: ${impact.tables.join(', ')}`);
      }
      if (impact.views.length > 0) {
        console.log(`   Views affected: ${impact.views.join(', ')}`);
      }
      if (impact.functions.length > 0) {
        console.log(`   Functions affected: ${impact.functions.join(', ')}`);
      }

      const confirmed = await this.promptConfirmation(
        '\n⚠️  This will rollback the last migration. Continue?'
      );

      if (!confirmed) {
        console.log('❌ Rollback cancelled.');
        return;
      }

      await this.rollbackMigration(lastMigration);
      console.log('✅ Rollback completed successfully!');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Rollback to a specific migration
   */
  async rollbackTo(targetMigration: string): Promise<void> {
    try {
      const appliedMigrations = await this.getAppliedMigrations();

      const targetIndex = appliedMigrations.findIndex(m => m.filename === targetMigration);

      if (targetIndex === -1) {
        console.log(`❌ Migration not found: ${targetMigration}`);
        return;
      }

      const migrationsToRollback = appliedMigrations.slice(0, targetIndex);

      if (migrationsToRollback.length === 0) {
        console.log(`ℹ️  Migration ${targetMigration} is already the latest applied migration.`);
        return;
      }

      console.log(
        `\n🔍 Rolling back ${migrationsToRollback.length} migration(s) to reach: ${targetMigration}`
      );
      migrationsToRollback.forEach(m => {
        console.log(`   - ${m.filename}: ${m.description}`);
      });

      const confirmed = await this.promptConfirmation(
        '\n⚠️  This will rollback multiple migrations. Continue?'
      );

      if (!confirmed) {
        console.log('❌ Rollback cancelled.');
        return;
      }

      // Rollback migrations in reverse order
      for (const migration of migrationsToRollback) {
        await this.rollbackMigration(migration);
      }

      console.log('✅ Rollback to target migration completed successfully!');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Show rollback options
   */
  async showRollbackOptions(): Promise<void> {
    try {
      const appliedMigrations = await this.getAppliedMigrations();

      if (appliedMigrations.length === 0) {
        console.log('ℹ️  No migrations have been applied yet.');
        return;
      }

      console.log('\n📋 Applied Migrations (newest first):');
      console.log('=====================================');

      appliedMigrations.forEach((migration, index) => {
        const date = migration.applied_at.toISOString().split('T')[0];
        const time = migration.applied_at.toISOString().split('T')[1]?.split('.')[0] || '';
        console.log(`${index + 1}. ${migration.filename}`);
        console.log(`   Description: ${migration.description}`);
        console.log(`   Applied: ${date} ${time}`);
        console.log('');
      });

      console.log('💡 Rollback options:');
      console.log('   npm run migrate:rollback last    - Rollback the last migration');
      console.log('   npm run migrate:rollback <file>  - Rollback to a specific migration');
    } catch (error) {
      console.error('❌ Failed to show rollback options:', error);
      throw error;
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
  const command = process.argv[2];
  const target = process.argv[3];
  const runner = new RollbackRunner();

  try {
    switch (command) {
      case 'last':
        await runner.rollbackLast();
        break;
      case 'to':
        if (!target) {
          console.log('❌ Please specify a migration file to rollback to.');
          console.log('Usage: npm run migrate:rollback to <migration_file>');
          process.exit(1);
        }
        await runner.rollbackTo(target);
        break;
      case 'list':
      case 'show':
        await runner.showRollbackOptions();
        break;
      default:
        if (command && command.endsWith('.sql')) {
          await runner.rollbackTo(command);
        } else {
          console.log('Usage: npm run migrate:rollback [last|to <file>|list]');
          console.log('  last         - Rollback the last applied migration');
          console.log('  to <file>    - Rollback to a specific migration file');
          console.log('  list|show    - Show applied migrations and rollback options');
          console.log('  <file>       - Shorthand for "to <file>"');
          process.exit(1);
        }
    }
  } finally {
    await runner.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Rollback script failed:', error);
    process.exit(1);
  });
}

export { RollbackRunner };
