import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LossPreventionROICalculator } from "@/components/calculators/LossPreventionROICalculator";
import { ExecutiveSummaryCard } from "@/components/analysis/ExecutiveSummaryCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoGenerateRisks } from "@/hooks/useAutoGenerateRisks";
import { useProfileAutosave } from "@/hooks/useProfileAutosave";
import { useAssessmentMetadataAutosave } from "@/hooks/useAssessmentMetadataAutosave";
import type { MerchandiseDisplay } from "@shared/schema";
import { 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Save,
  Loader2,
  Shield,
  DollarSign,
  XCircle
} from "lucide-react";

interface RetailAnalysisResponse {
  assessment: {
    id: string;
    title: string;
    location?: string;
    assessor?: string;
    executiveSummary?: string;
    retailProfile?: {
      annualRevenue?: number;
      shrinkageRate?: number;
      highValueMerchandise?: string[];
      storeFormat?: string;
      merchandiseDisplay?: MerchandiseDisplay;
    };
  };
  riskAnalysis: {
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    breakdown: {
      threatLikelihood: number;
      vulnerability: number;
      impact: number;
      inherentRisk: number;
    };
    riskFactors?: string[];
  };
}

const HIGH_VALUE_MERCHANDISE_OPTIONS = [
  { id: 'electronics', label: 'Electronics' },
  { id: 'jewelry', label: 'Jewelry & Watches' },
  { id: 'cosmetics', label: 'Cosmetics & Fragrances' },
  { id: 'designer_apparel', label: 'Designer Apparel' },
  { id: 'handbags', label: 'Designer Handbags' },
  { id: 'alcohol', label: 'Premium Alcohol' },
];

const STORE_FORMAT_OPTIONS = [
  { value: 'Mall', label: 'Mall' },
  { value: 'Standalone', label: 'Standalone' },
  { value: 'Strip Center', label: 'Strip Center' },
  { value: 'Shopping Center', label: 'Shopping Center' },
];

const MERCHANDISE_DISPLAY_OPTIONS: { value: MerchandiseDisplay; label: string; description: string }[] = [
  { 
    value: 'Open Shelving', 
    label: 'Open Shelving',
    description: 'Customers pick items freely - EAS Critical'
  },
  { 
    value: 'Locked Cabinets / Tethered', 
    label: 'Locked Cabinets / Tethered',
    description: 'High-value items secured - EAS Moderate'
  },
  { 
    value: 'Behind Counter / Staff Access Only', 
    label: 'Behind Counter / Staff Access Only',
    description: 'No customer access - EAS Not Needed'
  },
  { 
    value: 'Service Only', 
    label: 'Service Only',
    description: 'No physical goods - EAS Not Needed'
  },
];

export default function RetailDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Fetch retail analysis data with fresh data on mount
  const { data, isLoading, error } = useQuery<RetailAnalysisResponse>({
    queryKey: ['/api/assessments', id, 'retail-analysis'],
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Auto-generate risk scenarios when profile is saved (hybrid model - backend handles generation)
  const profileSaved = !!data?.assessment.retailProfile;
  const { scenariosExist } = useAutoGenerateRisks(id, profileSaved);

  // Assessment metadata state
  const [assessmentTitle, setAssessmentTitle] = useState<string>('');
  const [assessmentLocation, setAssessmentLocation] = useState<string>('');
  const [assessmentAssessor, setAssessmentAssessor] = useState<string>('');

  // Form state for retail profile
  const [annualRevenue, setAnnualRevenue] = useState<string>('');
  const [shrinkageRate, setShrinkageRate] = useState<string>('');
  const [storeFormat, setStoreFormat] = useState<string>('');
  const [merchandiseDisplay, setMerchandiseDisplay] = useState<MerchandiseDisplay>('Open Shelving');
  const [selectedMerchandise, setSelectedMerchandise] = useState<string[]>([]);
  
  // TCOR (Total Cost of Risk) fields
  const [employeeCount, setEmployeeCount] = useState<string>('');
  const [annualTurnoverRate, setAnnualTurnoverRate] = useState<string>('');
  const [avgHiringCost, setAvgHiringCost] = useState<string>('');
  const [annualLiabilityEstimates, setAnnualLiabilityEstimates] = useState<string>('');
  const [securityIncidentsPerYear, setSecurityIncidentsPerYear] = useState<string>('');
  const [brandDamageEstimate, setBrandDamageEstimate] = useState<string>('');

  // Build profile data for autosave
  const profileData = useMemo(() => ({
    annualRevenue: parseFloat(annualRevenue) || 0,
    shrinkageRate: parseFloat(shrinkageRate) || 0,
    highValueMerchandise: selectedMerchandise,
    storeFormat: storeFormat || 'Standalone',
    merchandiseDisplay: merchandiseDisplay || 'Open Shelving',
    employeeCount: parseFloat(employeeCount) || 0,
    annualTurnoverRate: parseFloat(annualTurnoverRate) || 0,
    avgHiringCost: parseFloat(avgHiringCost) || 0,
    annualLiabilityEstimates: parseFloat(annualLiabilityEstimates) || 0,
    securityIncidentsPerYear: parseFloat(securityIncidentsPerYear) || 0,
    brandDamageEstimate: parseFloat(brandDamageEstimate) || 0,
  }), [annualRevenue, shrinkageRate, selectedMerchandise, storeFormat, merchandiseDisplay, 
      employeeCount, annualTurnoverRate, avgHiringCost, annualLiabilityEstimates, 
      securityIncidentsPerYear, brandDamageEstimate]);

  // Autosave profile changes with debounce
  useProfileAutosave({
    assessmentId: id,
    profileType: 'retail',
    data: profileData,
    onSaveSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'retail-analysis'] });
    },
  });

  // Build assessment metadata for autosave
  const metadataData = useMemo(() => ({
    title: assessmentTitle,
    location: assessmentLocation,
    assessor: assessmentAssessor,
  }), [assessmentTitle, assessmentLocation, assessmentAssessor]);

  // Autosave assessment metadata changes
  useAssessmentMetadataAutosave({
    assessmentId: id,
    data: metadataData,
    onSaveSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'retail-analysis'] });
    },
  });

  // Initialize form when data loads
  // Track if we've initialized from server data to prevent race condition with autosave
  const [initialized, setInitialized] = useState(false);

  // Load profile data ONLY on initial load - not after autosave refetches
  useEffect(() => {
    if (initialized) return;
    
    if (data?.assessment) {
      // Load assessment metadata
      setAssessmentTitle(data.assessment.title || '');
      setAssessmentLocation(data.assessment.location || '');
      setAssessmentAssessor(data.assessment.assessor || '');
      
      if (data.assessment.retailProfile) {
        const profile = data.assessment.retailProfile;
        setAnnualRevenue(profile.annualRevenue?.toString() || '');
        setShrinkageRate(profile.shrinkageRate?.toString() || '');
        setStoreFormat(profile.storeFormat || '');
        setMerchandiseDisplay(profile.merchandiseDisplay || 'Open Shelving');
        setSelectedMerchandise(profile.highValueMerchandise || []);
        
        // TCOR fields
        setEmployeeCount((profile as any).employeeCount?.toString() || '');
        setAnnualTurnoverRate((profile as any).annualTurnoverRate?.toString() || '');
        setAvgHiringCost((profile as any).avgHiringCost?.toString() || '');
        setAnnualLiabilityEstimates((profile as any).annualLiabilityEstimates?.toString() || '');
        setSecurityIncidentsPerYear((profile as any).securityIncidentsPerYear?.toString() || '');
        setBrandDamageEstimate((profile as any).brandDamageEstimate?.toString() || '');
      }
      setInitialized(true);
    }
  }, [data, initialized]);

  // Reset initialized flag when assessment ID changes (navigation)
  useEffect(() => {
    setInitialized(false);
  }, [id]);

  // Update retail profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('PATCH', `/api/assessments/${id}/retail-profile`, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'retail-analysis'] });
      toast({
        title: 'Profile Updated',
        description: 'Retail profile saved successfully. Risk analysis updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update retail profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleSaveAndAnalyze = () => {
    const profileData = {
      annualRevenue: parseFloat(annualRevenue) || 0,
      shrinkageRate: parseFloat(shrinkageRate) || 0,
      highValueMerchandise: selectedMerchandise,
      storeFormat: storeFormat || 'Standalone',
      merchandiseDisplay: merchandiseDisplay || 'Open Shelving',
      // TCOR fields
      employeeCount: parseFloat(employeeCount) || 0,
      annualTurnoverRate: parseFloat(annualTurnoverRate) || 0,
      avgHiringCost: parseFloat(avgHiringCost) || 0,
      annualLiabilityEstimates: parseFloat(annualLiabilityEstimates) || 0,
      securityIncidentsPerYear: parseFloat(securityIncidentsPerYear) || 0,
      brandDamageEstimate: parseFloat(brandDamageEstimate) || 0,
    };

    updateProfileMutation.mutate(profileData);
  };

  // Handle merchandise selection
  const toggleMerchandise = (merchandiseId: string) => {
    setSelectedMerchandise((prev) =>
      prev.includes(merchandiseId)
        ? prev.filter((id) => id !== merchandiseId)
        : [...prev, merchandiseId]
    );
  };

  // Get risk level badge color
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'default';
      case 'MEDIUM':
        return 'secondary';
      case 'HIGH':
        return 'destructive';
      case 'CRITICAL':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get risk meter color
  const getRiskMeterColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'CRITICAL':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading retail analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Failed to load retail analysis. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assessment = data?.assessment;
  const riskAnalysis = data?.riskAnalysis;

  // Prepare data for ROI Calculator
  const roiAssessmentData = {
    annualRevenue: parseFloat(annualRevenue) || assessment?.retailProfile?.annualRevenue || 0,
    shrinkageRate: parseFloat(shrinkageRate) || assessment?.retailProfile?.shrinkageRate || 0,
  };

  // Example proposed controls
  const proposedControls = [
    {
      name: 'Electronic Article Surveillance (EAS) System',
      estimatedCost: 25000,
      reductionPercentage: 30,
    },
    {
      name: 'POS & Merchandise Area CCTV (20 cameras)',
      estimatedCost: 35000,
      reductionPercentage: 25,
    },
    {
      name: 'Loss Prevention Staff (2 FTE)',
      estimatedCost: 120000,
      reductionPercentage: 40,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-2 sm:gap-3">
        <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{assessment?.title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Retail Loss Prevention Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* LEFT COLUMN: Store Profile Form */}
        <div className="space-y-6">
          <Card data-testid="card-store-profile">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Store Profile
              </CardTitle>
              <CardDescription>
                Enter your store's financial and operational details for shrinkage risk analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    placeholder="e.g., Downtown Store Security Assessment"
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
                      placeholder="e.g., 123 Main St, City, State"
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
                      placeholder="e.g., John Smith, CPP"
                      value={assessmentAssessor}
                      onChange={(e) => setAssessmentAssessor(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Annual Revenue */}
              <div className="space-y-2">
                <Label htmlFor="annualRevenue" className="text-sm font-medium">
                  Annual Revenue ($)
                </Label>
                <Input
                  id="annualRevenue"
                  data-testid="input-annual-revenue"
                  type="number"
                  placeholder="e.g., 5000000"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Total annual sales revenue for this store location
                </p>
              </div>

              {/* Shrinkage Rate */}
              <div className="space-y-2">
                <Label htmlFor="shrinkageRate" className="text-sm font-medium">
                  Shrinkage Rate (%)
                </Label>
                <Input
                  id="shrinkageRate"
                  data-testid="input-shrinkage-rate"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={shrinkageRate}
                  onChange={(e) => setShrinkageRate(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Industry baseline: 1.4-1.6% | Medium risk: &gt;1.5% | Critical: &gt;3%
                </p>
              </div>

              {/* Store Format */}
              <div className="space-y-2">
                <Label htmlFor="storeFormat" className="text-sm font-medium">
                  Store Format
                </Label>
                <Select value={storeFormat} onValueChange={setStoreFormat}>
                  <SelectTrigger id="storeFormat" data-testid="select-store-format">
                    <SelectValue placeholder="Select store format" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_FORMAT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Store location and configuration type
                </p>
              </div>

              {/* Merchandise Display Model */}
              <div className="space-y-2">
                <Label htmlFor="merchandiseDisplay" className="text-sm font-medium">
                  Merchandise Display Model
                </Label>
                <Select value={merchandiseDisplay} onValueChange={(value) => setMerchandiseDisplay(value as MerchandiseDisplay)}>
                  <SelectTrigger id="merchandiseDisplay" data-testid="select-merchandise-display">
                    <SelectValue placeholder="Select display model" />
                  </SelectTrigger>
                  <SelectContent>
                    {MERCHANDISE_DISPLAY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} data-testid={`option-${option.value.toLowerCase().replace(/\s+/g, '-')}`}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How merchandise is presented affects EAS system relevance
                </p>
              </div>

              {/* High-Value Merchandise */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  High-Value Merchandise Categories
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select all categories that apply (+2 risk points per category, max 10)
                </p>
                <div className="space-y-2">
                  {HIGH_VALUE_MERCHANDISE_OPTIONS.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        data-testid={`checkbox-${item.id}`}
                        checked={selectedMerchandise.includes(item.id)}
                        onCheckedChange={() => toggleMerchandise(item.id)}
                      />
                      <label
                        htmlFor={item.id}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* TCOR (Total Cost of Risk) Section */}
              <div className="pt-6 space-y-4 border-t">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold">Total Cost of Risk (TCOR) Factors</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional: Add indirect cost factors to calculate comprehensive annual risk exposure beyond shrinkage alone
                </p>
                
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
                      placeholder="e.g., 25"
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
                      placeholder="e.g., 50"
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
                      placeholder="e.g., 5000"
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
                      placeholder="e.g., 20000"
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
                      placeholder="e.g., 10000"
                      value={brandDamageEstimate}
                      onChange={(e) => setBrandDamageEstimate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                data-testid="button-save-analyze"
                onClick={handleSaveAndAnalyze}
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save & Analyze
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Control Gaps → Risk Score → ROI */}
        <div className="space-y-6">
          {/* Control Gaps - PRIORITIZED - Shows when vulnerability score is elevated (>3) */}
          {riskAnalysis && riskAnalysis.breakdown.vulnerability > 3 && (
            <Card className="border-2 border-orange-500/50" data-testid="card-control-gaps">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Loss Prevention Control Gaps
                </CardTitle>
                <CardDescription>Vulnerabilities detected in security posture (V={riskAnalysis.breakdown.vulnerability}/5)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Vulnerability Score</span>
                    <Badge variant="destructive" className="text-lg px-3">
                      {riskAnalysis.breakdown.vulnerability}/5
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-muted-foreground">Detected Gaps:</div>
                    <ul className="space-y-1 text-sm">
                      {riskAnalysis.riskFactors?.slice(0, 4).map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                      {(!riskAnalysis.riskFactors || riskAnalysis.riskFactors.length === 0) && (
                        <>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>Complete the survey to identify specific control gaps</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Implementing these controls is the most cost-effective strategy to reduce shrinkage and improve margins.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shrinkage Risk Meter */}
          <Card data-testid="card-risk-meter">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Shrinkage Risk Score
              </CardTitle>
              <CardDescription>
                Current shrinkage vulnerability assessment (0-100 scale)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskAnalysis ? (
                <div className="space-y-6">
                  {/* Score Display */}
                  <div className="text-center space-y-3">
                    <div className="text-6xl font-bold text-primary" data-testid="text-risk-score">
                      {riskAnalysis.score}
                    </div>
                    <Badge 
                      variant={getRiskBadgeVariant(riskAnalysis.riskLevel)}
                      className="text-lg px-4 py-1"
                      data-testid="badge-risk-level"
                    >
                      {riskAnalysis.riskLevel} RISK
                    </Badge>
                  </div>

                  {/* Risk Meter Bar */}
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getRiskMeterColor(riskAnalysis.riskLevel)} transition-all duration-500`}
                        style={{ width: `${riskAnalysis.score}%` }}
                        data-testid="meter-risk-score"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 (Low)</span>
                      <span>25 (Medium)</span>
                      <span>50 (High)</span>
                      <span>75+ (Critical)</span>
                    </div>
                  </div>

                  {/* T×V×I Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">T×V×I Risk Formula</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary" data-testid="text-threat-score">
                          {riskAnalysis.breakdown.threatLikelihood}
                        </div>
                        <div className="text-xs text-muted-foreground">Threat (T)</div>
                        <div className="text-xs text-muted-foreground">Likelihood</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary" data-testid="text-vulnerability-score">
                          {riskAnalysis.breakdown.vulnerability}
                        </div>
                        <div className="text-xs text-muted-foreground">Vulnerability (V)</div>
                        <div className="text-xs text-muted-foreground">Control Gaps</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary" data-testid="text-impact-score">
                          {riskAnalysis.breakdown.impact}
                        </div>
                        <div className="text-xs text-muted-foreground">Impact (I)</div>
                        <div className="text-xs text-muted-foreground">Severity</div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-muted-foreground">
                      Inherent Risk: {riskAnalysis.breakdown.threatLikelihood} × {riskAnalysis.breakdown.vulnerability} × {riskAnalysis.breakdown.impact} = {riskAnalysis.breakdown.inherentRisk}/125
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {riskAnalysis.riskFactors && riskAnalysis.riskFactors.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Contributing Risk Factors</h4>
                      <ul className="space-y-1 text-sm">
                        {riskAnalysis.riskFactors.slice(0, 6).map((factor: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{factor}</span>
                          </li>
                        ))}
                        {riskAnalysis.riskFactors.length > 6 && (
                          <li className="text-xs text-muted-foreground ml-6">
                            + {riskAnalysis.riskFactors.length - 6} more factors...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations based on risk level */}
                  {riskAnalysis.riskLevel === 'CRITICAL' ? (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-destructive mb-1">
                            Critical Risk - Immediate Action Required
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Your shrinkage risk score indicates severe vulnerabilities requiring immediate attention.
                            Review the Loss Prevention ROI calculator below to prioritize control investments.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : riskAnalysis.riskLevel === 'HIGH' ? (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-500 mb-1">
                            High Risk - Action Required
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Your shrinkage risk score indicates significant vulnerabilities. 
                            Review the Loss Prevention ROI calculator below to evaluate control investments.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : riskAnalysis.riskLevel === 'MEDIUM' ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 mb-1">
                            Elevated Risk - Review Controls
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Your shrinkage risk is above industry baseline. Consider reviewing control gaps 
                            and evaluating additional loss prevention measures.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-green-600 dark:text-green-500 mb-1">
                            Good Security Posture
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Your current shrinkage risk is within acceptable levels. Continue monitoring and maintaining existing controls.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Save your store profile to generate risk analysis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loss Prevention ROI Calculator */}
          <LossPreventionROICalculator
            assessmentData={roiAssessmentData}
            proposedControls={proposedControls}
          />
        </div>
      </div>

      {/* AI Executive Summary */}
      {id && (
        <div className="mt-6">
          <ExecutiveSummaryCard 
            assessmentId={id} 
            executiveSummary={data?.assessment.executiveSummary}
          />
        </div>
      )}
    </div>
  );
}
