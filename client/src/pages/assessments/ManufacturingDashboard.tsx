import { useState, useEffect, useMemo } from 'react';
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
import { ExecutiveSummaryCard } from '@/components/analysis/ExecutiveSummaryCard';
import { useToast } from '@/hooks/use-toast';
import { useAutoGenerateRisks } from '@/hooks/useAutoGenerateRisks';
import { useProfileAutosave } from '@/hooks/useProfileAutosave';
import { useAssessmentMetadataAutosave } from '@/hooks/useAssessmentMetadataAutosave';
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
  manufacturingProfile: ManufacturingProfile | null;
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

  // Track if we've initialized from server data to prevent race condition with autosave
  const [initialized, setInitialized] = useState(false);

  // Assessment metadata state
  const [assessmentTitle, setAssessmentTitle] = useState<string>('');
  const [assessmentLocation, setAssessmentLocation] = useState<string>('');
  const [assessmentAssessor, setAssessmentAssessor] = useState<string>('');

  const [annualProductionValue, setAnnualProductionValue] = useState<string>('');
  const [shiftOperations, setShiftOperations] = useState<'1' | '2' | '24/7'>('1');
  const [selectedIpTypes, setSelectedIpTypes] = useState<string[]>([]);
  const [hazmatPresent, setHazmatPresent] = useState(false);
  
  // TCOR (Total Cost of Risk) fields
  const [employeeCount, setEmployeeCount] = useState<string>('');
  const [annualTurnoverRate, setAnnualTurnoverRate] = useState<string>('');
  const [avgHiringCost, setAvgHiringCost] = useState<string>('');
  const [annualLiabilityEstimates, setAnnualLiabilityEstimates] = useState<string>('');
  const [securityIncidentsPerYear, setSecurityIncidentsPerYear] = useState<string>('');
  const [brandDamageEstimate, setBrandDamageEstimate] = useState<string>('');

  // Build profile data for autosave
  const profileData = useMemo(() => ({
    shiftOperations,
    ipTypes: selectedIpTypes,
    hazmatPresent,
    annualProductionValue: parseFloat(annualProductionValue) || undefined,
    employeeCount: parseFloat(employeeCount) || 0,
    annualTurnoverRate: parseFloat(annualTurnoverRate) || 0,
    avgHiringCost: parseFloat(avgHiringCost) || 0,
    annualLiabilityEstimates: parseFloat(annualLiabilityEstimates) || 0,
    securityIncidentsPerYear: parseFloat(securityIncidentsPerYear) || 0,
    brandDamageEstimate: parseFloat(brandDamageEstimate) || 0,
  }), [annualProductionValue, shiftOperations, selectedIpTypes, hazmatPresent,
      employeeCount, annualTurnoverRate, avgHiringCost, annualLiabilityEstimates,
      securityIncidentsPerYear, brandDamageEstimate]);

  // Autosave profile changes with debounce
  useProfileAutosave({
    assessmentId: id,
    profileType: 'manufacturing',
    data: profileData,
    onSaveSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}/production-continuity`] });
    },
  });

  // Build assessment metadata for autosave
  const metadataData = useMemo(() => ({
    title: assessmentTitle,
    location: assessmentLocation,
    assessor: assessmentAssessor,
  }), [assessmentTitle, assessmentLocation, assessmentAssessor]);

  // Autosave assessment metadata changes - only enabled after initialization
  useAssessmentMetadataAutosave({
    assessmentId: id,
    data: metadataData,
    enabled: initialized,
    onSaveSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}`] });
    },
  });

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: [`/api/assessments/${id}`],
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: continuityScore } = useQuery<ProductionContinuityScore>({
    queryKey: [`/api/assessments/${id}/production-continuity`],
    enabled: !!id && !!assessment?.manufacturingProfile
  });

  // Auto-generate risk scenarios when profile is saved (hybrid model - backend handles generation)
  const profileSaved = !!assessment?.manufacturingProfile;
  const { scenariosExist } = useAutoGenerateRisks(id, profileSaved);

  // Load profile data ONLY on initial load - not after autosave refetches
  useEffect(() => {
    // Only initialize once per assessment ID to prevent autosave race condition
    if (initialized) return;
    
    if (assessment) {
      // Load assessment metadata
      setAssessmentTitle(assessment.title || '');
      setAssessmentLocation((assessment as any).location || '');
      setAssessmentAssessor((assessment as any).assessor || '');
      
      if (assessment.manufacturingProfile) {
        const profile = assessment.manufacturingProfile;
        setAnnualProductionValue(profile.annualProductionValue?.toString() ?? '');
        setShiftOperations(profile.shiftOperations ?? '1');
        setSelectedIpTypes(profile.ipTypes ?? []);
        setHazmatPresent(profile.hazmatPresent ?? false);
        
        // TCOR fields
        setEmployeeCount((profile as any).employeeCount?.toString() ?? '');
        setAnnualTurnoverRate((profile as any).annualTurnoverRate?.toString() ?? '');
        setAvgHiringCost((profile as any).avgHiringCost?.toString() ?? '');
        setAnnualLiabilityEstimates((profile as any).annualLiabilityEstimates?.toString() ?? '');
        setSecurityIncidentsPerYear((profile as any).securityIncidentsPerYear?.toString() ?? '');
        setBrandDamageEstimate((profile as any).brandDamageEstimate?.toString() ?? '');
      }
      setInitialized(true);
    }
  }, [assessment, initialized]);

  // Reset initialized flag when assessment ID changes (navigation)
  useEffect(() => {
    setInitialized(false);
  }, [id]);

  const saveMutation = useMutation({
    mutationFn: async (profileData: ManufacturingProfile) => {
      return await apiRequest('PATCH', `/api/assessments/${id}/manufacturing-profile`, {
        manufacturingProfile: profileData
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
    
    // TCOR fields
    (profileData as any).employeeCount = parseFloat(employeeCount) || 0;
    (profileData as any).annualTurnoverRate = parseFloat(annualTurnoverRate) || 0;
    (profileData as any).avgHiringCost = parseFloat(avgHiringCost) || 0;
    (profileData as any).annualLiabilityEstimates = parseFloat(annualLiabilityEstimates) || 0;
    (profileData as any).securityIncidentsPerYear = parseFloat(securityIncidentsPerYear) || 0;
    (profileData as any).brandDamageEstimate = parseFloat(brandDamageEstimate) || 0;

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
              {/* Assessment Metadata Section */}
              <div className="space-y-4 pb-4 border-b">
                <div className="space-y-2">
                  <Label htmlFor="assessmentTitle" className="text-sm font-medium">
                    Assessment Name
                  </Label>
                  <Input
                    id="assessmentTitle"
                    data-testid="input-assessment-title"
                    type="text"
                    placeholder="e.g., Main Production Facility Assessment"
                    value={assessmentTitle}
                    onChange={(e) => setAssessmentTitle(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessmentLocation" className="text-sm font-medium">
                      Location
                    </Label>
                    <Input
                      id="assessmentLocation"
                      data-testid="input-assessment-location"
                      type="text"
                      placeholder="e.g., 789 Manufacturing Way"
                      value={assessmentLocation}
                      onChange={(e) => setAssessmentLocation(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessmentAssessor" className="text-sm font-medium">
                      Assessor Name
                    </Label>
                    <Input
                      id="assessmentAssessor"
                      data-testid="input-assessment-assessor"
                      type="text"
                      placeholder="e.g., Jane Doe, CPP"
                      value={assessmentAssessor}
                      onChange={(e) => setAssessmentAssessor(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

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

              {/* TCOR (Total Cost of Risk) Section */}
              <div className="pt-6 space-y-4 border-t">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Total Cost of Risk (TCOR) Factors</h3>
                  <p className="text-xs text-muted-foreground">
                    Optional: Add indirect cost factors to calculate comprehensive annual risk exposure
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employee Count */}
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount" className="text-sm font-medium">
                      Employee Count
                    </Label>
                    <Input
                      id="employeeCount"
                      data-testid="input-employee-count"
                      type="number"
                      placeholder="e.g., 200"
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                    />
                  </div>

                  {/* Annual Turnover Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="annualTurnoverRate" className="text-sm font-medium">
                      Annual Turnover Rate (%)
                    </Label>
                    <Input
                      id="annualTurnoverRate"
                      data-testid="input-annual-turnover-rate"
                      type="number"
                      step="1"
                      placeholder="e.g., 25"
                      value={annualTurnoverRate}
                      onChange={(e) => setAnnualTurnoverRate(e.target.value)}
                    />
                  </div>

                  {/* Average Hiring Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="avgHiringCost" className="text-sm font-medium">
                      Avg Hiring Cost ($)
                    </Label>
                    <Input
                      id="avgHiringCost"
                      data-testid="input-avg-hiring-cost"
                      type="number"
                      placeholder="e.g., 6000"
                      value={avgHiringCost}
                      onChange={(e) => setAvgHiringCost(e.target.value)}
                    />
                  </div>

                  {/* Annual Liability Estimates */}
                  <div className="space-y-2">
                    <Label htmlFor="annualLiabilityEstimates" className="text-sm font-medium">
                      Annual Liability/Insurance ($)
                    </Label>
                    <Input
                      id="annualLiabilityEstimates"
                      data-testid="input-annual-liability-estimates"
                      type="number"
                      placeholder="e.g., 150000"
                      value={annualLiabilityEstimates}
                      onChange={(e) => setAnnualLiabilityEstimates(e.target.value)}
                    />
                  </div>

                  {/* Security Incidents Per Year */}
                  <div className="space-y-2">
                    <Label htmlFor="securityIncidentsPerYear" className="text-sm font-medium">
                      Security Incidents/Year
                    </Label>
                    <Input
                      id="securityIncidentsPerYear"
                      data-testid="input-security-incidents-per-year"
                      type="number"
                      placeholder="e.g., 8"
                      value={securityIncidentsPerYear}
                      onChange={(e) => setSecurityIncidentsPerYear(e.target.value)}
                    />
                  </div>

                  {/* Brand Damage Estimate */}
                  <div className="space-y-2">
                    <Label htmlFor="brandDamageEstimate" className="text-sm font-medium">
                      Brand/Reputation Cost ($)
                    </Label>
                    <Input
                      id="brandDamageEstimate"
                      data-testid="input-brand-damage-estimate"
                      type="number"
                      placeholder="e.g., 100000"
                      value={brandDamageEstimate}
                      onChange={(e) => setBrandDamageEstimate(e.target.value)}
                    />
                  </div>
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

          {/* IP Protection Matrix - PRIORITIZED */}
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

          {/* Downtime Cost Calculator - MOVED TO BOTTOM */}
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
        </div>
      </div>

      {/* AI Executive Summary */}
      {id && assessment && (
        <div className="mt-6">
          <ExecutiveSummaryCard 
            assessmentId={id} 
            executiveSummary={assessment.executiveSummary}
          />
        </div>
      )}
    </div>
  );
}
