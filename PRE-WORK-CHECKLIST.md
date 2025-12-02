# PRE-WORK CHECKLIST

> **Purpose**: Mandatory verification steps before ANY code changes to RiskFixer.
> **Authority**: CTO-Approved Protocol
> **Last Updated**: 2025-12-02

---

## CRITICAL: AI Context Verification

**When pasting this into an AI chat, you must explicitly ask the AI:**

> "Do you see the file `shared/schema.ts` in your current context? If not, stop and request it."

This ensures the AI has access to the database schema before making any recommendations.

---

## Section 1: Environment Verification

### 1.1 Database Connection
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL | grep -q "postgres" && echo "✓ DATABASE_URL configured" || echo "✗ DATABASE_URL missing"
```

### 1.2 Check Current Migration State
```sql
-- Verify migration tracking table exists and check last migration
SELECT * FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 5;
```

### 1.3 Verify Git State
```bash
# Must be on correct branch with clean working directory
git status
git branch --show-current
```

---

## Section 2: Schema Context Loading

### 2.1 Required Files to Review Before Any Database Work

| File | Purpose | Location |
|------|---------|----------|
| Database Schema | Table definitions, relationships, types | `shared/schema.ts` |
| API Routes | All endpoint definitions | `server/routes.ts` |
| Database Migrations | Applied schema changes | `db/migrations/` |
| Project State | Current development context | `PROJECT-STATE.md` |

### 2.2 Load Schema Into Context
```bash
# Display current schema for AI context
cat shared/schema.ts
```

### 2.3 Check Pending Migrations
```bash
# List migration files
ls -la db/migrations/
```

---

## Section 3: Dependency Check

### 3.1 Verify Node Modules
```bash
npm install
npm run check  # TypeScript type checking
```

### 3.2 Check for Breaking Changes
```bash
# Review recent commits that might affect your work
git log --oneline -10
```

---

## Section 4: Context Synchronization

### 4.1 Read PROJECT-STATE.md
Before starting work, review the current project state:
```bash
cat PROJECT-STATE.md
```

### 4.2 Identify Active Work Items
- [ ] Current phase documented
- [ ] Previous session's work understood
- [ ] No conflicting changes in progress

### 4.3 Verify No Blocking Issues
- [ ] Check for open PRs that might conflict
- [ ] Review any failed deployments
- [ ] Confirm database is in expected state

---

## Section 5: Pre-Work Sign-Off

Before proceeding with any code changes, confirm:

- [ ] **DATABASE_URL** is configured and accessible
- [ ] **Git branch** is correct for this work
- [ ] **Schema file** (`shared/schema.ts`) is loaded in AI context
- [ ] **Routes file** (`server/routes.ts`) is available if modifying APIs
- [ ] **Migration history** is understood
- [ ] **PROJECT-STATE.md** has been reviewed
- [ ] **No conflicting work** is in progress

---

## Quick Reference: RiskFixer Architecture

```
riskfixer/
├── shared/
│   └── schema.ts          # ← Database schema (Drizzle ORM)
├── server/
│   ├── routes.ts          # ← All API endpoints
│   ├── index.ts           # Express server setup
│   └── dbStorage.ts       # Database operations
├── client/src/
│   ├── pages/             # React route pages
│   └── components/        # UI components
├── db/
│   └── migrations/        # ← SQL migration files
└── PROJECT-STATE.md       # Current development context
```

---

**STOP**: Do not proceed to development until all items are checked.
