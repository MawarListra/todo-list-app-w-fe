-- Migration: 001_initial_schema
-- Description: Create initial database schema for TODO List API
-- Date: 2025-07-02
-- Author: Development Team

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT lists_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT lists_name_length CHECK (LENGTH(name) <= 100),
    CONSTRAINT lists_description_length CHECK (description IS NULL OR LENGTH(description) <= 500)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    priority task_priority DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_tasks_list_id FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT tasks_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT tasks_title_length CHECK (LENGTH(title) <= 200),
    CONSTRAINT tasks_description_length CHECK (description IS NULL OR LENGTH(description) <= 1000),
    CONSTRAINT tasks_deadline_future CHECK (deadline IS NULL OR deadline > created_at),
    CONSTRAINT tasks_completion_logic CHECK (
        (completed = FALSE AND completed_at IS NULL) OR
        (completed = TRUE AND completed_at IS NOT NULL)
    )
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_lists_created_at ON lists(created_at);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_tasks_list_completed ON tasks(list_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline_completed ON tasks(deadline, completed) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_priority_completed ON tasks(priority, completed);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_lists_updated_at 
    BEFORE UPDATE ON lists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically set completed_at when task is marked as completed
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If task is being marked as completed
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = NOW();
    -- If task is being marked as incomplete
    ELSIF NEW.completed = FALSE AND OLD.completed = TRUE THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_task_completed_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION set_completed_at();

-- Insert some initial test data (optional for development)
INSERT INTO lists (id, name, description) VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'Work Tasks', 'Tasks related to work projects'),
    ('123e4567-e89b-12d3-a456-426614174001', 'Personal Tasks', 'Personal todo items')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, list_id, title, description, deadline, priority, completed) VALUES 
    ('456e7890-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Complete API documentation', 'Finalize the API documentation for the TODO list service', '2025-07-07T17:00:00Z', 'high', false),
    ('456e7890-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Review code', 'Review pull requests for the new features', '2025-07-05T12:00:00Z', 'medium', false),
    ('456e7890-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174001', 'Buy groceries', 'Get groceries for the week', '2025-07-03T18:00:00Z', 'low', false)
ON CONFLICT (id) DO NOTHING;
