import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface RiskScenario {
  id: number;
  threatName: string;
  threatId: string;
  inherentRisk: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  scenarioDescription: string;
  threatLikelihood: number;
  vulnerability: number;
  impact: number;
}

interface RiskScenarioListProps {
  scenarios: RiskScenario[];
  onViewScenario: (scenario: RiskScenario) => void;
  maxVisible?: number;
}

const RISK_LEVEL_CONFIG = {
  critical: { color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-400', Icon: AlertTriangle },
  high: { color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-400', Icon: AlertCircle },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-400', Icon: Info },
  low: { color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-400', Icon: CheckCircle },
};

export function RiskScenarioList({
  scenarios,
  onViewScenario,
  maxVisible = 8,
}: RiskScenarioListProps) {
  const [showAll, setShowAll] = useState(false);
  
  const sortedScenarios = [...scenarios].sort((a, b) => b.inherentRisk - a.inherentRisk);
  const visibleScenarios = showAll ? sortedScenarios : sortedScenarios.slice(0, maxVisible);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg">Risk Scenarios ({scenarios.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visibleScenarios.map((scenario) => {
            const config = RISK_LEVEL_CONFIG[scenario.riskLevel];
            const IconComponent = config.Icon;
            
            return (
              <button
                key={scenario.id}
                data-testid={`scenario-${scenario.id}`}
                onClick={() => onViewScenario(scenario)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-5 w-5 ${config.textColor}`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{scenario.threatName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      T:{scenario.threatLikelihood} x V:{scenario.vulnerability} x I:{scenario.impact}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${config.textColor}`}>
                    {scenario.inherentRisk}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
        
        {scenarios.length > maxVisible && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setShowAll(!showAll)}
            data-testid="button-toggle-scenarios"
          >
            {showAll ? 'Show Less' : `View All ${scenarios.length} Scenarios`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
