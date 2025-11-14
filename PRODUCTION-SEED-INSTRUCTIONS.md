# Production Database Template Questions Seed

## Problem
Production database is missing the 39 template questions needed to create executive assessments. When users try to create an executive assessment, they get "Cannot create assessment unknown error" because there's no source data to copy from.

## Solution
Run this one-time seed script to populate the `template_questions` table in **production** database.

## ⚠️ IMPORTANT SAFETY NOTES
- This script **ONLY** touches the `template_questions` table
- It **WILL NOT** modify users, organizations, assessments, sites, or any other user data
- It's safe to run multiple times (it will delete old executive-protection questions and re-insert)
- You must have your **production** `DATABASE_URL` environment variable set

## How to Run

### Step 1: Set Production Database URL
In the Replit Secrets pane, temporarily update `DATABASE_URL` to point to your **production** database:

```
DATABASE_URL=postgresql://...your-production-db-url...
```

### Step 2: Run the Seed Script
In the Shell tab, run:

```bash
tsx server/seed-production-templates.ts
```

### Step 3: Verify Success
You should see output like:

```
✅ Successfully inserted 39 template questions
✅ Verification: template_questions now has 39 rows for executive-protection
```

### Step 4: Restore Development Database URL
**IMPORTANT:** After seeding, restore your `DATABASE_URL` back to the development database URL so you don't accidentally work against production.

### Step 5: Test in Production
Go to your production app and create a new executive assessment. All 39 survey questions should now auto-populate correctly.

## What This Script Does

1. Reads `server/data/executive-survey-questions.csv` (39 questions)
2. Parses and categorizes each question
3. Deletes any existing `executive-protection` template questions
4. Inserts the 39 new template questions
5. Verifies the count

## Development vs Production Comparison

**Development (working):**
- template_questions: 39 rows ✅
- Assessments create successfully ✅

**Production (before fix):**
- template_questions: 0 rows ❌
- Assessment creation fails ❌

**Production (after fix):**
- template_questions: 39 rows ✅
- Assessments create successfully ✅

## Troubleshooting

**Error: "CSV file not found"**
- Make sure you're running from the project root directory
- Check that `server/data/executive-survey-questions.csv` exists

**Error: "DATABASE_URL environment variable is required"**
- Set the production DATABASE_URL in Replit Secrets

**Script runs but production still broken**
- Verify you ran against production DB (not development)
- Check the verification output shows 39 rows
- Verify the `templateId` is `'executive-protection'` (matches your assessment template)
