import { useState } from 'react';
import { OverallRiskCard } from './OverallRiskCard';
import { RiskScenarioList } from './RiskScenarioList';
import { RecommendationsSummary } from './RecommendationsSummary';
import { EvidenceTrail } from './EvidenceTrail';
import { ScenarioDetailModal } from './ScenarioDetailModal';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText } from 'lucide-react';

interface RiskProfileTabProps {
  assessmentId: number;
  riskProfile: any;
}

export function RiskProfileTab({ assessmentId, riskProfile }: RiskProfileTabProps) {
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  if (!riskProfile || !riskProfile.scenarios?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Risk Profile Generated Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          Complete the interview questionnaire and generate risks to see your security risk profile.
        </p>
        <Button data-testid="button-go-to-interview">
          Go to Interview
        </Button>
      </div>
    );
  }
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/generate-risks`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to regenerate');
      window.location.reload();
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Risk Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-powered risk assessment based on interview responses and analysis
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          data-testid="button-regenerate-analysis"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          Regenerate Analysis
        </Button>
      </div>
      
      <OverallRiskCard
        threatScore={riskProfile.threatScore}
        threatRating={riskProfile.threatRating}
        vulnerabilityScore={riskProfile.vulnerabilityScore}
        vulnerabilityRating={riskProfile.vulnerabilityRating}
        impactScore={riskProfile.impactScore}
        impactRating={riskProfile.impactRating}
        overallScore={riskProfile.overallScore}
        overallClassification={riskProfile.overallClassification}
        aiConfidence={riskProfile.aiConfidence || 'medium'}
        lastUpdated={riskProfile.lastUpdated}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskScenarioList
          scenarios={riskProfile.scenarios}
          onViewScenario={setSelectedScenario}
        />
        
        <RecommendationsSummary
          recommendations={riskProfile.recommendations || []}
          onViewAll={() => {
          }}
        />
      </div>
      
      <EvidenceTrail
        evidence={riskProfile.evidence || []}
        onViewComplete={() => {
        }}
      />
      
      {selectedScenario && (
        <ScenarioDetailModal
          scenario={selectedScenario}
          onClose={() => setSelectedScenario(null)}
        />
      )}
    </div>
  );
}
