# RiskFixer Manufacturing Template Integration Instructions

## Overview

This document provides step-by-step instructions for integrating the Manufacturing Facility assessment template into RiskFixer. The template includes 5 files totaling ~8,500 lines of code.

---

## Files to Integrate

| File | Destination | Purpose |
|------|-------------|---------|
| `manufacturing-interview-questionnaire.ts` | `server/services/` | 74 interview questions across 10 sections |
| `manufacturing-interview-mapper.ts` | `server/services/` | T×V×I calculation engine with 15 threats |
| `manufacturing-controls-seed.sql` | `db/seeds/` | 80 security controls for database |
| `manufacturing-route-integration-guide.ts` | `server/services/` | API route definitions (reference file) |
| `manufacturing-ai-risk-assessment.ts` | `server/services/` | GPT-4 integration with algorithmic fallback |

---

## Step 1: Copy Service Files

Copy these 4 TypeScript files to `server/services/`:

```bash
# From the outputs directory, copy to server/services/
cp manufacturing-interview-questionnaire.ts server/services/
cp manufacturing-interview-mapper.ts server/services/
cp manufacturing-ai-risk-assessment.ts server/services/
cp manufacturing-route-integration-guide.ts server/services/
```

---

## Step 2: Run Database Seed

The `manufacturing-controls-seed.sql` file adds 80 security controls to the database.

```bash
# Option A: Run SQL directly
psql $DATABASE_URL < manufacturing-controls-seed.sql

# Option B: If using Drizzle migrations, add to seed script
# Add the SQL content to your existing seed file or create new migration
```

**Important:** The SQL file includes DELETE statements to prevent duplicates on re-run. It's safe to execute multiple times.

---

## Step 3: Add Routes to server/routes.ts

### 3.1 Add Imports at Top of File

Add these imports to `server/routes.ts`:

```typescript
// Manufacturing Assessment Imports
import { 
  generateManufacturingRiskScenariosWithAI,
  assessSingleManufacturingThreat,
  generateManufacturingNarrative,
  ManufacturingAssessmentContext,
  ManufacturingAIAssessmentResponse,
} from './services/manufacturing-ai-risk-assessment';

import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  calculateOverallSecurityScore,
  generateControlRecommendations,
  getPrioritizedControlRecommendations,
  calculateRiskForThreat,
  initializeRiskScenariosFromInterview,
  MANUFACTURING_THREATS,
  THREAT_CONTROL_MAPPING,
  QUESTION_THREAT_MAPPING,
} from './services/manufacturing-interview-mapper';

import {
  MANUFACTURING_INTERVIEW_QUESTIONS,
  SECTION_METADATA,
  MANUFACTURING_SECTIONS,
  MANUFACTURING_ZONES,
  getQuestionsBySection,
  getQuestionById,
  getAllQuestionsFlattened,
  getQuestionnaireStats,
} from './services/manufacturing-interview-questionnaire';
```

### 3.2 Add Route Definitions

Copy the complete route block from `manufacturing-route-integration-guide.ts` (the `MANUFACTURING_ROUTES_BLOCK` export) into your `server/routes.ts` file.

The routes to add are:

```typescript
// POST /api/assessments/:id/manufacturing-interview/generate-risks-ai
// POST /api/assessments/:id/manufacturing-interview/assess-single-threat
// POST /api/assessments/:id/manufacturing-interview/generate-narrative
// GET  /api/assessments/:id/manufacturing-interview/threats
// POST /api/assessments/:id/manufacturing-interview/calculate-ip-theft-risk
// GET  /api/controls/manufacturing
// POST /api/assessments/:id/manufacturing-interview/get-control-recommendations
// POST /api/assessments/:id/manufacturing-interview/get-threat-breakdown
// POST /api/assessments/:id/manufacturing-interview/prioritize-threats
// GET  /api/assessments/:id/manufacturing-interview/questions
// GET  /api/assessments/:id/manufacturing-interview/industry-benchmarks
// GET  /api/assessments/:id/manufacturing-interview/zones
// POST /api/assessments/:id/manufacturing-interview/save-responses
```

---

## Step 4: Add Manufacturing Template to Template Registry

If you have a template registry or configuration file, add the manufacturing template:

```typescript
// In your template registry/config
{
  id: 'manufacturing',
  name: 'Manufacturing Facility',
  description: 'Security assessment for manufacturing facilities including production areas, IP protection, and CFATS compliance',
  facilityType: 'manufacturing',
  questionCount: 74,
  sectionCount: 10,
  threatCount: 15,
  controlCount: 80,
  features: [
    'IP theft prevention',
    'Industrial espionage detection',
    'CFATS compliance',
    'Insider threat program',
    'Production area security'
  ],
  icon: 'Factory', // or appropriate icon
  enabled: true,
}
```

---

## Step 5: Update Database Schema (If Needed)

Ensure your `risk_scenarios` table has these columns for AI evidence storage:

```sql
-- Check if columns exist, add if missing
ALTER TABLE risk_scenarios 
ADD COLUMN IF NOT EXISTS ai_evidence JSONB,
ADD COLUMN IF NOT EXISTS ai_confidence VARCHAR(20);
```

---

## Step 6: Verify Environment Variables

Ensure OpenAI API key is configured for AI assessments:

```bash
# Required for AI-powered assessments
OPENAI_API_KEY=your-openai-api-key
```

The system will automatically fall back to algorithmic calculations if the API key is missing or API calls fail.

---

## Step 7: Test the Integration

### 7.1 Test Questions Endpoint

```bash
curl http://localhost:5000/api/assessments/1/manufacturing-interview/questions
```

Expected: Returns 74 questions across 10 sections

### 7.2 Test Threats Endpoint

```bash
curl http://localhost:5000/api/assessments/1/manufacturing-interview/threats
```

Expected: Returns 15 manufacturing threats

### 7.3 Test Controls Endpoint

```bash
curl http://localhost:5000/api/controls/manufacturing
```

Expected: Returns 80 controls across 10 categories

### 7.4 Test Risk Calculation

```bash
curl -X POST http://localhost:5000/api/assessments/1/manufacturing-interview/calculate-ip-theft-risk \
  -H "Content-Type: application/json" \
  -d '{
    "interviewResponses": {
      "facility_1": "discrete_manufacturing",
      "facility_3": "$100 million - $500 million",
      "facility_6": "yes",
      "production_1": "yes",
      "ip_2": "yes",
      "ip_5": "yes",
      "personnel_1": "Yes, comprehensive checks for all employees",
      "personnel_3": "yes"
    }
  }'
```

Expected: Returns security score, IP protection level, insider threat risk

### 7.5 Test Full Scenario Generation (Algorithmic)

```bash
curl -X POST http://localhost:5000/api/assessments/1/manufacturing-interview/generate-risks-ai \
  -H "Content-Type: application/json" \
  -d '{
    "interviewResponses": {
      "facility_1": "discrete_manufacturing",
      "facility_3": "$100 million - $500 million",
      "facility_6": "yes",
      "production_1": "yes"
    },
    "useAI": false
  }'
```

Expected: Returns 15 generated scenarios with risk levels

---

## Step 8: Frontend Integration (Optional)

If integrating with the frontend interview wizard:

### 8.1 Add Manufacturing Option to Assessment Creation

```typescript
// In assessment creation component
const facilityTypes = [
  // ... existing types
  { value: 'manufacturing', label: 'Manufacturing Facility' },
];
```

### 8.2 Use the React Hook (from route-integration-guide.ts)

```typescript
import { useManufacturingAssessment } from '@/hooks/useManufacturingAssessment';

function ManufacturingAssessmentPage({ assessmentId }) {
  const {
    calculateRisk,
    prioritizeThreats,
    generateScenarios,
    saveResponses,
    riskResult,
    isLoading,
  } = useManufacturingAssessment(assessmentId);
  
  // Use in your interview wizard
}
```

---

## File Structure After Integration

```
server/
├── services/
│   ├── manufacturing-interview-questionnaire.ts  (NEW)
│   ├── manufacturing-interview-mapper.ts         (NEW)
│   ├── manufacturing-ai-risk-assessment.ts       (NEW)
│   ├── manufacturing-route-integration-guide.ts  (NEW - reference)
│   ├── warehouse-interview-questionnaire.ts      (existing)
│   ├── warehouse-interview-mapper.ts             (existing)
│   └── ... other services
├── routes.ts  (MODIFIED - add manufacturing routes)
└── ...

db/
├── seeds/
│   ├── manufacturing-controls-seed.sql  (NEW)
│   └── ... other seeds
└── ...
```

---

## Manufacturing Template Specifications

### 10 Interview Sections
1. Facility Profile (10 questions)
2. Perimeter Security (8 questions)
3. Production Area Security (8 questions)
4. IP Protection (8 questions)
5. Inventory & Material Control (8 questions)
6. Shipping & Receiving (7 questions)
7. Personnel Security (8 questions)
8. Contractor Management (7 questions)
9. Surveillance & Monitoring (6 questions)
10. Emergency Response (4 questions)

### 15 Manufacturing Threats
1. Industrial Espionage/IP Theft
2. Equipment Sabotage
3. Raw Material Theft
4. Finished Goods Theft
5. Insider Theft - IP/Data
6. Insider Theft - Physical
7. Workplace Violence (Production Floor)
8. Contractor/Vendor Exploitation
9. Hazmat Theft/Diversion
10. Vandalism - Equipment
11. Trespassing/Unauthorized Access
12. Production Line Disruption
13. Trade Secret Theft
14. Tooling/Dies/Molds Theft
15. Counterfeit Parts Infiltration

### 10 Control Categories (80 total controls)
1. Perimeter Security (10)
2. Production Area Security (12)
3. IP Protection (10)
4. Inventory & Material Control (10)
5. Shipping & Finished Goods (8)
6. Personnel Security (10)
7. Contractor & Vendor Management (7)
8. Surveillance & Monitoring (10)
9. Emergency Response (8)
10. Hazmat Security (5)

---

## Troubleshooting

### Issue: Import errors after adding files
**Solution:** Ensure all import paths are correct. The files expect to be in `server/services/` and import from `@shared/schema` and `../db`.

### Issue: Database seed fails
**Solution:** Run the DELETE statements first if controls already exist, or check for constraint violations.

### Issue: AI assessment returns fallback mode
**Solution:** Verify `OPENAI_API_KEY` environment variable is set. Check OpenAI API rate limits.

### Issue: Routes return 404
**Solution:** Verify routes are added to `server/routes.ts` and the server has been restarted.

### Issue: TypeScript compilation errors
**Solution:** Ensure the `InterviewResponses` type is exported from the mapper file and imported correctly.

---

## Summary Checklist

- [ ] Copy 4 TypeScript files to `server/services/`
- [ ] Run `manufacturing-controls-seed.sql` against database
- [ ] Add imports to `server/routes.ts`
- [ ] Add route definitions to `server/routes.ts`
- [ ] Add manufacturing to template registry
- [ ] Verify `ai_evidence` column exists in `risk_scenarios` table
- [ ] Verify `OPENAI_API_KEY` is set
- [ ] Test endpoints
- [ ] Restart server

---

## Support

Refer to these project files for additional context:
- `RiskFixer-Manufacturing-Framework.md` - Full framework documentation
- `RiskFixer-Manufacturing-Questions-With-Polarity.md` - Question design rationale
- `warehouse-*` files - Reference implementation pattern
