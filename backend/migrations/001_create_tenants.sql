-- Migration: 001_create_tenants.sql
-- Purpose: Store organization information
-- Table: tenants

-- Drop table if exists (for development/testing)
DROP TABLE IF EXISTS tenants CASCADE;

-- Create tenants table
CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    max_users INTEGER,
    max_projects INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to set limits based on plan
CREATE OR REPLACE FUNCTION set_tenant_limits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_plan = 'free' THEN
        NEW.max_users := 5;
        NEW.max_projects := 3;
    ELSIF NEW.subscription_plan = 'pro' THEN
        NEW.max_users := 25;
        NEW.max_projects := 15;
    ELSIF NEW.subscription_plan = 'enterprise' THEN
        NEW.max_users := 100;
        NEW.max_projects := 100;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update limits before insert or update
CREATE TRIGGER trigger_set_tenant_limits
BEFORE INSERT OR UPDATE OF subscription_plan ON tenants
FOR EACH ROW
EXECUTE FUNCTION set_tenant_limits();

-- Create index on subdomain for faster lookups
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);

-- Create index on status
CREATE INDEX idx_tenants_status ON tenants(status);

-- Add comment to table
COMMENT ON TABLE tenants IS 'Store organization information';

-- Add comments to columns
COMMENT ON COLUMN tenants.id IS 'Primary Key, VARCHAR/UUID';
COMMENT ON COLUMN tenants.subdomain IS 'UNIQUE subdomain for tenant';
COMMENT ON COLUMN tenants.status IS 'ENUM: active, suspended, trial';
COMMENT ON COLUMN tenants.subscription_plan IS 'ENUM: free, pro, enterprise';
COMMENT ON COLUMN tenants.max_users IS 'INTEGER, Auto-set by trigger based on plan';
COMMENT ON COLUMN tenants.max_projects IS 'INTEGER, Auto-set by trigger based on plan';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Table "tenants" created successfully with automation trigger';
END $$;
