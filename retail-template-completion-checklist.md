# RiskFixer Retail Template Completion Checklist

## ✅ FILES YOU ALREADY HAVE

### Framework & Specification Documents
| File | Location | Size | Purpose |
|------|----------|------|---------|
| `RiskFixer-Retail-Store-Framework.md` | `/mnt/project/` | 74KB | Master specification with threats, controls, interview structure |
| `RiskFixer-Retail-Store-Questions-With-Polarity.md` | `/mnt/project/` | 34KB | 70+ questions with polarity logic, risk weights, bad answers |

### Interview→Risk Mapper (JUST CREATED)
| File | Location | Size | Purpose |
|------|----------|------|---------|
| `retail-interview-mapper.ts` | `/mnt/user-data/outputs/` | 1,646 lines | T×V×I calculations, 15 threats, control recommendations |

### Database Seed Data
| File | Location | Retail Controls |
|------|----------|-----------------|
| `riskfixer-missing-controls-seed.sql` | `/mnt/project/` | 44 retail-specific controls (lines 213-400+) |

### AI Assessment Integration (SHARED)
| File | Location | Retail Support |
|------|----------|----------------|
| `ai-risk-assessment-v2.ts` | `/mnt/project/` | ✅ Has `retail_store` template type, standards, threat landscape |
| `ai-risk-assessment.ts` | `/mnt/project/` | ✅ Has `retail_store` template type |

---

## ⚠️ FILES THAT NEED INTEGRATION (Copy to server/)

These files exist but need to be integrated into your actual codebase:

### 1. Interview→Risk Mapper
```
SOURCE: /mnt/user-data/outputs/retail-interview-mapper.ts
TARGET: server/services/retail-interview-mapper.ts
```

### 2. Route Integration
The `route-integration-guide.ts` shows how to wire up the mapper - needs adaptation for retail:
```typescript
// Add to server/routes.ts
import { 
  initializeRiskScenariosFromInterview, 
  generateControlRecommendations 
} from './services/retail-interview-mapper';
```

---

## ❌ FILES YOU STILL NEED TO BUILD

### LAYER 1: Interview Questionnaire TypeScript
| File | Purpose | Effort | Notes |
|------|---------|--------|-------|
| `server/data/retail-interview-questionnaire.ts` | Convert Questions-With-Polarity.md to TypeScript array | 1-2 days | Export as `RETAIL_INTERVIEW_QUESTIONS` constant |

**Template:**
```typescript
// server/data/retail-interview-questionnaire.ts
export const RETAIL_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'store_profile_1',
    section: 'Store Profile & Operations',
    questionText: 'What is your store format?',
    questionType: 'multiple_choice',
    options: [...],
    required: true,
    informsThreat: ['armed_robbery', 'organized_retail_crime'],
    polarity: 'context',
  },
  // ... 70+ more questions
];
```

---

### LAYER 3: Industry Standards Prompt (Optional for MVP)
| File | Purpose | Effort |
|------|---------|--------|
| `server/prompts/retail-standards.ts` | NRF LP, ASIS Retail Council, ORC standards | 1-2 days |

**Note:** `ai-risk-assessment-v2.ts` already has basic retail standards embedded (lines 268-293), so this is enhancement not blocker.

---

### LAYER 4: Threat Intelligence (Optional for MVP)
| File | Purpose | Effort |
|------|---------|--------|
| `server/threat-intel/retail-intel.ts` | CAP Index + NRF shrinkage + ORC patterns | 1-2 days |

**Note:** The mapper has incident history logic built in - external intel is Phase 2.

---

### Threat Library Code File (Optional)
| File | Purpose | Effort |
|------|---------|--------|
| `server/threat-libraries/retail-threats.ts` | Exportable threat definitions | 0.5 day |

**Note:** The `RETAIL_STORE_THREATS` constant is already in the mapper - this would just be extraction.

---

## 📋 MINIMUM VIABLE RETAIL TEMPLATE

To have a **working retail assessment**, you need at minimum:

### Critical Path (Must Have)
1. ✅ `RiskFixer-Retail-Store-Framework.md` - EXISTS
2. ✅ `RiskFixer-Retail-Store-Questions-With-Polarity.md` - EXISTS  
3. ✅ `retail-interview-mapper.ts` - JUST CREATED (1,646 lines)
4. ✅ `riskfixer-missing-controls-seed.sql` (retail section) - EXISTS
5. ✅ `ai-risk-assessment-v2.ts` with retail support - EXISTS
6. ❌ **`retail-interview-questionnaire.ts`** - NEEDS BUILD (1-2 days)
7. ⚠️ **Route integration** - Copy from `route-integration-guide.ts` and adapt

### Integration Checklist
- [ ] Copy `retail-interview-mapper.ts` to `server/services/`
- [ ] Build `retail-interview-questionnaire.ts` from Questions-With-Polarity.md
- [ ] Run controls seed SQL (retail section)
- [ ] Add retail route handlers to `server/routes.ts`
- [ ] Test interview completion → risk scenario generation flow

---

## 📊 EFFORT SUMMARY

| Category | Files | Status | Remaining Effort |
|----------|-------|--------|------------------|
| Framework Docs | 2 | ✅ Complete | 0 |
| Interview Mapper | 1 | ✅ Complete | Integration only |
| Controls Seed | 1 | ✅ Complete | Run SQL |
| AI Integration | 1 | ✅ Complete | 0 |
| Interview Questionnaire | 1 | ❌ Needs Build | 1-2 days |
| Route Integration | 1 | ⚠️ Adapt | 0.5 day |
| **TOTAL MVP** | **7** | **85% Complete** | **1.5-2.5 days** |

---

## 🚀 RECOMMENDED BUILD ORDER

### Day 1: Core Integration
1. Copy `retail-interview-mapper.ts` → `server/services/`
2. Build `retail-interview-questionnaire.ts` (iterate on Questions-With-Polarity.md)
3. Run retail controls section of seed SQL

### Day 2: Wire It Up  
4. Add retail routes to `server/routes.ts`
5. Test end-to-end: Create assessment → Complete interview → Verify risk scenarios generated
6. Fix any integration bugs

### Post-Launch Enhancement
- Add retail-standards.ts for richer AI responses
- Add retail-intel.ts for external threat data
- Extract retail-threats.ts if needed for other features

---

## Comparison to Office Template

| Component | Office | Retail | Status |
|-----------|--------|--------|--------|
| Framework Doc | ✅ 116KB | ✅ 74KB | Parity |
| Questions w/Polarity | ✅ 35KB | ✅ 34KB | Parity |
| Interview Mapper | ✅ 1,181 lines | ✅ 1,646 lines | **Retail is more detailed** |
| Controls Seed | ✅ Yes | ✅ 44 controls | Parity |
| AI Integration | ✅ Yes | ✅ Yes | Parity |
| Questionnaire TS | ⚠️ Needs Build | ❌ Needs Build | Same state |

**Retail template is at feature parity with Office** - both just need the TypeScript questionnaire file and route integration to be fully functional.
