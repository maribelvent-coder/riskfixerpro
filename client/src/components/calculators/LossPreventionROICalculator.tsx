import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

export interface ProposedControl {
  name: string;
  estimatedCost: number;
  reductionPercentage: number; // e.g., 30 for 30%
}

export interface LossPreventionROICalculatorProps {
  assessmentData: {
    annualRevenue: number;
    shrinkageRate: number; // e.g., 2.5 for 2.5%
  };
  proposedControls: ProposedControl[];
}

export function LossPreventionROICalculator({ 
  assessmentData, 
  proposedControls 
}: LossPreventionROICalculatorProps) {
  // ============================================================
  // CALCULATION LOGIC
  // ============================================================
  
  // 1. Current Annual Loss from Shrinkage
  const annualShrinkageLoss = assessmentData.annualRevenue * (assessmentData.shrinkageRate / 100);
  
  // 2. Total Cost of Proposed Controls
  const totalControlCost = proposedControls.reduce(
    (sum, control) => sum + control.estimatedCost, 
    0
  );
  
  // 3. Total Reduction Percentage (capped at 85%)
  const totalReduction = Math.min(
    0.85,
    proposedControls.reduce((sum, control) => sum + (control.reductionPercentage / 100), 0)
  );
  
  // 4. Projected Annual Savings
  const projectedSavings = annualShrinkageLoss * totalReduction;
  
  // 5. Payback Period (in years)
  const paybackPeriod = totalControlCost > 0 ? totalControlCost / projectedSavings : 0;
  
  // 6. Three-Year ROI Percentage
  const threeYearROI = totalControlCost > 0
    ? (((projectedSavings * 3) - totalControlCost) / totalControlCost) * 100
    : 0;
  
  // Industry Benchmarks
  const industryAverage = 1.5; // 1.5%
  const bestInClass = 0.8; // 0.8%
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Determine status based on shrinkage rate
  const getShrinkageStatus = (rate: number) => {
    if (rate <= bestInClass) return { text: 'Excellent', color: 'bg-green-500' };
    if (rate <= industryAverage) return { text: 'Average', color: 'bg-yellow-500' };
    return { text: 'High Risk', color: 'bg-red-500' };
  };
  
  const shrinkageStatus = getShrinkageStatus(assessmentData.shrinkageRate);

  return (
    <Card className="w-full" data-testid="card-lp-roi">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Loss Prevention ROI Calculator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Annual Loss Exposure */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Current Annual Shrinkage Loss
              </span>
            </div>
            <Badge variant="destructive" className="gap-1" data-testid="badge-current-shrinkage">
              <TrendingDown className="h-3 w-3" />
              {formatPercentage(assessmentData.shrinkageRate)}
            </Badge>
          </div>
          <div className="text-4xl font-bold text-red-600" data-testid="text-annual-loss">
            {formatCurrency(annualShrinkageLoss)}
          </div>
          <div className="text-xs text-muted-foreground">
            Based on ${formatCurrency(assessmentData.annualRevenue)} annual revenue
          </div>
        </div>

        {/* Proposed Investment */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Proposed LP Investment</span>
            <span className="text-lg font-semibold" data-testid="text-control-cost">{formatCurrency(totalControlCost)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {proposedControls.length} control{proposedControls.length !== 1 ? 's' : ''} • {formatPercentage(totalReduction * 100)} total reduction
          </div>
        </div>

        {/* Projected Annual Savings */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Projected Annual Savings
            </span>
          </div>
          <div className="text-4xl font-bold text-green-600" data-testid="text-annual-savings">
            {formatCurrency(projectedSavings)}
          </div>
          <div className="text-xs text-muted-foreground">
            Reducing shrinkage loss by {formatPercentage(totalReduction * 100)}
          </div>
        </div>

        {/* ROI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Payback Period */}
          <Card className="border-2">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Payback Period
                </span>
              </div>
              <div className="text-3xl font-bold" data-testid="text-payback-period">
                {paybackPeriod.toFixed(1)}
                <span className="text-lg font-normal text-muted-foreground ml-1">years</span>
              </div>
              {paybackPeriod < 1 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  Excellent ROI
                </Badge>
              )}
              {paybackPeriod >= 1 && paybackPeriod < 2 && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                  Good ROI
                </Badge>
              )}
              {paybackPeriod >= 2 && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                  Long-term Investment
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* 3-Year ROI */}
          <Card className="border-2">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  3-Year ROI
                </span>
              </div>
              <div className="text-3xl font-bold" data-testid="text-3yr-roi">
                {threeYearROI > 0 ? '+' : ''}{threeYearROI.toFixed(0)}
                <span className="text-lg font-normal text-muted-foreground ml-1">%</span>
              </div>
              {threeYearROI >= 200 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  Strong Return
                </Badge>
              )}
              {threeYearROI >= 100 && threeYearROI < 200 && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                  Positive Return
                </Badge>
              )}
              {threeYearROI < 100 && (
                <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500/20">
                  Moderate Return
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Industry Comparison */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Shrinkage Rate Comparison</span>
          </div>
          
          <div className="space-y-4">
            {/* Your Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Your Current Rate</span>
                <div className="flex items-center gap-2">
                  <Badge className={shrinkageStatus.color}>
                    {shrinkageStatus.text}
                  </Badge>
                  <span className="font-semibold">{formatPercentage(assessmentData.shrinkageRate)}</span>
                </div>
              </div>
              <Progress 
                value={Math.min(100, (assessmentData.shrinkageRate / 5) * 100)} 
                className="h-2"
              />
            </div>

            {/* Industry Average */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Industry Average</span>
                <span className="font-medium">{formatPercentage(industryAverage)}</span>
              </div>
              <Progress 
                value={(industryAverage / 5) * 100} 
                className="h-1.5 opacity-50"
              />
            </div>

            {/* Best-in-Class */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Best-in-Class</span>
                <span className="font-medium">{formatPercentage(bestInClass)}</span>
              </div>
              <Progress 
                value={(bestInClass / 5) * 100} 
                className="h-1.5 opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Proposed Controls Breakdown */}
        {proposedControls.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <span className="text-sm font-semibold">Proposed Loss Prevention Controls</span>
            <div className="space-y-2">
              {proposedControls.map((control, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  data-testid={`control-item-${index}`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{control.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Reduces shrinkage by {formatPercentage(control.reductionPercentage)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(control.estimatedCost)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Net Benefit Summary */}
        <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-green-900 dark:text-green-100">
                3-Year Net Benefit
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300" data-testid="text-net-benefit">
                {formatCurrency((projectedSavings * 3) - totalControlCost)}
              </div>
              <div className="text-xs text-green-700/70 dark:text-green-300/70">
                Total savings minus investment over 3 years
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
