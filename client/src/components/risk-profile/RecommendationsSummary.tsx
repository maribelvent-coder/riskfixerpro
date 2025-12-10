import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface Recommendation {
  priority: number;
  title: string;
  urgency: 'immediate' | 'short_term' | 'medium_term' | 'standard';
  rationale?: string;
}

interface RecommendationsSummaryProps {
  recommendations: Recommendation[];
  onViewAll: () => void;
  maxVisible?: number;
}

const URGENCY_CONFIG = {
  immediate: { label: 'Immediate', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  short_term: { label: 'Short Term', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  medium_term: { label: 'Medium Term', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  standard: { label: 'Standard', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
};

export function RecommendationsSummary({
  recommendations,
  onViewAll,
  maxVisible = 6,
}: RecommendationsSummaryProps) {
  const sortedRecs = [...recommendations].sort((a, b) => a.priority - b.priority);
  const visibleRecs = sortedRecs.slice(0, maxVisible);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg">Top Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleRecs.map((rec) => {
            const urgencyConfig = URGENCY_CONFIG[rec.urgency];
            
            return (
              <div
                key={rec.priority}
                data-testid={`recommendation-${rec.priority}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-sm">
                  {rec.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {rec.title}
                    </span>
                    <Badge className={urgencyConfig.color} variant="secondary">
                      {urgencyConfig.label}
                    </Badge>
                  </div>
                  {rec.rationale && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {rec.rationale}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onViewAll}
          data-testid="button-view-recommendations"
        >
          View Full Recommendations
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
