# POST-WORK VERIFICATION PROTOCOL

> **Purpose**: Mandatory verification steps AFTER completing any code changes to RiskFixer.
> **Authority**: CTO-Approved Protocol
> **Last Updated**: 2025-12-02

---

## Section 1: Code Quality Verification

### 1.1 TypeScript Compilation
```bash
npm run check
```
**Requirement**: Zero TypeScript errors.

### 1.2 Linting (if configured)
```bash
npm run lint 2>/dev/null || echo "No lint script configured"
```

### 1.3 Code Review Checklist
- [ ] No hardcoded secrets or credentials
- [ ] No `console.log` statements left in production code
- [ ] Proper error handling implemented
- [ ] TypeScript types properly defined (no `any` abuse)

---

## Section 2: Database Verification

### 2.1 Schema Sync Check
```bash
# Verify schema matches database
npm run db:push --dry-run 2>/dev/null || echo "Run migration check manually"
```

### 2.2 Migration Integrity
```sql
-- Verify all migrations applied
SELECT * FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 5;
```

### 2.3 Data Integrity Spot Check
```sql
-- Example: Verify foreign key relationships are intact
SELECT COUNT(*) as orphaned_assessments
FROM assessments a
LEFT JOIN users u ON a.user_id = u.id
WHERE u.id IS NULL;
```

---

## Section 3: Functional Verification

### 3.1 Critical Path Testing
Test these core flows manually or via API:

| Flow | Endpoint/Action | Expected Result |
|------|-----------------|-----------------|
| Authentication | POST `/api/auth/login` | Returns user session |
| Create Assessment | POST `/api/assessments` | Returns new assessment ID |
| List Assessments | GET `/api/assessments` | Returns user's assessments |
| Update Assessment | PUT `/api/assessments/:id` | Returns updated assessment |

### 3.2 Regression Check
- [ ] Existing features still work
- [ ] No new console errors in browser
- [ ] API responses have correct structure

### 3.3 FAILURE PROTOCOL

> **CRITICAL**: If Step 3 fails (critical functionality broken):

1. **Immediate Revert**: Roll back the Replit deployment to the previous commit
   ```bash
   git revert HEAD --no-edit
   git push
   ```

2. **Database Rollback** (if migration caused the issue):
   ```sql
   -- Document the rollback SQL in db/migrations/
   -- Execute rollback statements carefully
   ```

3. **Incident Documentation**: Create an issue documenting:
   - What broke
   - Root cause (if known)
   - Steps taken to remediate
   - Prevention measures for future

4. **Notify Team**: Alert relevant stakeholders before re-attempting the change

---

## Section 4: Deployment Verification

### 4.1 Force Server Restart
After any deployment or database sync:

1. **Trigger Restart**: In Replit, stop and restart the deployment
2. **Verify in Console Logs** that the server has:
   - Started successfully
   - Connected to the database AFTER the sync
   - No startup errors

```bash
# Look for these indicators in logs:
# ✓ "Server running on port 3000" (or similar)
# ✓ "Database connected" (or similar)
# ✗ No "ECONNREFUSED" or "relation does not exist" errors
```

### 4.2 Health Check
```bash
# Verify server responds
curl -s http://localhost:3000/api/health || curl -s http://localhost:5000/api/health
```

### 4.3 Environment Verification
- [ ] All environment variables loaded
- [ ] Database connection pool healthy
- [ ] No memory leaks or runaway processes

---

## Section 5: Documentation Update

### 5.1 Update PROJECT-STATE.md

**Required Updates**:
1. Update `## Current Phase` to reflect completed work
2. Add entry to `## Session Log` with:
   - Date
   - Work completed
   - Files modified
   - **Verification Evidence Link** (see below)

### 5.2 Verification Evidence

> **IMPORTANT**: Don't just add text—provide a pointer/link to verification evidence.

**Evidence Types**:
- Link to the specific comment in the PR/issue
- Screenshot in the "Verification Evidence" section of the PR
- Link to successful CI/CD run
- Database query results (sanitized)

**Example Entry**:
```markdown
### Session: 2025-12-02
**Work**: Added organizationId to sites and assessments tables
**Files**: shared/schema.ts, db/migrations/0002_*.sql
**Verification**: [PR #42 - Verification Comment](link-to-comment)
```

### 5.3 Commit Documentation Changes
```bash
git add PROJECT-STATE.md
git commit -m "docs: Update project state after [brief description]"
git push
```

---

## Section 6: Final Sign-Off

Before considering work complete, confirm ALL items:

### Code Quality
- [ ] TypeScript compiles without errors
- [ ] No linting errors
- [ ] Code review checklist passed

### Database
- [ ] Schema synchronized
- [ ] Migrations applied successfully
- [ ] Data integrity verified

### Functionality
- [ ] Critical paths tested
- [ ] No regressions introduced
- [ ] (If failed, FAILURE PROTOCOL executed)

### Deployment
- [ ] Server restarted and verified in logs
- [ ] Health check passed
- [ ] Environment stable

### Documentation
- [ ] PROJECT-STATE.md updated
- [ ] Verification evidence linked
- [ ] Changes committed and pushed

---

## Quick Verification Commands

```bash
# Run all checks in sequence
npm run check && \
echo "✓ TypeScript OK" && \
git status && \
echo "✓ Git status reviewed"
```

---

**STOP**: Do not mark work as complete until all sections are verified.
