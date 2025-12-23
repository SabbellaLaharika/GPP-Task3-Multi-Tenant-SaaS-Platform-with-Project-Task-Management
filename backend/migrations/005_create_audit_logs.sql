-- Migration: 005_create_audit_logs.sql
-- Purpose: Track all important actions for security audit
-- Table: audit_logs

-- Drop table if exists (for development/testing)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Create audit_logs table
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    tenant_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id VARCHAR(36),
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_audit_logs_tenant 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_audit_logs_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Composite index for common audit queries
CREATE INDEX idx_audit_logs_tenant_user ON audit_logs(tenant_id, user_id);
CREATE INDEX idx_audit_logs_tenant_entity ON audit_logs(tenant_id, entity_type, entity_id);

-- Add comment to table
COMMENT ON TABLE audit_logs IS 'Track all important actions for security audit';

-- Add comments to columns
COMMENT ON COLUMN audit_logs.id IS 'Primary Key, VARCHAR/UUID';
COMMENT ON COLUMN audit_logs.tenant_id IS 'Foreign Key → tenants.id';
COMMENT ON COLUMN audit_logs.user_id IS 'Foreign Key → users.id, NULLABLE';
COMMENT ON COLUMN audit_logs.action IS 'VARCHAR, NOT NULL - e.g., CREATE_USER, DELETE_PROJECT';
COMMENT ON COLUMN audit_logs.entity_type IS 'VARCHAR - e.g., user, project, task';
COMMENT ON COLUMN audit_logs.entity_id IS 'VARCHAR';
COMMENT ON COLUMN audit_logs.ip_address IS 'VARCHAR, NULLABLE';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Table "audit_logs" created successfully';
    RAISE NOTICE '   - Tracks all important actions';
    RAISE NOTICE '   - Indexes for performance';
END $$;
