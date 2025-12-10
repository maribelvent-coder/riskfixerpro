import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

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

interface ScenarioDetailModalProps {
  scenario: RiskScenario;
  onClose: () => void;
}

const RISK_LEVEL_CONFIG = {
  critical: { color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-400', Icon: AlertTriangle, label: 'Critical' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-400', Icon: AlertCircle, label: 'High' },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-400', Icon: Info, label: 'Medium' },
  low: { color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-400', Icon: CheckCircle, label: 'Low' },
};

export function ScenarioDetailModal({ scenario, onClose }: ScenarioDetailModalProps) {
  const config = RISK_LEVEL_CONFIG[scenario.riskLevel];
  const IconComponent = config.Icon;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${config.textColor}`} />
            {scenario.threatName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Badge className={`${config.color} text-white`}>
              {config.label} Risk
            </Badge>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Score: {scenario.inherentRisk}/125
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {scenario.threatLikelihood}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Threat (T)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {scenario.vulnerability}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vulnerability (V)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {scenario.impact}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Impact (I)</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Scenario Description</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {scenario.scenarioDescription || 'No description available for this scenario.'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Risk Calculation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              T x V x I = {scenario.threatLikelihood} x {scenario.vulnerability} x {scenario.impact} = <strong>{scenario.inherentRisk}</strong>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
