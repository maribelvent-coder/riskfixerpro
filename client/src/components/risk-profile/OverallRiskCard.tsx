import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore: number;
  rating: string;
  color?: string;
}

function ScoreCard({ label, score, maxScore, rating, color }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{score}/{maxScore}</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">{rating}</div>
      <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface OverallRiskCardProps {
  threatScore: number;
  threatRating: string;
  vulnerabilityScore: number;
  vulnerabilityRating: string;
  impactScore: number;
  impactRating: string;
  overallScore: number;
  overallClassification: string;
  aiConfidence: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

const RISK_COLORS: Record<string, string> = {
  NEGLIGIBLE: '#22C55E',
  LOW: '#3B82F6',
  MODERATE: '#EAB308',
  ELEVATED: '#F97316',
  CRITICAL: '#EF4444',
};

const CONFIDENCE_LABELS = {
  high: { label: 'High Confidence', color: 'text-green-600' },
  medium: { label: 'Medium Confidence', color: 'text-yellow-600' },
  low: { label: 'Low Confidence', color: 'text-red-600' },
};

export function OverallRiskCard({
  threatScore,
  threatRating,
  vulnerabilityScore,
  vulnerabilityRating,
  impactScore,
  impactRating,
  overallScore,
  overallClassification,
  aiConfidence,
  lastUpdated,
}: OverallRiskCardProps) {
  const riskColor = RISK_COLORS[overallClassification] || '#6B7280';
  const confidenceInfo = CONFIDENCE_LABELS[aiConfidence];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Overall Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard
            label="THREAT"
            score={threatScore}
            maxScore={5}
            rating={threatRating}
            color="#6366F1"
          />
          <ScoreCard
            label="VULNERABILITY"
            score={vulnerabilityScore}
            maxScore={5}
            rating={vulnerabilityRating}
            color="#8B5CF6"
          />
          <ScoreCard
            label="IMPACT"
            score={impactScore}
            maxScore={5}
            rating={impactRating}
            color="#A855F7"
          />
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: riskColor + '20' }}>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">OVERALL RISK</div>
            <div className="text-3xl font-bold" style={{ color: riskColor }}>
              {overallScore}/125
            </div>
            <div
              className="text-lg font-bold mt-1 px-3 py-1 rounded inline-block"
              style={{ backgroundColor: riskColor, color: 'white' }}
            >
              {overallClassification}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
          <span className={confidenceInfo.color}>
            AI Assessment: {confidenceInfo.label}
          </span>
          <span>
            Last Updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
