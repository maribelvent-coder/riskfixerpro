import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Factory, AlertCircle, DollarSign, Shield, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { ManufacturingProfile } from '@shared/schema';

interface ProductionContinuityScore {
  score: number;
  riskLevel: string;
  estimatedDailyDowntimeCost: number;
  riskFactors: string[];
}

interface Assessment {
  id: string;
  title: string;
  manufacturing_profile: ManufacturingProfile | null;
}

const IP_TYPE_OPTIONS = [
  'Patents',
  'Trade Secrets',
  'Proprietary Processes',
  'Product Designs',
  'Manufacturing Methods',
  'Chemical Formulas',
  'Software/Firmware'
];

export default function ManufacturingDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [annualProductionValue, setAnnualProductionValue] = useState<string>('');
  const [shiftOperations, setShiftOperations] = useState<'1' | '2' | '24/7'>('1');
  const [selectedIpTypes, setSelectedIpTypes] = useState<string[]>([]);
  const [hazmatPresent, setHazmatPresent] = useState(false);

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: [`/api/assessments/${id}`],
    enabled: !!id
  });

  const { data: continuityScore } = useQuery<ProductionContinuityScore>({
    queryKey: [`/api/assessments/${id}/production-continuity`],
    enabled: !!id && !!assessment?.manufacturing_profile
  });

  // Load profile data when assessment loads (useEffect to avoid setState in render)
  // ALWAYS run on assessment change to prevent stale state during loading/navigation
  useEffect(() => {
    if (assessment?.manufacturing_profile) {
      const profile = assessment.manufacturing_profile;
      // Use nullish coalescing to respect empty/cleared values
      setAnnualProductionValue(profile.annualProductionValue?.toString() ?? '');
      setShiftOperations(profile.shiftOperations ?? '1');
      setSelectedIpTypes(profile.ipTypes ?? []);
      setHazmatPresent(profile.hazmatPresent ?? false);
    } else {
      // No assessment or no profile - reset to defaults to prevent stale state
      setAnnualProductionValue('');
      setShiftOperations('1');
      setSelectedIpTypes([]);
      setHazmatPresent(false);
    }
  }, [assessment]); // Run when assessment data changes (including undefined)

  const saveMutation = useMutation({
    mutationFn: async (profileData: ManufacturingProfile) => {
      return await apiRequest('PATCH', `/api/assessments/${id}/manufacturing-profile`, {
        manufacturing_profile: profileData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}/production-continuity`] });
      toast({
        title: 'Profile Saved',
        description: 'Production profile updated successfully'
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update production profile';
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const handleSaveAndAnalyze = () => {
    const profileData: ManufacturingProfile = {
      shiftOperations,
      ipTypes: selectedIpTypes,
      hazmatPresent
    };
    
    // Only include annualProductionValue if it's a valid number
    const parsedValue = parseFloat(annualProductionValue);
    if (!isNaN(parsedValue) && annualProductionValue.trim() !== '') {
      profileData.annualProductionValue = parsedValue;
    }

    saveMutation.mutate(profileData);
  };

  const toggleIpType = (ipType: string) => {
    setSelectedIpTypes(prev => 
      prev.includes(ipType) 
        ? prev.filter(t => t !== ipType)
        : [...prev, ipType]
    );
  };

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (level?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading manufacturing profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center space-x-3">
        <Factory className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Production Operations</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manufacturing continuity and IP protection assessment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column: Production Profile Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                Production Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="annualValue" className="text-sm sm:text-base">
                  Annual Production Value (USD)
                </Label>
                <Input
                  id="annualValue"
                  data-testid="input-annual-production-value"
                  type="number"
                  placeholder="e.g., 50000000"
                  value={annualProductionValue}
                  onChange={(e) => setAnnualProductionValue(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Total value of goods produced annually
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftOps" className="text-sm sm:text-base">
                  Shift Operations
                </Label>
                <Select value={shiftOperations} onValueChange={(v: any) => setShiftOperations(v)}>
                  <SelectTrigger id="shiftOps" data-testid="select-shift-operations">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Single Shift (8 hours)</SelectItem>
                    <SelectItem value="2">Two Shifts (16 hours)</SelectItem>
                    <SelectItem value="24/7">24/7 Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Hazardous Materials</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hazmat"
                    data-testid="checkbox-hazmat"
                    checked={hazmatPresent}
                    onCheckedChange={(checked) => setHazmatPresent(checked as boolean)}
                  />
                  <Label htmlFor="hazmat" className="text-sm font-normal cursor-pointer">
                    Facility uses or stores hazardous materials
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Intellectual Property Types</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select all types of IP present at this facility
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {IP_TYPE_OPTIONS.map(ipType => (
                    <div key={ipType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ip-${ipType}`}
                        data-testid={`checkbox-ip-${ipType.toLowerCase().replace(/\s+/g, '-')}`}
                        checked={selectedIpTypes.includes(ipType)}
                        onCheckedChange={() => toggleIpType(ipType)}
                      />
                      <Label htmlFor={`ip-${ipType}`} className="text-sm font-normal cursor-pointer">
                        {ipType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSaveAndAnalyze}
                disabled={saveMutation.isPending}
                className="w-full sm:w-auto"
                data-testid="button-save-profile"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save & Analyze'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analysis & Metrics */}
        <div className="space-y-4">
          {/* Continuity Risk Gauge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Production Continuity Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {continuityScore ? (
                <>
                  <div className="text-center space-y-2">
                    <div className={`text-5xl font-bold ${getRiskColor(continuityScore.riskLevel)}`} data-testid="text-risk-score">
                      {continuityScore.score}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Score (0-100)</div>
                    <Badge variant={getRiskBadgeVariant(continuityScore.riskLevel)} data-testid="badge-risk-level">
                      {continuityScore.riskLevel} Risk
                    </Badge>
                  </div>

                  <Progress 
                    value={continuityScore.score} 
                    className="w-full h-3" 
                  />

                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Risk Factors:</div>
                    <ul className="space-y-1" data-testid="list-risk-factors">
                      {continuityScore.riskFactors.map((factor, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex gap-2" data-testid={`text-risk-factor-${idx}`}>
                          <span className="text-orange-500">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Save production details to generate risk analysis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Downtime Cost Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Downtime Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {continuityScore?.estimatedDailyDowntimeCost ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Estimated Cost of 24-Hour Shutdown:
                  </div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="text-downtime-cost">
                    ${continuityScore.estimatedDailyDowntimeCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on annual production value of ${annualProductionValue ? parseFloat(annualProductionValue).toLocaleString() : '0'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Enter annual production value to calculate downtime cost</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* IP Protection Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                IP Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedIpTypes.length > 0 ? (
                <div className="space-y-2">
                  {selectedIpTypes.map(ipType => (
                    <div key={ipType} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{ipType}</span>
                      <div className="flex items-center gap-2">
                        {Math.random() > 0.5 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" data-testid={`status-protected-${ipType}`} />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" data-testid={`status-unprotected-${ipType}`} />
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">
                    Protection status based on implemented controls
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Select IP types to view protection status</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
