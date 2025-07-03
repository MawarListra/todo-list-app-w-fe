import { Pool, PoolClient } from 'pg';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Interface for migration metadata
 */
interface Migration {
  version: string;
  description: string;
  filename: string;
  appliedAt?: Date;
}

/**
 * Database migration manager
 * Handles running and tracking database schema migrations
 */
export class DatabaseMigrator {
  private pool: Pool;
  private migrationsPath: string;

  constructor(pool: Pool) {
    this.pool = pool;
    this.migrationsPath = join(__dirname, '../../migrations');
  }

  /**
   * Initialize migration tracking table
   */
  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        description TEXT,
        filename VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(64)
      );
      
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at 
      ON schema_migrations(applied_at);
    `;

    await this.pool.query(query);
  }

  /**
   * Get list of all migration files
   */
  private async getMigrationFiles(): Promise<Migration[]> {
    const fs = await import('fs');
    const files = await fs.promises.readdir(this.migrationsPath);

    return files
      .filter(file => file.endsWith('.sql'))
      .sort()
      .map(filename => {
        const parts = filename.replace('.sql', '').split('_');
        const version = parts[0] || '';
        const description = parts.slice(1).join(' ').replace(/-/g, ' ');

        return {
          version,
          description,
          filename
        };
      });
  }

  /**
   * Get list of applied migrations from database
   */
  private async getAppliedMigrations(): Promise<Set<string>> {
    try {
      const result = await this.pool.query(
        'SELECT version FROM schema_migrations ORDER BY applied_at'
      );
      return new Set(result.rows.map((row: { version: string }) => row.version));
    } catch (error) {
      // Table doesn't exist yet
      return new Set();
    }
  }

  /**
   * Calculate checksum for migration file content
   */
  private async calculateChecksum(content: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Run a single migration
   */
  private async runMigration(migration: Migration, client: PoolClient): Promise<void> {
    console.log(`Running migration ${migration.version}: ${migration.description}`);

    const migrationPath = join(this.migrationsPath, migration.filename);
    const content = await readFile(migrationPath, 'utf-8');
    const checksum = await this.calculateChecksum(content);

    // Execute migration SQL
    await client.query(content);

    // Record migration as applied
    await client.query(
      `INSERT INTO schema_migrations (version, description, filename, checksum) 
       VALUES ($1, $2, $3, $4)`,
      [migration.version, migration.description, migration.filename, checksum]
    );

    console.log(`✅ Migration ${migration.version} completed successfully`);
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    const client = await this.pool.connect();

    try {
      // Start transaction
      await client.query('BEGIN');

      // Ensure migrations table exists
      await this.createMigrationsTable();

      // Get migrations
      const allMigrations = await this.getMigrationFiles();
      const appliedMigrations = await this.getAppliedMigrations();

      // Find pending migrations
      const pendingMigrations = allMigrations.filter(
        migration => !appliedMigrations.has(migration.version)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found. Database is up to date.');
        await client.query('COMMIT');
        return;
      }

      console.log(`Found ${pendingMigrations.length} pending migration(s)`);

      // Run each pending migration
      for (const migration of pendingMigrations) {
        await this.runMigration(migration, client);
      }

      await client.query('COMMIT');
      console.log(`✅ Successfully applied ${pendingMigrations.length} migration(s)`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    applied: Migration[];
    pending: Migration[];
  }> {
    await this.createMigrationsTable();

    const allMigrations = await this.getMigrationFiles();
    const appliedMigrations = await this.getAppliedMigrations();

    const applied = allMigrations.filter(m => appliedMigrations.has(m.version));
    const pending = allMigrations.filter(m => !appliedMigrations.has(m.version));

    return { applied, pending };
  }

  /**
   * Validate migration integrity
   */
  async validateMigrations(): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        'SELECT version, filename, checksum FROM schema_migrations ORDER BY applied_at'
      );

      for (const row of result.rows) {
        const migrationPath = join(this.migrationsPath, row.filename);

        try {
          const content = await readFile(migrationPath, 'utf-8');
          const currentChecksum = await this.calculateChecksum(content);

          if (currentChecksum !== row.checksum) {
            console.error(
              `❌ Migration ${row.version} checksum mismatch. ` +
                `Migration file may have been modified after application.`
            );
            return false;
          }
        } catch (error) {
          console.error(`❌ Migration file ${row.filename} not found`);
          return false;
        }
      }

      console.log('✅ All migration checksums are valid');
      return true;
    } finally {
      client.release();
    }
  }

  /**
   * Rollback last migration (basic implementation)
   */
  async rollbackLast(): Promise<void> {
    console.warn('⚠️  Migration rollback is not implemented in this version');
    console.warn('⚠️  Manual rollback may be required');
    throw new Error('Rollback functionality not implemented');
  }
}
