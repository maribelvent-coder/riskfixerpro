-- Migration: Add organizationId columns to sites and assessments tables
-- Phase 1: Multi-Tenancy Implementation
-- Date: 2025-11-19

-- Add organizationId to sites table
ALTER TABLE sites 
ADD COLUMN organization_id VARCHAR REFERENCES organizations(id);

-- Add organizationId to assessments table
ALTER TABLE assessments 
ADD COLUMN organization_id VARCHAR REFERENCES organizations(id);

-- Create index for faster organization-scoped queries
CREATE INDEX idx_sites_organization_id ON sites(organization_id);
CREATE INDEX idx_assessments_organization_id ON assessments(organization_id);

-- Optional: Backfill organizationId from users table for existing records
-- This will set the organizationId for sites/assessments based on the user's current organization
UPDATE sites 
SET organization_id = (
  SELECT organization_id 
  FROM users 
  WHERE users.id = sites.user_id
)
WHERE organization_id IS NULL;

UPDATE assessments 
SET organization_id = (
  SELECT organization_id 
  FROM users 
  WHERE users.id = assessments.user_id
)
WHERE organization_id IS NULL;

-- Note: Records will remain with NULL organizationId if the user doesn't belong to an organization (free tier)
-- This is intentional and allows free tier users to continue using the platform
