-- Migration: 003_add_indexes.sql
-- Description: Add additional performance indexes and optimize existing ones
-- Version: 1.0
-- Date: 2025-07-02

-- Additional performance indexes for lists table
CREATE INDEX IF NOT EXISTS idx_lists_name_partial_active 
ON lists(name) 
WHERE name IS NOT NULL;

-- Full-text search index for list names (if using PostgreSQL)
CREATE INDEX IF NOT EXISTS idx_lists_name_gin 
ON lists USING gin(to_tsvector('english', name));

-- Additional performance indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_title_partial 
ON tasks(title) 
WHERE title IS NOT NULL;

-- Full-text search index for task titles and descriptions
CREATE INDEX IF NOT EXISTS idx_tasks_search_gin 
ON tasks USING gin(
    to_tsvector('english', 
        coalesce(title, '') || ' ' || coalesce(description, '')
    )
);

-- Index for upcoming deadlines (tasks due in the next 7 days)
CREATE INDEX IF NOT EXISTS idx_tasks_upcoming_deadlines 
ON tasks(deadline) 
WHERE completed = FALSE 
AND deadline IS NOT NULL 
AND deadline >= CURRENT_DATE 
AND deadline <= CURRENT_DATE + INTERVAL '7 days';

-- Index for overdue tasks
CREATE INDEX IF NOT EXISTS idx_tasks_overdue 
ON tasks(deadline, list_id) 
WHERE completed = FALSE 
AND deadline IS NOT NULL 
AND deadline < CURRENT_TIMESTAMP;

-- Index for high priority incomplete tasks
CREATE INDEX IF NOT EXISTS idx_tasks_high_priority_incomplete 
ON tasks(list_id, created_at) 
WHERE priority = 'high' 
AND completed = FALSE;

-- Covering index for task summary queries
CREATE INDEX IF NOT EXISTS idx_tasks_summary_covering 
ON tasks(list_id, completed, priority) 
INCLUDE (title, deadline, created_at);

-- Performance optimization: partial index for active tasks
CREATE INDEX IF NOT EXISTS idx_tasks_active_by_priority 
ON tasks(list_id, priority, created_at DESC) 
WHERE completed = FALSE;

-- Index for task completion statistics
CREATE INDEX IF NOT EXISTS idx_tasks_completion_stats 
ON tasks(list_id, completed, completed_at) 
WHERE completed_at IS NOT NULL;

-- Index for tasks created in the last 30 days
CREATE INDEX IF NOT EXISTS idx_tasks_recent 
ON tasks(created_at DESC) 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Add database-level constraints for data integrity
ALTER TABLE lists 
ADD CONSTRAINT lists_name_length_check 
CHECK (char_length(name) BETWEEN 1 AND 100);

ALTER TABLE tasks 
ADD CONSTRAINT tasks_title_length_check 
CHECK (char_length(title) BETWEEN 1 AND 200);

-- Add constraint to prevent future completion dates
ALTER TABLE tasks 
ADD CONSTRAINT tasks_completed_at_not_future 
CHECK (completed_at IS NULL OR completed_at <= CURRENT_TIMESTAMP);

-- Add constraint to ensure deadline is reasonable (not too far in the past)
ALTER TABLE tasks 
ADD CONSTRAINT tasks_deadline_reasonable 
CHECK (deadline IS NULL OR deadline >= CURRENT_DATE - INTERVAL '1 year');

-- Create a function to get task statistics
CREATE OR REPLACE FUNCTION get_list_task_stats(list_uuid UUID)
RETURNS TABLE(
    total_tasks INTEGER,
    completed_tasks INTEGER,
    pending_tasks INTEGER,
    high_priority_tasks INTEGER,
    overdue_tasks INTEGER,
    completion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_tasks,
        COUNT(*) FILTER (WHERE completed = TRUE)::INTEGER as completed_tasks,
        COUNT(*) FILTER (WHERE completed = FALSE)::INTEGER as pending_tasks,
        COUNT(*) FILTER (WHERE priority = 'high' AND completed = FALSE)::INTEGER as high_priority_tasks,
        COUNT(*) FILTER (WHERE deadline < CURRENT_TIMESTAMP AND completed = FALSE)::INTEGER as overdue_tasks,
        CASE 
            WHEN COUNT(*) = 0 THEN 0.00
            ELSE ROUND((COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / COUNT(*)) * 100, 2)
        END as completion_rate
    FROM tasks 
    WHERE list_id = list_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add comments for the new indexes
COMMENT ON INDEX idx_lists_name_gin IS 'GIN index for full-text search on list names';
COMMENT ON INDEX idx_tasks_search_gin IS 'GIN index for full-text search on task titles and descriptions';
COMMENT ON INDEX idx_tasks_upcoming_deadlines IS 'Partial index for tasks with deadlines in the next 7 days';
COMMENT ON INDEX idx_tasks_overdue IS 'Partial index for overdue incomplete tasks';
COMMENT ON INDEX idx_tasks_high_priority_incomplete IS 'Partial index for high priority incomplete tasks';
COMMENT ON INDEX idx_tasks_summary_covering IS 'Covering index for task summary queries';
COMMENT ON INDEX idx_tasks_active_by_priority IS 'Index for active tasks ordered by priority and creation date';
COMMENT ON INDEX idx_tasks_completion_stats IS 'Index for task completion statistics';
COMMENT ON INDEX idx_tasks_recent IS 'Partial index for recently created tasks';
