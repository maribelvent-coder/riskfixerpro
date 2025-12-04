# Changelog

All notable changes to the RiskFixer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Phase 1.1] - 2025-12-02

## [Phase 1.1] - 2025-12-03

### Fixed

- **Bug #17**: Free-tier sites not visible after creation
  - **Severity**: Critical – free-tier users could not see any sites after "successful" creation.
  - **Root cause**: `TenantStorage.getAllSites()` branched on `tenantId === null`, but free-tier users had `tenantId = undefined`, causing the org branch to run and filter by `organizationId = undefined`.
  - **Fix**: Updated `TenantStorage` to:
    - Accept both `tenantId` and `userId` in the constructor.
    - Treat `!tenantId` as free-tier and filter sites by `sites.userId = userId`.
    - Use `req.organizationId ?? null` instead of `req.organizationId!` when instantiating `TenantStorage` in all site and assessment routes.
  - **Impact**: Free-tier users now see their own sites; paid/organization users continue to see organization-scoped sites. Free-tier site limit and upgrade prompt are enforced correctly in production.

- **Bug #18**: Assessments not retrievable for free-tier users
  - **Severity**: Critical – free-tier users could create assessments but could not list or view any of them.
  - **Root cause**: Assessment queries in `TenantStorage` were originally org-only, joining via `users.organizationId`, and all assessment routes instantiated `TenantStorage` with `req.organizationId!`, which was `undefined` for free-tier.
  - **Fix**:
    - Added dual-tier logic to assessment operations in `TenantStorage`:
      - `getAllAssessments()`:
        - Free-tier: filter by `assessments.userId = userId`.
        - Org: join `users` and filter by `users.organizationId = tenantId`.
      - `getAssessment(id)`:
        - Free-tier: filter by `assessments.id = id` and `assessments.userId = userId`.
        - Org: join `users` and filter by `assessments.id = id` and `users.organizationId = tenantId`.
      - Implemented `verifyAssessmentOwnership()` using the same dual-tier pattern.
    - Updated all assessment-related routes to construct `TenantStorage` as `new TenantStorage(db, req.organizationId ?? null, req.session.userId!)`.
  - **Impact**: Free-tier users can now create, list, and view their own assessments in production; free-tier assessment limits continue to be enforced.

- **Bug #19**: Legacy assessment delete route bypassing TenantStorage
  - **Severity**: High – users could not delete assessments even when they owned them.
  - **Root cause**: `DELETE /api/assessments/:id` used legacy storage and an old `verifyAssessmentOwnership` middleware instead of the new `TenantStorage` and dual-tier ownership logic.
  - **Fix**:
    - Refactored `DELETE /api/assessments/:id` to:
      - Instantiate `TenantStorage` with `(db, req.organizationId ?? null, req.session.userId!)`.
      - Call `tenantStorage.deleteAssessment(id)`, which uses `verifyAssessmentOwnership()` internally.
    - Removed the stale middleware-based ownership check in favor of the unified `TenantStorage` path.
  - **Impact**: Assessment deletion now works correctly for free-tier users and remains scoped by tenant for organization users.



### Added
- Multi-tenant organization context enforcement across all routes
- Office profile data persistence with comprehensive schema support
- Complete profile field coverage for all security assessment types
- Authentication middleware for secure route protection

### Fixed
- **Bug #16**: Office Profile Data Persistence Failure
  - Root Cause: Schema validation mismatch between `.optional()` and `.nullable()`
  - Solution: Updated `shared/schema.ts` to accept both undefined and null values
  - Impact: All Phase 1.1 profile sections (Datacenter, Retail, Office) now persist correctly
- **Bug #14**: Template questions data seeding issue
  - Fixed: Template questions now populate correctly when organization is created
  - - **Bug #17**: Free tier sites not visible after creation
  - Root Cause: `tenantId === null` check missed `undefined` values (JavaScript loose equality issue)
  - Solution: Changed conditional from `tenantId === null` to `!this.tenantId` for proper falsy checking
  - Fix: Implemented `userId`-based filtering for Free tier users in `TenantStorage.getAllSites()`
  - Impact: All `TenantStorage` method calls now include `userId` parameter for proper Free tier data isolation
  - Testing: Verified in both development and production environments with Free tier test accounts

### Changed
- Schema validation updated to handle both null and undefined values for optional fields
- Improved tenant context middleware to properly validate organization membership

### Testing
- Completed comprehensive smoke testing across Datacenter and Retail profiles
- Validated data persistence for all profile types
- Confirmed multi-tenant isolation is functioning correctly

## [Phase 1.0] - 2025-11-18

### Added
- Core multi-tenant infrastructure
- Organization and tenant management
- Basic profile creation framework
- Authentication system foundation

---

**Phase 1.1 Status**: ✅ DEPLOYED TO PRODUCTION
**Production Health**: 🟢 HEALTHY
**Next Phase**: 1.4 - Authentication & Authorization
