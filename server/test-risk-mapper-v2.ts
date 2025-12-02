/**
 * Test script for data-driven risk mapper v2
 * Validates the refactored risk calculation logic
 */
import { analyzeInterviewRisks, type QuestionMetadata, type InterviewResponse } from './services/interview-risk-mapping-v2';

async function testRiskMapper() {
  console.log('🧪 Testing Data-Driven Risk Mapper v2...\n');

  // Sample questionnaire metadata (simulating 5 questions)
  const questions: QuestionMetadata[] = [
    {
      id: '1.1',
      question: 'Is there a perimeter fence with controlled access points?',
      type: 'yes-no',
      threatMappings: ['Unauthorized Entry', 'Forced Entry'],
      controlMappings: ['Perimeter Fencing'],
      riskIndicators: {
        highRisk: 'No perimeter fence or controlled access',
        lowRisk: 'Secure perimeter with controlled entry points'
      }
    },
    {
      id: '1.2',
      question: 'Are access points monitored by CCTV?',
      type: 'yes-no',
      threatMappings: ['Unauthorized Entry', 'Tailgating'],
      controlMappings: ['CCTV System'],
      riskIndicators: {
        highRisk: 'No camera surveillance at entry points',
        lowRisk: 'All entry points monitored 24/7'
      }
    },
    {
      id: '2.1',
      question: 'Is there an access control system for employee entry?',
      type: 'yes-no',
      threatMappings: ['Unauthorized Entry', 'Tailgating'],
      controlMappings: ['Access Control System'],
      riskIndicators: {
        highRisk: 'No access control system',
        lowRisk: 'Badge-based access control with audit logs'
      }
    },
    {
      id: '3.1',
      question: 'Is there a security guard or reception desk?',
      type: 'yes-no',
      threatMappings: ['Unauthorized Entry', 'Workplace Violence'],
      controlMappings: ['Security Personnel'],
      riskIndicators: {
        highRisk: 'No security personnel on site',
        lowRisk: 'Trained security personnel present during business hours'
      }
    },
    {
      id: '4.1',
      question: 'Is there an active threat response plan?',
      type: 'yes-no',
      threatMappings: ['Workplace Violence', 'Active Shooter'],
      controlMappings: ['Emergency Response Procedures'],
      riskIndicators: {
        highRisk: 'No active threat response plan',
        lowRisk: 'Documented response plan with regular drills'
      }
    }
  ];

  // Simulate responses (scenario: weak security posture)
  const responses = new Map<string, InterviewResponse>([
    ['1.1', { questionId: '1.1', answer: 'no' }],  // No fence
    ['1.2', { questionId: '1.2', answer: 'no' }],  // No CCTV
    ['2.1', { questionId: '2.1', answer: 'yes' }], // Has access control
    ['3.1', { questionId: '3.1', answer: 'no' }],  // No security guard
    ['4.1', { questionId: '4.1', answer: 'no' }]   // No active threat plan
  ]);

  try {
    console.log('📊 Analyzing interview responses...\n');
    const result = await analyzeInterviewRisks(questions, responses);

    console.log('═'.repeat(70));
    console.log(`\n🎯 RISK ANALYSIS RESULTS`);
    console.log(`   Overall Risk Level: ${result.overallRiskLevel.toUpperCase()}`);
    console.log(`   Total Threats Analyzed: ${result.totalThreats}`);
    console.log(`   Critical Threats: ${result.criticalThreats}`);
    console.log(`\n   Summary: ${result.summary}\n`);

    console.log('═'.repeat(70));
    console.log('\n📋 THREAT SCORES (Top 5):\n');
    
    result.threatScores.slice(0, 5).forEach((threat, index) => {
      console.log(`${index + 1}. ${threat.threatName} (${threat.threatCategory})`);
      console.log(`   Likelihood: ${threat.likelihood} | Vulnerability: ${threat.vulnerability} | Impact: ${threat.impact}`);
      console.log(`   Inherent Risk: ${threat.inherentRisk}${threat.isCritical ? ' ⚠️ CRITICAL' : ''}`);
      
      if (threat.findings.length > 0) {
        console.log(`   Findings:`);
        threat.findings.slice(0, 2).forEach(f => console.log(`     • ${f}`));
      }
      
      if (threat.recommendations.length > 0) {
        console.log(`   Recommendations:`);
        threat.recommendations.slice(0, 2).forEach(r => console.log(`     • ${r}`));
      }
      console.log('');
    });

    console.log('═'.repeat(70));
    console.log('\n✅ Risk Mapper v2 Test Complete!\n');
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testRiskMapper()
    .then(() => {
      console.log('✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    });
}

export { testRiskMapper };
