-- Backfill organizationId from creator's organization
-- Required before middleware implementation
-- Date: 2025-12-02
-- Phase: Multi-Tenancy Foundation

BEGIN;

-- Backfill Sites
UPDATE sites s
SET organization_id = u.organization_id
FROM users u
WHERE s.user_id = u.id
  AND s.organization_id IS NULL
  AND u.organization_id IS NOT NULL;

-- Backfill Assessments
UPDATE assessments a
SET organization_id = u.organization_id
FROM users u
WHERE a.user_id = u.id
  AND a.organization_id IS NULL
  AND u.organization_id IS NOT NULL;

COMMIT;
