# Changelog

All notable changes to the RiskFixer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Phase 1.1] - 2025-12-02

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
