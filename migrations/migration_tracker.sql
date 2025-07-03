-- Migration: migration_tracker.sql
-- Description: Create the migration tracking table
-- Version: 1.0
-- Date: 2025-07-02

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    version VARCHAR(50),
    checksum VARCHAR(64),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_schema_migrations_filename ON schema_migrations(filename);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_success ON schema_migrations(success);

-- Add comments
COMMENT ON TABLE schema_migrations IS 'Tracks which database migrations have been applied';
COMMENT ON COLUMN schema_migrations.filename IS 'Name of the migration file';
COMMENT ON COLUMN schema_migrations.description IS 'Description of what the migration does';
COMMENT ON COLUMN schema_migrations.version IS 'Version number of the migration';
COMMENT ON COLUMN schema_migrations.checksum IS 'SHA-256 checksum of the migration file content';
COMMENT ON COLUMN schema_migrations.applied_at IS 'When the migration was applied';
COMMENT ON COLUMN schema_migrations.execution_time_ms IS 'How long the migration took to execute in milliseconds';
COMMENT ON COLUMN schema_migrations.success IS 'Whether the migration completed successfully';
COMMENT ON COLUMN schema_migrations.error_message IS 'Error message if the migration failed';
