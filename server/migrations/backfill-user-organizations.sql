-- Migration: Backfill Organizations for Legacy Users
-- Date: December 2025
-- Purpose: Ensure all users have an organizationId by creating personal workspaces
--
-- This migration should be run for any database that has users without organizations.
-- New signups after December 2025 automatically receive personal organizations.

-- Step 1: Find users without organizations
-- SELECT id, username, email, organization_id, account_tier 
-- FROM users 
-- WHERE organization_id IS NULL;

-- Step 2: For each user without an organization, create a personal workspace and link them
-- This must be done per-user to properly set the owner_id

-- Example for a single user (replace with actual user_id and username):
-- INSERT INTO organizations (id, name, account_tier, owner_id, max_members, max_sites, max_assessments)
-- VALUES (gen_random_uuid(), 'username''s Workspace', 'free', 'user-uuid-here', 1, 3, 5)
-- RETURNING id;
--
-- UPDATE users 
-- SET organization_id = 'org-uuid-from-above',
--     organization_role = 'owner',
--     account_tier = COALESCE(account_tier, 'free')
-- WHERE id = 'user-uuid-here';

-- Automated script to backfill all legacy users:
DO $$
DECLARE
    user_record RECORD;
    new_org_id UUID;
BEGIN
    FOR user_record IN 
        SELECT id, username, account_tier 
        FROM users 
        WHERE organization_id IS NULL
    LOOP
        -- Create personal organization for this user
        INSERT INTO organizations (name, account_tier, owner_id, max_members, max_sites, max_assessments)
        VALUES (
            user_record.username || '''s Workspace',
            'free',
            user_record.id,
            1,  -- Free tier: 1 member
            3,  -- Free tier: 3 sites
            5   -- Free tier: 5 assessments
        )
        RETURNING id INTO new_org_id;
        
        -- Link user to their new organization
        UPDATE users 
        SET organization_id = new_org_id,
            organization_role = 'owner',
            account_tier = COALESCE(account_tier, 'free')
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Created organization % for user %', new_org_id, user_record.username;
    END LOOP;
END $$;

-- Verify no orphaned users remain
SELECT COUNT(*) as orphaned_users FROM users WHERE organization_id IS NULL;
