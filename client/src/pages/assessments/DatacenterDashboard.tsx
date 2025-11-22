import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAutoGenerateRisks } from '@/hooks/useAutoGenerateRisks';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Assessment, DatacenterProfile } from '@shared/schema';
import { Server, Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

// Compliance standards available
const COMPLIANCE_STANDARDS = ['SOC 2', 'ISO 27001', 'PCI-DSS', 'HIPAA', 'FedRAMP'];

interface UptimeReliabilityScore {
  riskScore: number;
  slaRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  complianceScore: number;
  complianceGaps: string[];
  riskFactors: string[];
}

export default function DatacenterDashboard() {
  const { id } = useParams();
  const { toast } = useToast();

  // Local state for form
  const [tierClassification, setTierClassification] = useState<string>('');
  const [uptimeSLA, setUptimeSLA] = useState<string>('');
  const [complianceRequirements, setComplianceRequirements] = useState<string[]>([]);
  const [powerCapacity, setPowerCapacity] = useState<string>('');
  
  // TCOR (Total Cost of Risk) fields
  const [employeeCount, setEmployeeCount] = useState<string>('');
  const [annualTurnoverRate, setAnnualTurnoverRate] = useState<string>('');
  const [avgHiringCost, setAvgHiringCost] = useState<string>('');
  const [annualLiabilityEstimates, setAnnualLiabilityEstimates] = useState<string>('');
  const [securityIncidentsPerYear, setSecurityIncidentsPerYear] = useState<string>('');
  const [brandDamageEstimate, setBrandDamageEstimate] = useState<string>('');

  // Fetch assessment data
  const { data: assessment, isLoading: assessmentLoading } = useQuery<Assessment>({
    queryKey: [`/api/assessments/${id}`],
    enabled: !!id
  });

  // Fetch uptime reliability score
  const { data: reliabilityScore, isLoading: scoreLoading } = useQuery<UptimeReliabilityScore>({
    queryKey: [`/api/assessments/${id}/uptime-reliability`],
    enabled: !!id && !!assessment?.datacenter_profile
  });

  // Auto-generate risk scenarios when profile is saved (hybrid model - backend handles generation)
  const profileSaved = !!assessment?.datacenter_profile;
  const { scenariosExist } = useAutoGenerateRisks(id, profileSaved);

  // Load profile data when assessment loads (useEffect to avoid setState in render)
  // ALWAYS run on assessment change to prevent stale state during loading/navigation
  useEffect(() => {
    if (assessment?.datacenter_profile) {
      const profile = assessment.datacenter_profile as DatacenterProfile;
      // Use nullish coalescing to respect empty/cleared values
      setTierClassification(profile.tierClassification ?? '');
      setUptimeSLA(profile.uptimeSLA ?? '');
      setComplianceRequirements(profile.complianceRequirements ?? []);
      setPowerCapacity(profile.powerCapacity?.toString() ?? '');
      
      // TCOR fields
      setEmployeeCount(profile.employeeCount?.toString() ?? '');
      setAnnualTurnoverRate(profile.annualTurnoverRate?.toString() ?? '');
      setAvgHiringCost(profile.avgHiringCost?.toString() ?? '');
      setAnnualLiabilityEstimates(profile.annualLiabilityEstimates?.toString() ?? '');
      setSecurityIncidentsPerYear(profile.securityIncidentsPerYear?.toString() ?? '');
      setBrandDamageEstimate(profile.brandDamageEstimate?.toString() ?? '');
    } else {
      // No assessment or no profile - reset to defaults to prevent stale state
      setTierClassification('');
      setUptimeSLA('');
      setComplianceRequirements([]);
      setPowerCapacity('');
      
      // TCOR fields
      setEmployeeCount('');
      setAnnualTurnoverRate('');
      setAvgHiringCost('');
      setAnnualLiabilityEstimates('');
      setSecurityIncidentsPerYear('');
      setBrandDamageEstimate('');
    }
  }, [assessment]); // Run when assessment data changes (including undefined)

  const saveMutation = useMutation({
    mutationFn: async (profileData: DatacenterProfile) => {
      return await apiRequest('PATCH', `/api/assessments/${id}/datacenter-profile`, {
        datacenter_profile: profileData
      });
    },
    onSuccess: (response: any) => {
      // Immediately update local state from response to ensure null clears propagate instantly
      if (response?.datacenter_profile) {
        const profile = response.datacenter_profile as DatacenterProfile;
        setTierClassification(profile.tierClassification ?? '');
        setUptimeSLA(profile.uptimeSLA ?? '');
        setComplianceRequirements(profile.complianceRequirements ?? []);
        setPowerCapacity(profile.powerCapacity?.toString() ?? '');
        
        // TCOR fields
        setEmployeeCount(profile.employeeCount?.toString() ?? '');
        setAnnualTurnoverRate(profile.annualTurnoverRate?.toString() ?? '');
        setAvgHiringCost(profile.avgHiringCost?.toString() ?? '');
        setAnnualLiabilityEstimates(profile.annualLiabilityEstimates?.toString() ?? '');
        setSecurityIncidentsPerYear(profile.securityIncidentsPerYear?.toString() ?? '');
        setBrandDamageEstimate(profile.brandDamageEstimate?.toString() ?? '');
      }
      
      // Then invalidate queries for background refetch
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}/uptime-reliability`] });
      toast({
        title: 'Profile Saved',
        description: 'Infrastructure profile updated successfully'
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update infrastructure profile';
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const handleSaveAndAnalyze = () => {
    const profileData: DatacenterProfile = {
      tierClassification: tierClassification as any || undefined,
      uptimeSLA: uptimeSLA || undefined,
      complianceRequirements: complianceRequirements.length > 0 ? complianceRequirements : undefined
    };
    
    // Handle powerCapacity: send parsed number or explicitly null when cleared
    const parsedCapacity = parseFloat(powerCapacity);
    if (!isNaN(parsedCapacity) && powerCapacity.trim() !== '') {
      profileData.powerCapacity = parsedCapacity;
    } else {
      // Explicitly send null (not undefined) to clear stale values - JSON serialization preserves null
      (profileData as any).powerCapacity = null;
    }
    
    // TCOR fields
    profileData.employeeCount = parseFloat(employeeCount) || 0;
    profileData.annualTurnoverRate = parseFloat(annualTurnoverRate) || 0;
    profileData.avgHiringCost = parseFloat(avgHiringCost) || 0;
    profileData.annualLiabilityEstimates = parseFloat(annualLiabilityEstimates) || 0;
    profileData.securityIncidentsPerYear = parseFloat(securityIncidentsPerYear) || 0;
    profileData.brandDamageEstimate = parseFloat(brandDamageEstimate) || 0;

    saveMutation.mutate(profileData);
  };

  const toggleComplianceRequirement = (standard: string) => {
    setComplianceRequirements(prev => 
      prev.includes(standard) 
        ? prev.filter(s => s !== standard)
        : [...prev, standard]
    );
  };

  const getRiskColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (assessmentLoading) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="loading-indicator">
        <div className="text-muted-foreground">Loading infrastructure data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-dashboard">
            <Server className="w-8 h-8" />
            Infrastructure Operations
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-subtitle">
            Tier classification, SLA compliance, and infrastructure reliability analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Facility Profile Form */}
        <Card data-testid="card-profile-form">
          <CardHeader>
            <CardTitle data-testid="heading-facility-profile">Facility Profile</CardTitle>
            <CardDescription data-testid="text-profile-description">
              Define infrastructure tier, SLA targets, and compliance requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tier Classification */}
            <div className="space-y-2">
              <Label htmlFor="tier" data-testid="label-tier">Tier Classification</Label>
              <Select value={tierClassification} onValueChange={setTierClassification}>
                <SelectTrigger id="tier" data-testid="select-tier">
                  <SelectValue placeholder="Select tier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tier 1" data-testid="option-tier-1">Tier 1 (99.671% - Basic)</SelectItem>
                  <SelectItem value="Tier 2" data-testid="option-tier-2">Tier 2 (99.741% - Redundant)</SelectItem>
                  <SelectItem value="Tier 3" data-testid="option-tier-3">Tier 3 (99.982% - Concurrent Maintainable)</SelectItem>
                  <SelectItem value="Tier 4" data-testid="option-tier-4">Tier 4 (99.995% - Fault Tolerant)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Uptime SLA */}
            <div className="space-y-2">
              <Label htmlFor="sla" data-testid="label-sla">Uptime SLA Target (%)</Label>
              <Input
                id="sla"
                type="text"
                value={uptimeSLA}
                onChange={(e) => setUptimeSLA(e.target.value)}
                placeholder="99.99"
                data-testid="input-sla"
              />
              <p className="text-xs text-muted-foreground" data-testid="text-sla-help">
                e.g., 99.9%, 99.99%, 99.995%
              </p>
            </div>

            {/* Power Capacity */}
            <div className="space-y-2">
              <Label htmlFor="power" data-testid="label-power">Power Capacity (kW)</Label>
              <Input
                id="power"
                type="number"
                value={powerCapacity}
                onChange={(e) => setPowerCapacity(e.target.value)}
                placeholder="500"
                data-testid="input-power"
              />
            </div>

            {/* Compliance Requirements */}
            <div className="space-y-2">
              <Label data-testid="label-compliance">Compliance Requirements</Label>
              <div className="flex flex-wrap gap-2">
                {COMPLIANCE_STANDARDS.map(standard => (
                  <Badge
                    key={standard}
                    variant={complianceRequirements.includes(standard) ? 'default' : 'outline'}
                    className="cursor-pointer hover-elevate active-elevate-2"
                    onClick={() => toggleComplianceRequirement(standard)}
                    data-testid={`badge-compliance-${standard.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {complianceRequirements.includes(standard) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {standard}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground" data-testid="text-compliance-help">
                Select all applicable compliance frameworks
              </p>
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
                    placeholder="e.g., 50"
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
                    placeholder="e.g., 15"
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
                    placeholder="e.g., 10000"
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
                    placeholder="e.g., 200000"
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
                    placeholder="e.g., 3"
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
                    placeholder="e.g., 250000"
                    value={brandDamageEstimate}
                    onChange={(e) => setBrandDamageEstimate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveAndAnalyze}
              disabled={saveMutation.isPending}
              className="w-full"
              data-testid="button-save-analyze"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save & Analyze'}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Risk Analysis */}
        <div className="space-y-6">
          {/* Uptime Risk Meter */}
          <Card data-testid="card-uptime-risk">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="heading-uptime-risk">
                <AlertTriangle className="w-5 h-5" />
                Uptime Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scoreLoading ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="loading-score">
                  Calculating risk...
                </div>
              ) : reliabilityScore ? (
                <div className="space-y-4">
                  {/* Risk Score Gauge */}
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getRiskColor(reliabilityScore.slaRiskLevel)}`} data-testid="text-risk-score">
                      {reliabilityScore.riskScore}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid="text-risk-out-of">
                      out of 100
                    </div>
                    <Badge
                      variant={reliabilityScore.slaRiskLevel === 'Low' ? 'default' : 'destructive'}
                      className="mt-2"
                      data-testid="badge-risk-level"
                    >
                      {reliabilityScore.slaRiskLevel} Risk
                    </Badge>
                  </div>

                  {/* Risk Factors */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold" data-testid="heading-risk-factors">Risk Factors:</h4>
                    <ul className="space-y-1" data-testid="list-risk-factors">
                      {reliabilityScore.riskFactors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2" data-testid={`risk-factor-${idx}`}>
                          <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-profile">
                  Save infrastructure profile to see risk analysis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Scorecard */}
          <Card data-testid="card-compliance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="heading-compliance">
                <Shield className="w-5 h-5" />
                Compliance Scorecard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scoreLoading ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="loading-compliance">
                  Calculating compliance...
                </div>
              ) : reliabilityScore ? (
                <div className="space-y-4">
                  {/* Compliance Score */}
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getComplianceColor(reliabilityScore.complianceScore)}`} data-testid="text-compliance-score">
                      {reliabilityScore.complianceScore}%
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid="text-compliance-ready">
                      Compliance Ready
                    </div>
                  </div>

                  {/* Compliance Gaps */}
                  {reliabilityScore.complianceGaps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2" data-testid="heading-gaps">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        Missing Controls:
                      </h4>
                      <ul className="space-y-1" data-testid="list-compliance-gaps">
                        {reliabilityScore.complianceGaps.slice(0, 10).map((gap, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground" data-testid={`compliance-gap-${idx}`}>
                            {gap}
                          </li>
                        ))}
                      </ul>
                      {reliabilityScore.complianceGaps.length > 10 && (
                        <p className="text-xs text-muted-foreground" data-testid="text-more-gaps">
                          +{reliabilityScore.complianceGaps.length - 10} more gaps
                        </p>
                      )}
                    </div>
                  )}

                  {reliabilityScore.complianceGaps.length === 0 && complianceRequirements.length > 0 && (
                    <div className="text-center py-4 text-green-600 dark:text-green-400 flex items-center justify-center gap-2" data-testid="text-no-gaps">
                      <CheckCircle2 className="w-5 h-5" />
                      All compliance controls in place
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-compliance">
                  Select compliance requirements to see gaps
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
