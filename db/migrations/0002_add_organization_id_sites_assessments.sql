-- Migration: Add organizationId to sites and assessments tables
-- Date: 2025-12-02
-- Phase: Multi-Tenancy Foundation
-- Idempotent: Safe to run multiple times

BEGIN;

-- SITES TABLE
ALTER TABLE sites
ADD COLUMN IF NOT EXISTS organization_id VARCHAR;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sites_organization_id_fkey'
    ) THEN
        ALTER TABLE sites
        ADD CONSTRAINT sites_organization_id_fkey
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sites_organization_id
ON sites(organization_id);

-- ASSESSMENTS TABLE
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS organization_id VARCHAR;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'assessments_organization_id_fkey'
    ) THEN
        ALTER TABLE assessments
        ADD CONSTRAINT assessments_organization_id_fkey
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_assessments_organization_id
ON assessments(organization_id);

COMMIT;
