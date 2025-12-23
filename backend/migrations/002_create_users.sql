-- Migration: 002_create_users.sql
-- Purpose: Store user accounts with tenant association
-- Table: users

-- Drop table if exists (for development/testing)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    tenant_id VARCHAR(36) NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('super_admin', 'tenant_admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint with CASCADE delete
    CONSTRAINT fk_users_tenant 
        FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint on (tenant_id, email)
    -- This allows same email across different tenants but unique within a tenant
    CONSTRAINT unique_tenant_email UNIQUE (tenant_id, email)
);

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Add comment to table
COMMENT ON TABLE users IS 'Store user accounts with tenant association';

-- Add comments to columns
COMMENT ON COLUMN users.id IS 'Primary Key, VARCHAR/UUID';
COMMENT ON COLUMN users.tenant_id IS 'Foreign Key → tenants.id (CASCADE DELETE)';
COMMENT ON COLUMN users.email IS 'VARCHAR, NOT NULL';
COMMENT ON COLUMN users.password_hash IS 'VARCHAR, NOT NULL (bcrypt hashed)';
COMMENT ON COLUMN users.full_name IS 'VARCHAR, NOT NULL';
COMMENT ON COLUMN users.role IS 'ENUM: super_admin, tenant_admin, user';
COMMENT ON COLUMN users.is_active IS 'BOOLEAN DEFAULT true';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Table "users" created successfully';
    RAISE NOTICE '   - UNIQUE constraint on (tenant_id, email)';
    RAISE NOTICE '   - Foreign key with CASCADE delete';
END $$;
