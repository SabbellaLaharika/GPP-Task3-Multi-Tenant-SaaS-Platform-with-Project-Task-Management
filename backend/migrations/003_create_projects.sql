-- Migration: 003_create_projects.sql
-- Purpose: Store projects for each tenant
-- Table: projects

-- Drop table if exists (for development/testing)
DROP TABLE IF EXISTS projects CASCADE;

-- Create projects table
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    tenant_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints with CASCADE delete
    CONSTRAINT fk_projects_tenant 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_projects_created_by 
        FOREIGN KEY (created_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);

-- Add comment to table
COMMENT ON TABLE projects IS 'Store projects for each tenant';

-- Add comments to columns
COMMENT ON COLUMN projects.id IS 'Primary Key, VARCHAR/UUID';
COMMENT ON COLUMN projects.tenant_id IS 'Foreign Key → tenants.id (CASCADE DELETE)';
COMMENT ON COLUMN projects.name IS 'VARCHAR, NOT NULL';
COMMENT ON COLUMN projects.description IS 'TEXT';
COMMENT ON COLUMN projects.status IS 'ENUM: active, archived, completed';
COMMENT ON COLUMN projects.created_by IS 'Foreign Key → users.id (SET NULL)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Table "projects" created successfully';
    RAISE NOTICE '   - Foreign keys with CASCADE delete';
    RAISE NOTICE '   - Index on tenant_id';
END $$;
