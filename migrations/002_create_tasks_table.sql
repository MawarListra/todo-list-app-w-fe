-- Migration: 002_create_tasks_table.sql
-- Description: Create the tasks table with all necessary columns, constraints, and foreign keys
-- Version: 1.0
-- Date: 2025-07-02

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_tasks_list_id 
        FOREIGN KEY (list_id) 
        REFERENCES lists(id) 
        ON DELETE CASCADE
);

-- Add constraints
ALTER TABLE tasks 
ADD CONSTRAINT tasks_title_not_empty CHECK (length(trim(title)) > 0);

-- Add constraint to ensure completed_at is set when completed is true
ALTER TABLE tasks 
ADD CONSTRAINT tasks_completed_at_consistency 
CHECK (
    (completed = TRUE AND completed_at IS NOT NULL) OR 
    (completed = FALSE)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks(title);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_list_completed ON tasks(list_id, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_list_priority ON tasks(list_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline_completed ON tasks(deadline, completed) WHERE deadline IS NOT NULL;

-- Add updated_at trigger
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically set completed_at when task is marked as completed
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- When marking as completed, set completed_at
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- When marking as not completed, clear completed_at
    IF NEW.completed = FALSE AND OLD.completed = TRUE THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_task_completed_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION set_completed_at();

-- Add comments
COMMENT ON TABLE tasks IS 'Individual tasks within todo lists';
COMMENT ON COLUMN tasks.id IS 'Unique identifier for the task';
COMMENT ON COLUMN tasks.list_id IS 'Reference to the parent list';
COMMENT ON COLUMN tasks.title IS 'Task title (1-200 characters)';
COMMENT ON COLUMN tasks.description IS 'Optional detailed description of the task';
COMMENT ON COLUMN tasks.priority IS 'Task priority: low, medium, or high';
COMMENT ON COLUMN tasks.completed IS 'Whether the task has been completed';
COMMENT ON COLUMN tasks.deadline IS 'Optional deadline for the task';
COMMENT ON COLUMN tasks.completed_at IS 'Timestamp when the task was marked as completed';
COMMENT ON COLUMN tasks.created_at IS 'Timestamp when the task was created';
COMMENT ON COLUMN tasks.updated_at IS 'Timestamp when the task was last updated';
