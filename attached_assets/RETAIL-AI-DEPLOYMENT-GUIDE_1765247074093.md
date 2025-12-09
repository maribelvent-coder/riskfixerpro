# RiskFixer Retail AI Framework - Complete Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the complete 6-phase Retail AI Assessment Framework. The framework matches the sophistication of the Executive Protection template and includes GPT-4 powered risk assessment with algorithmic fallback.

---

## Phase Summary

| Phase | Component | File | Status |
|-------|-----------|------|--------|
| **1** | AI Assessment Module | `retail-ai-risk-assessment.ts` | ✅ EXISTS (1,229 lines) |
| **2** | Route Integration | `retail-routes-integration.ts` | 📄 CREATED |
| **3** | Database Schema | `retail-ai-migration.sql` | 📄 CREATED |
| **4** | Interview Questionnaire | `retail-interview-questionnaire-final.ts` | ✅ EXISTS (2,100+ lines) |
| **5** | Frontend Components | `RetailInterviewWizard.tsx`, `RetailRiskDashboard.tsx` | 📄 CREATED |
| **6** | PDF Report Template | `retail-report-template.tsx` | 📄 CREATED |

---

## Deployment Steps

### Step 1: Run Database Migration

Execute the SQL migration to add AI evidence columns:

```bash
# Connect to your PostgreSQL database and run:
psql -U your_user -d your_database -f retail-ai-migration.sql

# Or via your ORM migration tool:
npm run db:push
```

**Verify migration success:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'risk_scenarios' 
AND column_name IN ('ai_evidence', 'ai_confidence', 'assessment_mode');

-- Should return 3 rows
```

---

### Step 2: Copy Service Files

Copy the AI assessment module to your server services directory:

```bash
# From project root:
cp /mnt/project/retail-ai-risk-assessment.ts server/services/
cp retail-routes-integration.ts server/services/
```

---

### Step 3: Update Routes.ts

Add imports to the top of `server/routes.ts`:

```typescript
import {
  generateRetailRiskScenariosWithAI,
  assessSingleRetailThreat,
  generateRetailNarrativeSummary,
  RETAIL_STORE_THREATS,
  handleGenerateRetailRisksAI,
  handleAssessSingleRetailThreat,
  handleGenerateRetailNarrative,
} from './services/retail-ai-risk-assessment';

import {
  calculateOverallSecurityScore,
  generateControlRecommendations,
} from './services/retail-interview-mapper';

import {
  RETAIL_INTERVIEW_QUESTIONS,
  getQuestionsBySection,
  getAllQuestionsFlattened,
  validateQuestionnaire,
  getQuestionnaireStats,
} from './data/retail-interview-questionnaire-final';
```

Then copy the route handlers from `retail-routes-integration.ts` into `routes.ts`.

---

### Step 4: Seed Retail Controls (if needed)

Verify retail controls exist in database:

```sql
SELECT COUNT(*) as count FROM security_controls WHERE facility_type = 'retail_store';
```

If count is 0, run the retail controls seed:

```bash
psql -U your_user -d your_database -f retail-controls-complete.sql
```

---

### Step 5: Copy Frontend Components

Copy React components to your client/components directory:

```bash
cp RetailInterviewWizard.tsx client/src/components/retail/
cp RetailRiskDashboard.tsx client/src/components/retail/
```

---

### Step 6: Add PDF Report Template

Copy the report template:

```bash
cp retail-report-template.tsx server/report-templates/
```

Add the PDF generation route to `routes.ts`:

```typescript
import { generateRetailPDF } from './report-templates/retail-report-template';

app.post('/api/assessments/:id/retail/generate-pdf', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch assessment data and build report data object
    const reportData = await buildRetailReportData(parseInt(id));
    
    const pdf = await generateRetailPDF(reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="retail-assessment-${id}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
```

---

## API Endpoints Reference

After deployment, these endpoints will be available:

### Assessment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assessments/:id/retail-interview/generate-risks-ai` | Main AI assessment |
| POST | `/api/assessments/:id/retail-interview/assess-single-threat` | Test single threat |
| POST | `/api/assessments/:id/retail-interview/generate-narrative` | Executive summary |

### Interview Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assessments/:id/retail-interview/questionnaire` | Get questionnaire |
| POST | `/api/assessments/:id/retail-interview/save` | Save responses |
| POST | `/api/assessments/:id/retail-interview/calculate-shrinkage-risk` | Real-time indicator |

### Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assessments/:id/retail-interview/threats` | Get threat library |
| GET | `/api/controls/retail-store` | Get retail controls |
| POST | `/api/assessments/:id/retail-interview/get-control-recommendations` | Get recommendations |

### Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assessments/:id/retail/generate-pdf` | Generate PDF report |

---

## Testing the Deployment

### Test 1: Verify AI Assessment

```bash
curl -X POST http://localhost:5000/api/assessments/1/retail-interview/generate-risks-ai \
  -H "Content-Type: application/json" \
  -d '{
    "interviewResponses": {
      "store_profile_1": "Specialty retail (apparel, shoes, accessories)",
      "shrinkage_1": "2-3% (elevated)",
      "eas_1": "yes",
      "cctv_1": "yes",
      "lp_staff_1": "Part-time LP coverage"
    },
    "useAI": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "mode": "ai",
  "generatedScenarios": 15,
  "criticalRisks": 2,
  "highRisks": 4,
  "mediumRisks": 6,
  "lowRisks": 3,
  "aiConfidence": "high",
  "processingTimeMs": 12500
}
```

### Test 2: Verify Shrinkage Calculator

```bash
curl -X POST http://localhost:5000/api/assessments/1/retail-interview/calculate-shrinkage-risk \
  -H "Content-Type: application/json" \
  -d '{
    "interviewResponses": {
      "shrinkage_1": "2-3% (elevated)",
      "eas_1": "yes",
      "cctv_1": "yes",
      "lp_staff_1": "no_lp"
    }
  }'
```

### Test 3: Verify Questionnaire

```bash
curl http://localhost:5000/api/assessments/1/retail-interview/questionnaire
```

---

## Environment Variables

Ensure these environment variables are set:

```env
# Required for AI features
OPENAI_API_KEY=sk-your-key-here

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/riskfixer

# Optional: AI model settings
OPENAI_MODEL=gpt-4o
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=4000
```

---

## Troubleshooting

### AI Assessment Fails

If AI assessment returns "fallback" mode:

1. **Check OpenAI API key** - Verify `OPENAI_API_KEY` is set correctly
2. **Check rate limits** - You may be hitting OpenAI rate limits
3. **Check timeout** - Increase `AI_CONFIG.timeoutMs` in `retail-ai-risk-assessment.ts`

The system will automatically fall back to algorithmic calculation if AI fails.

### Database Errors

If you get "column does not exist" errors:

1. Re-run the migration SQL
2. Verify migration with the SELECT query in Step 1
3. Check for pending Drizzle migrations

### Missing Controls

If control recommendations are empty:

1. Verify retail controls were seeded
2. Run: `SELECT COUNT(*) FROM security_controls WHERE facility_type = 'retail_store'`
3. Expected count: 50-80 controls

---

## Frontend Integration

### Interview Wizard Usage

```tsx
import { RetailInterviewWizard } from '@/components/retail/RetailInterviewWizard';

function AssessmentPage() {
  const { id } = useParams();
  
  const handleComplete = (results) => {
    console.log('Assessment complete:', results);
    navigate(`/assessments/${id}/results`);
  };
  
  return (
    <RetailInterviewWizard
      assessmentId={parseInt(id)}
      onComplete={handleComplete}
    />
  );
}
```

### Risk Dashboard Usage

```tsx
import { RetailRiskDashboard } from '@/components/retail/RetailRiskDashboard';

function ResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  
  useEffect(() => {
    // Fetch assessment results
    fetch(`/api/assessments/${id}/risk-scenarios`)
      .then(res => res.json())
      .then(data => {
        setResults(data.summary);
        setScenarios(data.scenarios);
      });
  }, [id]);
  
  return (
    <RetailRiskDashboard
      assessmentId={parseInt(id)}
      results={results}
      scenarios={scenarios}
      onGenerateReport={() => {/* PDF generation */}}
      onRefreshAssessment={() => {/* Refresh */}}
    />
  );
}
```

---

## File Structure After Deployment

```
server/
├── services/
│   ├── retail-ai-risk-assessment.ts      ← Phase 1 (1,229 lines)
│   ├── retail-interview-mapper.ts        ← Existing
│   └── retail-routes-integration.ts      ← Phase 2
├── data/
│   └── retail-interview-questionnaire-final.ts  ← Phase 4 (2,100+ lines)
├── report-templates/
│   └── retail-report-template.tsx        ← Phase 6
└── routes.ts                             ← Updated with retail routes

client/
└── src/
    └── components/
        └── retail/
            ├── RetailInterviewWizard.tsx  ← Phase 5
            └── RetailRiskDashboard.tsx    ← Phase 5

migrations/
└── retail-ai-migration.sql               ← Phase 3
```

---

## Quality Verification Checklist

Before going live, verify:

- [ ] All 6 phases deployed
- [ ] Database migration complete
- [ ] 15 retail threats in threat library
- [ ] 50+ retail controls seeded
- [ ] AI assessment returns results
- [ ] Algorithmic fallback works
- [ ] Interview wizard loads all 11 sections
- [ ] Shrinkage indicator updates in real-time
- [ ] PDF report generates correctly
- [ ] Dashboard displays all risk scenarios

---

## Support

For issues with this deployment:

1. Check the RiskFixer-AI-Assessment-Framework-v1_0.md for methodology details
2. Review retail-ai-implementation-guide.md for implementation specifics
3. Consult RiskFixer-Retail-Store-Framework.md for threat/control mappings

---

**Deployment Complete!** 🎉

The retail AI framework now matches the sophistication of the Executive Protection template with:
- GPT-4 powered T×V×I assessment
- Algorithmic fallback for reliability
- Real-time shrinkage risk indicator
- 15 retail-specific threats
- 50+ security controls
- Professional PDF reports
- Evidence-based audit trail
