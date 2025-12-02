# MANDATORY DEVELOPMENT PROTOCOL

> **Purpose**: Master workflow document that governs ALL development work on RiskFixer.
> **Authority**: CTO-Approved Protocol
> **Enforcement**: ALL developers (human and AI) MUST follow this protocol.
> **Last Updated**: 2025-12-02

---

## Protocol Overview

This document defines the **mandatory workflow** for any development work on RiskFixer. It integrates three supporting documents into a cohesive, enforceable process.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    │
│   │  PRE-WORK   │───▶│   DEVELOP   │───▶│   POST-WORK     │    │
│   │  CHECKLIST  │    │   (Work)    │    │  VERIFICATION   │    │
│   └─────────────┘    └─────────────┘    └─────────────────┘    │
│         │                   │                    │              │
│         ▼                   ▼                    ▼              │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              PROJECT-STATE.md (Living Document)          │  │
│   │         - Read before work, Update after work -          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Supporting Documents

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [PROJECT-STATE.md](./PROJECT-STATE.md) | Current project context, phase, and session history | Read at start, update at end |
| [PRE-WORK-CHECKLIST.md](./PRE-WORK-CHECKLIST.md) | Environment and context verification | Before ANY code changes |
| [POST-WORK-VERIFICATION.md](./POST-WORK-VERIFICATION.md) | Quality assurance and deployment validation | After ALL code changes |

---

## Phase 1: PRE-WORK (Mandatory)

**Document**: `PRE-WORK-CHECKLIST.md`

### Required Steps

1. **Read PROJECT-STATE.md**
   - Understand current phase
   - Review recent session logs
   - Identify any blocking issues

2. **Verify Environment**
   - Database connection active
   - Correct Git branch checked out
   - Working directory clean

3. **Load Context** (Critical for AI Development)
   - Load `shared/schema.ts` into context
   - Load `server/routes.ts` if modifying APIs
   - Review relevant migration files

4. **AI Context Verification**
   > When using AI assistance, explicitly ask:
   > "Do you see the file `shared/schema.ts` in your current context? If not, stop and request it."

5. **Sign-Off**
   - All checklist items verified
   - Ready to proceed

**GATE**: Do NOT proceed to development until all pre-work items are complete.

---

## Phase 2: DEVELOPMENT (Active Work)

### Development Standards

#### 2.1 Code Changes
- Follow existing patterns in codebase
- Maintain TypeScript type safety
- Document complex logic with comments
- No hardcoded secrets or credentials

#### 2.2 Database Changes
- ALL schema changes via migration files
- Migrations MUST be idempotent (safe to run multiple times)
- Backfill data when adding required columns
- Test migrations in development before production

#### 2.3 API Changes
- Maintain backward compatibility when possible
- Document breaking changes in PR description
- Update TypeScript types in `shared/schema.ts`

#### 2.4 Commit Standards
```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code restructuring
- docs: Documentation only
- chore: Maintenance tasks
- db: Database changes
```

#### 2.5 Incremental Commits
- Commit logical units of work
- Don't bundle unrelated changes
- Write meaningful commit messages

---

## Phase 3: POST-WORK (Mandatory)

**Document**: `POST-WORK-VERIFICATION.md`

### Required Steps

1. **Code Quality**
   - TypeScript compilation: `npm run check`
   - Zero errors required
   - Review for security issues

2. **Database Verification**
   - Schema sync confirmed
   - Migration integrity verified
   - Data integrity spot-checked

3. **Functional Verification**
   - Critical paths tested
   - No regressions
   - **FAILURE PROTOCOL** if critical functionality broken

4. **Deployment Verification**
   - Force server restart
   - Verify startup in console logs
   - Health check passed

5. **Documentation Update**
   - Update PROJECT-STATE.md
   - Include verification evidence link
   - Commit and push

**GATE**: Work is NOT complete until all post-work verification passes.

---

## Failure Handling

### If Pre-Work Fails
- STOP - Do not proceed
- Resolve blocking issues first
- Re-run pre-work checklist

### If Development Encounters Issues
- Commit work-in-progress to branch
- Document the blocker in PROJECT-STATE.md
- Seek assistance before continuing

### If Post-Work Verification Fails

**Critical Failure (functionality broken):**
1. Immediately revert deployment
2. Roll back database migration if applicable
3. Document incident
4. Notify team

**Non-Critical Failure:**
1. Fix the issue
2. Re-run verification
3. Document resolution

---

## AI Development Guidelines

When working with AI assistants on RiskFixer:

### Context Requirements
AI assistants MUST have access to:
- `shared/schema.ts` - Database schema
- `server/routes.ts` - API definitions (if modifying)
- `PROJECT-STATE.md` - Current context
- Relevant migration files

### Verification Prompt
Always ask the AI:
> "Before we proceed, confirm you have `shared/schema.ts` loaded. What tables do you see defined?"

### AI Handoff Protocol
When ending an AI session:
1. Ensure all changes are committed
2. Update PROJECT-STATE.md with session summary
3. Document any incomplete work
4. Push all changes to remote

---

## Quick Reference

### File Locations
```
shared/schema.ts      # Database schema
server/routes.ts      # API endpoints
db/migrations/        # SQL migrations
PROJECT-STATE.md      # Project context
```

### Essential Commands
```bash
# Pre-work
cat PROJECT-STATE.md
cat shared/schema.ts
git status

# Development
npm run check         # TypeScript validation
npm run dev           # Start dev server

# Post-work
npm run check
git add . && git commit -m "type: description"
git push
```

### Migration Template
```sql
-- Migration: [Description]
-- Date: YYYY-MM-DD
-- Idempotent: Yes

BEGIN;

-- Changes here

COMMIT;
```

---

## Protocol Enforcement

### For Human Developers
- Self-enforce protocol compliance
- Call out violations in code review
- Update protocols when improvements identified

### For AI Assistants
- Reference this document at session start
- Follow checklist items explicitly
- Document compliance in responses

### For Code Reviews
- Verify PROJECT-STATE.md was updated
- Check for verification evidence
- Confirm post-work checklist completed

---

## Document Maintenance

These protocol documents should be updated when:
- New patterns or standards are established
- Failure modes are discovered and addressed
- Team feedback identifies improvements
- Architecture changes require process updates

**Change Process**:
1. Propose change in PR
2. CTO approval required for protocol changes
3. Update all affected documents together
4. Announce changes to team

---

**REMEMBER**: This protocol exists to prevent data loss, deployment failures, and context loss between sessions. Following it is not optional.
