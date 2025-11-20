import { calculateInherentRisk, calculateControlEffectiveness, calculateResidualRiskNBS, getAnswerFidelity } from './shared/riskCalculations';

console.log("=== Risk Calculation Logic Verification Test ===\n");

// Test Case: L=5, I=5, Preventative control (0.40 weight) with Partial fidelity (0.5)
const likelihood = 5;
const impact = 5;
const preventativeWeight = 0.40; // From control_library for preventative controls
const partialFidelity = 0.5; // Partial answer

console.log("Test Scenario:");
console.log(`  Likelihood: ${likelihood}`);
console.log(`  Impact: ${impact}`);
console.log(`  Control Type: Preventative (Weight: ${preventativeWeight})`);
console.log(`  Answer Fidelity: Partial (${partialFidelity})\n`);

// Calculate inherent risk
const inherentRisk = calculateInherentRisk(likelihood, impact);
console.log(`✓ Inherent Risk (L × I): ${inherentRisk}`);

// Mock survey responses with one preventative control answered "Partial"
const mockSurveyResponses = [
  {
    questionId: 'test-q1',
    answer: 'partial',
    controlName: 'Access Control System',
    controlWeight: preventativeWeight,
    controlType: 'PREVENTATIVE'
  }
];

// Calculate control effectiveness
const controlEffectiveness = calculateControlEffectiveness(mockSurveyResponses);
console.log(`✓ Control Effectiveness (Σ Weight × Fidelity): ${controlEffectiveness.toFixed(2)}`);

// Calculate residual risk
const residualRisk = calculateResidualRiskNBS(inherentRisk, controlEffectiveness);
console.log(`✓ Residual Risk (R_inh × (1 - Ce)): ${residualRisk.toFixed(2)}\n`);

// Verify expected results
const expectedCe = 0.20; // 0.40 × 0.5
const expectedResidual = 20.0; // 25 × (1 - 0.20)

console.log("Expected Results:");
console.log(`  Control Effectiveness: ${expectedCe}`);
console.log(`  Residual Risk: ${expectedResidual}\n`);

console.log("Validation:");
const ceMatch = Math.abs(controlEffectiveness - expectedCe) < 0.01;
const residualMatch = Math.abs(residualRisk - expectedResidual) < 0.01;

console.log(`  Control Effectiveness Match: ${ceMatch ? '✅ PASS' : '❌ FAIL'} (${controlEffectiveness.toFixed(2)} vs ${expectedCe})`);
console.log(`  Residual Risk Match: ${residualMatch ? '✅ PASS' : '❌ FAIL'} (${residualRisk.toFixed(2)} vs ${expectedResidual})`);

if (ceMatch && residualMatch) {
  console.log("\n🎉 Logic Verification PASSED! Weighted calculations are working correctly.");
  process.exit(0);
} else {
  console.log("\n❌ Logic Verification FAILED! Check calculation formulas.");
  process.exit(1);
}
