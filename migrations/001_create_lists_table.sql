-- Migration: 001_create_lists_table.sql
-- Description: Create the lists table with all necessary columns and constraints
-- Version: 1.0
-- Date: 2025-07-02

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints
ALTER TABLE lists 
ADD CONSTRAINT lists_name_not_empty CHECK (length(trim(name)) > 0);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lists_name ON lists(name);
CREATE INDEX IF NOT EXISTS idx_lists_created_at ON lists(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lists_updated_at 
    BEFORE UPDATE ON lists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE lists IS 'Todo lists for organizing tasks';
COMMENT ON COLUMN lists.id IS 'Unique identifier for the list';
COMMENT ON COLUMN lists.name IS 'Display name of the list (1-100 characters)';
COMMENT ON COLUMN lists.description IS 'Optional description of the list';
COMMENT ON COLUMN lists.color IS 'Optional hex color code for the list (#RRGGBB format)';
COMMENT ON COLUMN lists.created_at IS 'Timestamp when the list was created';
COMMENT ON COLUMN lists.updated_at IS 'Timestamp when the list was last updated';
