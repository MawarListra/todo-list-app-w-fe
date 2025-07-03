-- Migration: 004_seed_default_data.sql
-- Description: Seed the database with default data for development and testing
-- Version: 1.0
-- Date: 2025-07-02

-- Insert default lists
INSERT INTO lists (id, name, description, color) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Personal Tasks', 'Personal todo items and reminders', '#2196F3'),
    ('00000000-0000-0000-0000-000000000002', 'Work Projects', 'Work-related tasks and projects', '#FF9800'),
    ('00000000-0000-0000-0000-000000000003', 'Shopping List', 'Items to buy and grocery lists', '#4CAF50'),
    ('00000000-0000-0000-0000-000000000004', 'Learning Goals', 'Skills to learn and educational objectives', '#9C27B0')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks for Personal Tasks list
INSERT INTO tasks (id, list_id, title, description, priority, completed, deadline) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Review monthly budget', 'Check expenses and plan for next month', 'high', FALSE, CURRENT_DATE + INTERVAL '3 days'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Schedule dentist appointment', 'Annual checkup and cleaning', 'medium', FALSE, CURRENT_DATE + INTERVAL '1 week'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Update emergency contacts', 'Review and update contact information', 'low', TRUE, NULL),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Organize photo albums', 'Sort and organize digital photos from last year', 'low', FALSE, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks for Work Projects list
INSERT INTO tasks (id, list_id, title, description, priority, completed, deadline) VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Complete Q3 report', 'Quarterly performance and metrics report', 'high', FALSE, CURRENT_DATE + INTERVAL '2 days'),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Review team feedback', 'Analyze feedback from team retrospective meeting', 'medium', FALSE, CURRENT_DATE + INTERVAL '5 days'),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Update project documentation', 'Refresh technical documentation and API specs', 'medium', TRUE, NULL),
    ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Plan team building event', 'Organize quarterly team building activity', 'low', FALSE, CURRENT_DATE + INTERVAL '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks for Shopping List
INSERT INTO tasks (id, list_id, title, description, priority, completed, deadline) VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Buy groceries', 'Weekly grocery shopping', 'medium', FALSE, CURRENT_DATE + INTERVAL '2 days'),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Purchase birthday gift', 'Gift for Sarah''s birthday party', 'high', FALSE, CURRENT_DATE + INTERVAL '4 days'),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Replace broken headphones', 'Find good quality wireless headphones', 'medium', TRUE, NULL),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Buy plants for garden', 'Spring planting - vegetables and herbs', 'low', FALSE, CURRENT_DATE + INTERVAL '1 week')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks for Learning Goals list
INSERT INTO tasks (id, list_id, title, description, priority, completed, deadline) VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Complete TypeScript course', 'Finish advanced TypeScript concepts', 'high', FALSE, CURRENT_DATE + INTERVAL '2 weeks'),
    ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Read "Clean Code" book', 'Improve coding practices and patterns', 'medium', FALSE, CURRENT_DATE + INTERVAL '1 month'),
    ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Learn Spanish basics', 'Complete beginner Spanish course online', 'low', FALSE, NULL),
    ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Practice SQL queries', 'Work through SQL practice problems', 'medium', TRUE, NULL)
ON CONFLICT (id) DO NOTHING;

-- Set completed_at for completed tasks
UPDATE tasks 
SET completed_at = created_at + INTERVAL '1 day'
WHERE completed = TRUE AND completed_at IS NULL;

-- Create a view for task analytics
CREATE OR REPLACE VIEW task_analytics AS
SELECT 
    l.id as list_id,
    l.name as list_name,
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.completed = TRUE) as completed_tasks,
    COUNT(t.id) FILTER (WHERE t.completed = FALSE) as pending_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'high') as high_priority_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'medium') as medium_priority_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'low') as low_priority_tasks,
    COUNT(t.id) FILTER (WHERE t.deadline IS NOT NULL AND t.deadline < CURRENT_TIMESTAMP AND t.completed = FALSE) as overdue_tasks,
    COUNT(t.id) FILTER (WHERE t.deadline IS NOT NULL AND t.deadline >= CURRENT_TIMESTAMP AND t.deadline <= CURRENT_TIMESTAMP + INTERVAL '7 days' AND t.completed = FALSE) as due_this_week,
    CASE 
        WHEN COUNT(t.id) = 0 THEN 0.00
        ELSE ROUND((COUNT(t.id) FILTER (WHERE t.completed = TRUE)::DECIMAL / COUNT(t.id)) * 100, 2)
    END as completion_percentage,
    MAX(t.created_at) as last_task_created,
    MAX(t.completed_at) as last_task_completed
FROM lists l
LEFT JOIN tasks t ON l.id = t.list_id
GROUP BY l.id, l.name
ORDER BY l.name;

-- Create a view for upcoming deadlines
CREATE OR REPLACE VIEW upcoming_deadlines AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.priority,
    t.deadline,
    l.name as list_name,
    l.color as list_color,
    EXTRACT(days FROM (t.deadline - CURRENT_TIMESTAMP)) as days_remaining
FROM tasks t
JOIN lists l ON t.list_id = l.id
WHERE t.completed = FALSE 
AND t.deadline IS NOT NULL 
AND t.deadline >= CURRENT_TIMESTAMP
ORDER BY t.deadline ASC;

-- Add comments
COMMENT ON VIEW task_analytics IS 'Analytics view providing task statistics per list';
COMMENT ON VIEW upcoming_deadlines IS 'View showing all upcoming task deadlines ordered by due date';

-- Log the seeding completion
DO $$
BEGIN
    RAISE NOTICE 'Default data seeding completed successfully';
    RAISE NOTICE 'Created % lists with sample tasks', (SELECT COUNT(*) FROM lists);
    RAISE NOTICE 'Created % total tasks', (SELECT COUNT(*) FROM tasks);
    RAISE NOTICE 'Analytics views created: task_analytics, upcoming_deadlines';
END $$;
