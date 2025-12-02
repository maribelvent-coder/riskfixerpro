/**
 * Executive Protection Cost-Benefit Analysis Calculator
 * Compares protection costs against potential loss scenarios
 * Includes "Duty of Care" narrative for cases where ROI appears negative
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Shield, TrendingUp, Heart, AlertTriangle } from "lucide-react";

interface ExecutiveProfile {
  netWorthRange?: string;
  annualProtectionBudget?: number;
  insuranceDeductible?: number;
  dailyLossOfValue?: number;
}

interface TCORBreakdown {
  ransomExposure: number;
  incapacitationCost: number;
  directSecurityCost: number;
  totalPotentialLoss: number;
  totalAnnualExposure: number;
  costBenefitRatio: number;
}

interface CostBenefitCalculatorProps {
  profile: ExecutiveProfile | null;
  tcor?: TCORBreakdown | null; // Backend-calculated TCOR (preferred)
}

export function ExecutiveCostBenefitCalculator({ profile, tcor }: CostBenefitCalculatorProps) {
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost-Benefit Analysis
          </CardTitle>
          <CardDescription>
            Protection investment analysis unavailable until profile is saved
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Use backend TCOR if available, otherwise calculate locally
  const avgKidnapDuration = 30; // Average kidnapping duration in days
  let annualBudget: number;
  let krDeductible: number;
  let incapacitationCost: number;
  let totalPotentialLoss: number;

  if (tcor) {
    // Use validated backend calculations
    annualBudget = tcor.directSecurityCost;
    krDeductible = tcor.ransomExposure;
    incapacitationCost = tcor.incapacitationCost;
    totalPotentialLoss = tcor.totalPotentialLoss;
  } else {
    // Fallback to local calculation (when backend hasn't computed TCOR yet)
    annualBudget = profile.annualProtectionBudget || 0;
    krDeductible = profile.insuranceDeductible || 0;
    const dailyLoss = profile.dailyLossOfValue || 0;
    incapacitationCost = dailyLoss * avgKidnapDuration;
    totalPotentialLoss = krDeductible + incapacitationCost;
  }

  // Calculate ROI
  // Positive ROI = Potential Loss > Protection Budget (investment worth it)
  // Negative ROI = Protection Budget > Potential Loss (duty of care investment)
  const annualSavings = totalPotentialLoss - annualBudget;
  const roi = annualBudget > 0 ? (annualSavings / annualBudget) * 100 : 0;
  
  // Positive ROI when potential loss exceeds protection cost
  const isPositiveROI = totalPotentialLoss > annualBudget;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cost-Benefit Analysis
        </CardTitle>
        <CardDescription>
          Protection investment vs. potential loss exposure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Annual Protection Budget</span>
            <span className="font-semibold">{formatCurrency(annualBudget)}</span>
          </div>
        </div>

        {/* Potential Loss Section */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Potential Loss Scenario
          </h4>
          
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">K&R Insurance Deductible</span>
              <span>{formatCurrency(krDeductible)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Incapacitation Cost ({avgKidnapDuration} days)</span>
              <span>{formatCurrency(incapacitationCost)}</span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t font-semibold">
              <span>Total Potential Loss</span>
              <span className="text-destructive">{formatCurrency(totalPotentialLoss)}</span>
            </div>
          </div>
        </div>

        {/* ROI Analysis */}
        <div className="space-y-3 pt-3 border-t">
          {isPositiveROI ? (
            <>
              <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-semibold text-green-700 dark:text-green-400">
                    Positive Return: {roi.toFixed(0)}% ROI
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Protection budget justified by potential loss avoidance
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Annual protection investment of {formatCurrency(annualBudget)} is offset by 
                avoiding potential {formatCurrency(totalPotentialLoss)} in losses.
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                <Heart className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-700 dark:text-blue-400">
                    Duty of Care Investment
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    Protecting human capital beyond financial metrics
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  While traditional ROI appears negative, executive protection represents a 
                  <strong className="text-foreground"> duty of care obligation</strong> that 
                  transcends financial calculation.
                </p>
                
                <div className="pl-4 border-l-2 border-blue-500/30 space-y-1 mt-3">
                  <p className="text-xs font-medium text-foreground">Non-Financial Value:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Executive psychological security and performance</li>
                    <li>Family safety and peace of mind</li>
                    <li>Organizational reputation and stakeholder confidence</li>
                    <li>Legal/regulatory compliance obligations</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Summary Badge */}
        <div className="pt-3 border-t">
          <Badge variant={isPositiveROI ? "default" : "secondary"} className="w-full justify-center py-2">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            {isPositiveROI 
              ? `Financial ROI: ${annualSavings > 0 ? '+' : ''}${formatCurrency(annualSavings)}/year`
              : 'Duty of Care: Beyond Financial ROI'
            }
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
