-- Migration: 004_create_tasks.sql
-- Purpose: Store tasks within projects
-- Table: tasks

-- Drop table if exists (for development/testing)
DROP TABLE IF EXISTS tasks CASCADE;

-- Create tasks table
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    project_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to VARCHAR(36) NULL,
    due_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints with CASCADE delete
    CONSTRAINT fk_tasks_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_tasks_tenant 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_tasks_assigned_to 
        FOREIGN KEY (assigned_to) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Composite index for common queries
CREATE INDEX idx_tasks_tenant_project ON tasks(tenant_id, project_id);

-- Add comment to table
COMMENT ON TABLE tasks IS 'Store tasks within projects';

-- Add comments to columns
COMMENT ON COLUMN tasks.id IS 'Primary Key, VARCHAR/UUID';
COMMENT ON COLUMN tasks.project_id IS 'Foreign Key → projects.id (CASCADE DELETE)';
COMMENT ON COLUMN tasks.tenant_id IS 'Foreign Key → tenants.id (CASCADE DELETE)';
COMMENT ON COLUMN tasks.title IS 'VARCHAR, NOT NULL';
COMMENT ON COLUMN tasks.description IS 'TEXT';
COMMENT ON COLUMN tasks.status IS 'ENUM: todo, in_progress, completed';
COMMENT ON COLUMN tasks.priority IS 'ENUM: low, medium, high';
COMMENT ON COLUMN tasks.assigned_to IS 'Foreign Key → users.id, NULLABLE (SET NULL)';
COMMENT ON COLUMN tasks.due_date IS 'DATE, NULLABLE';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Table "tasks" created successfully';
    RAISE NOTICE '   - Foreign keys with CASCADE delete';
    RAISE NOTICE '   - Index on (tenant_id, project_id)';
END $$;
