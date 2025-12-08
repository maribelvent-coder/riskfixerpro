import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoGenerateRisks } from "@/hooks/useAutoGenerateRisks";
import { useAssessmentMetadataAutosave } from "@/hooks/useAssessmentMetadataAutosave";
import { useMemo } from "react";
import { ExecutiveCostBenefitCalculator } from "@/components/calculators/ExecutiveCostBenefitCalculator";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Save,
  Loader2,
  User,
  DollarSign,
  Eye,
  Car,
  Home,
  Users,
  Target,
  MapPin,
  ListChecks
} from "lucide-react";

interface ExecutiveProfileData {
  fullName: string;
  title?: string;
  companyRole?: string;
  publicProfile: string;
  netWorthRange?: string;
  mediaExposure?: string;
  currentSecurityLevel: string;
  hasPersonalProtection: boolean;
  hasPanicRoom: boolean;
  hasArmoredVehicle: boolean;
  // EP-Specific TCOR Fields
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

interface ExecutiveDashboardResponse {
  assessment: {
    id: string;
    title: string;
  };
  profile?: ExecutiveProfileData;
  analysis?: {
    exposureFactor: number;
    riskScore: number;
    riskLevel: string;
    activeScenarioCount: number;
  };
  tcor?: TCORBreakdown | null;
}

const PUBLIC_PROFILE_OPTIONS = [
  { value: 'private', label: 'Private (No Public Information)' },
  { value: 'low', label: 'Low (Minimal Public Presence)' },
  { value: 'medium', label: 'Medium (Industry Professional)' },
  { value: 'high', label: 'High (Public Figure)' },
  { value: 'very_high', label: 'Very High (Celebrity/Political)' },
];

const NET_WORTH_OPTIONS = [
  { value: 'under_1m', label: 'Under $1M' },
  { value: '1m_5m', label: '$1M - $5M' },
  { value: '5m_10m', label: '$5M - $10M' },
  { value: '10m_50m', label: '$10M - $50M' },
  { value: '50m_100m', label: '$50M - $100M' },
  { value: 'over_100m', label: 'Over $100M' },
];

const MEDIA_EXPOSURE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'minimal', label: 'Minimal (Rare Coverage)' },
  { value: 'moderate', label: 'Moderate (Regular Industry Features)' },
  { value: 'high', label: 'High (Frequent Media Appearances)' },
  { value: 'very_high', label: 'Very High (Constant Public Attention)' },
];

const SECURITY_LEVEL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'minimal', label: 'Minimal (Basic Awareness)' },
  { value: 'moderate', label: 'Moderate (Some Measures)' },
  { value: 'enhanced', label: 'Enhanced (Multiple Measures)' },
  { value: 'comprehensive', label: 'Comprehensive (24/7 Detail)' },
];

export default function ExecutiveDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Assessment metadata state
  const [assessmentTitle, setAssessmentTitle] = useState<string>('');
  const [assessmentLocation, setAssessmentLocation] = useState<string>('');
  const [assessmentAssessor, setAssessmentAssessor] = useState<string>('');
  const [metadataInitialized, setMetadataInitialized] = useState(false);

  // Fetch executive profile data
  const { data, isLoading } = useQuery<ExecutiveDashboardResponse>({
    queryKey: ['/api/assessments', id, 'executive-profile'],
  });

  // Auto-generate risk scenarios when profile is saved (hybrid model - backend handles generation)
  const profileSaved = !!data?.profile;
  const { scenariosExist } = useAutoGenerateRisks(id, profileSaved);

  // Form state for executive profile
  const [fullName, setFullName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [companyRole, setCompanyRole] = useState<string>('');
  const [publicProfile, setPublicProfile] = useState<string>('medium');
  const [netWorthRange, setNetWorthRange] = useState<string>('');
  const [mediaExposure, setMediaExposure] = useState<string>('');
  const [currentSecurityLevel, setCurrentSecurityLevel] = useState<string>('minimal');
  const [hasPersonalProtection, setHasPersonalProtection] = useState<boolean>(false);
  const [hasPanicRoom, setHasPanicRoom] = useState<boolean>(false);
  const [hasArmoredVehicle, setHasArmoredVehicle] = useState<boolean>(false);
  // EP-Specific TCOR Fields
  const [annualProtectionBudget, setAnnualProtectionBudget] = useState<string>('');
  const [insuranceDeductible, setInsuranceDeductible] = useState<string>('');
  const [dailyLossOfValue, setDailyLossOfValue] = useState<string>('');

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
    enabled: metadataInitialized,
    onSaveSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'executive-profile'] });
    },
  });

  // Reset metadata initialized flag when assessment ID changes
  useEffect(() => {
    setMetadataInitialized(false);
  }, [id]);

  // Initialize form when data loads
  useEffect(() => {
    if (data) {
      // Load assessment metadata (only once per assessment ID)
      if (!metadataInitialized && data.assessment) {
        setAssessmentTitle(data.assessment.title || '');
        setAssessmentLocation((data.assessment as any).location || '');
        setAssessmentAssessor((data.assessment as any).assessor || '');
        setMetadataInitialized(true);
      }
      
      if (data.profile) {
        const profile = data.profile;
        setFullName(profile.fullName || '');
        setTitle(profile.title || '');
        setCompanyRole(profile.companyRole || '');
        setPublicProfile(profile.publicProfile || 'medium');
        setNetWorthRange(profile.netWorthRange || '');
        setMediaExposure(profile.mediaExposure || '');
        setCurrentSecurityLevel(profile.currentSecurityLevel || 'minimal');
        setHasPersonalProtection(profile.hasPersonalProtection || false);
        setHasPanicRoom(profile.hasPanicRoom || false);
        setHasArmoredVehicle(profile.hasArmoredVehicle || false);
        // TCOR Fields
        setAnnualProtectionBudget(profile.annualProtectionBudget?.toString() || '');
        setInsuranceDeductible(profile.insuranceDeductible?.toString() || '');
        setDailyLossOfValue(profile.dailyLossOfValue?.toString() || '');
      }
    }
  }, [data, metadataInitialized]);

  // Update executive profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ExecutiveProfileData) => {
      return await apiRequest('PATCH', `/api/assessments/${id}/executive-profile`, profileData);
    },
    onSuccess: (response: any) => {
      // Refetch the profile to get updated backend-calculated metrics
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'executive-profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/risk-scenarios', id] });
      
      const scenarioResult = response._scenarioGeneration;
      const scenarioCount = scenarioResult?.scenariosCreated || 0;
      const analysis = response.analysis;
      
      toast({
        title: 'Profile Updated',
        description: `Executive profile saved. ${scenarioCount} risk scenario${scenarioCount !== 1 ? 's' : ''} generated. Risk Level: ${analysis?.riskLevel || 'Unknown'}`,
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update executive profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleSaveAndAnalyze = () => {
    if (!fullName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Principal name is required.',
        variant: 'destructive',
      });
      return;
    }

    const profileData: ExecutiveProfileData = {
      fullName: fullName.trim(),
      title: title.trim(),
      companyRole: companyRole.trim(),
      publicProfile,
      netWorthRange,
      mediaExposure,
      currentSecurityLevel,
      hasPersonalProtection,
      hasPanicRoom,
      hasArmoredVehicle,
      // TCOR Fields
      annualProtectionBudget: annualProtectionBudget ? parseInt(annualProtectionBudget) : undefined,
      insuranceDeductible: insuranceDeductible ? parseInt(insuranceDeductible) : undefined,
      dailyLossOfValue: dailyLossOfValue ? parseInt(dailyLossOfValue) : undefined,
    };

    updateProfileMutation.mutate(profileData);
  };

  // Get backend-calculated metrics (or defaults if not yet analyzed)
  const exposureFactor = data?.analysis?.exposureFactor || 0;
  const riskScore = data?.analysis?.riskScore || 0;
  const riskLevel = data?.analysis?.riskLevel || 'Low';
  const activeScenarioCount = data?.analysis?.activeScenarioCount || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">Principal Profile</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Executive Protection Risk Assessment
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs flex-shrink-0">
          <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          EP Framework
        </Badge>
      </div>

      {/* SECURITY-FIRST TOP ROW - Threat Assessment Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Threat Profile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Threat Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Risk Level</span>
                <Badge variant={
                  riskLevel === 'Critical' || riskLevel === 'High' ? 'destructive' :
                  riskLevel === 'Medium' ? 'secondary' : 'outline'
                }>
                  {riskLevel || 'Not Analyzed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Primary Threat</span>
                <Badge variant={
                  publicProfile === 'very_high' || publicProfile === 'high' ? 'destructive' :
                  publicProfile === 'medium' ? 'secondary' : 'outline'
                }>
                  {publicProfile === 'very_high' || publicProfile === 'high' ? 'Kidnapping/Ransom' :
                   publicProfile === 'medium' ? 'Harassment/Stalking' : 'General Security'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exposure Factor</span>
                <span className="font-semibold text-primary">
                  {exposureFactor > 0 ? `${exposureFactor.toFixed(1)}x` : 'Not Analyzed'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vulnerability Map */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Vulnerability Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Travel Security</span>
                <span className={`font-medium ${hasArmoredVehicle ? 'text-green-500' : 'text-orange-500'}`}>
                  {hasArmoredVehicle ? 'Protected' : 'Vulnerable'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Residence Security</span>
                <span className={`font-medium ${hasPanicRoom ? 'text-green-500' : 'text-orange-500'}`}>
                  {hasPanicRoom ? 'Hardened' : 'Exposed'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Personal Detail</span>
                <span className={`font-medium ${hasPersonalProtection ? 'text-green-500' : 'text-red-500'}`}>
                  {hasPersonalProtection ? 'Active' : 'None'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!hasPersonalProtection && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Personal protection needed</span>
                </div>
              )}
              {!hasArmoredVehicle && (publicProfile === 'very_high' || publicProfile === 'high') && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Secure transport recommended</span>
                </div>
              )}
              {!hasPanicRoom && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Safe haven needed</span>
                </div>
              )}
              {hasPersonalProtection && hasArmoredVehicle && hasPanicRoom && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Core protections in place</span>
                </div>
              )}
              <div className="pt-2 border-t mt-2">
                <div className="text-xs text-muted-foreground">
                  {activeScenarioCount > 0 ? `${activeScenarioCount} scenarios analyzed` : 'Save profile to generate scenarios'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Principal Information
            </CardTitle>
            <CardDescription>
              Enter executive details to assess exposure and threat landscape
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assessment Metadata Section */}
            <div className="space-y-4 pb-4 border-b">
              <div className="space-y-2">
                <Label htmlFor="assessmentTitle" className="text-sm font-medium">
                  Assessment Name
                </Label>
                <input
                  id="assessmentTitle"
                  data-testid="input-assessment-title"
                  type="text"
                  placeholder="e.g., Executive Protection Assessment - John Smith"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assessmentLocation" className="text-sm font-medium">
                    Location
                  </Label>
                  <input
                    id="assessmentLocation"
                    data-testid="input-assessment-location"
                    type="text"
                    placeholder="e.g., New York, NY"
                    value={assessmentLocation}
                    onChange={(e) => setAssessmentLocation(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessmentAssessor" className="text-sm font-medium">
                    Assessor Name
                  </Label>
                  <input
                    id="assessmentAssessor"
                    data-testid="input-assessment-assessor"
                    type="text"
                    placeholder="e.g., Jane Doe, CPP"
                    value={assessmentAssessor}
                    onChange={(e) => setAssessmentAssessor(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  data-testid="input-principal-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="CEO"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    data-testid="input-principal-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyRole">Company Role</Label>
                  <input
                    id="companyRole"
                    type="text"
                    value={companyRole}
                    onChange={(e) => setCompanyRole(e.target.value)}
                    placeholder="Founder"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    data-testid="input-principal-role"
                  />
                </div>
              </div>
            </div>

            {/* Public Exposure Metrics */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Public Exposure
              </h3>

              <div className="space-y-2">
                <Label htmlFor="publicProfile">Public Profile Level</Label>
                <Select value={publicProfile} onValueChange={setPublicProfile}>
                  <SelectTrigger id="publicProfile" data-testid="select-public-profile">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUBLIC_PROFILE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mediaExposure">Media Exposure</Label>
                <Select value={mediaExposure} onValueChange={setMediaExposure}>
                  <SelectTrigger id="mediaExposure" data-testid="select-media-exposure">
                    <SelectValue placeholder="Select level..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_EXPOSURE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="netWorthRange" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Net Worth Range
                </Label>
                <Select value={netWorthRange} onValueChange={setNetWorthRange}>
                  <SelectTrigger id="netWorthRange" data-testid="select-net-worth">
                    <SelectValue placeholder="Select range..." />
                  </SelectTrigger>
                  <SelectContent>
                    {NET_WORTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Current Security Posture */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Current Security Posture
              </h3>

              <div className="space-y-2">
                <Label htmlFor="securityLevel">Overall Security Level</Label>
                <Select value={currentSecurityLevel} onValueChange={setCurrentSecurityLevel}>
                  <SelectTrigger id="securityLevel" data-testid="select-security-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="personalProtection" className="cursor-pointer flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personal Protection Detail
                  </Label>
                  <Checkbox
                    id="personalProtection"
                    checked={hasPersonalProtection}
                    onCheckedChange={(checked) => setHasPersonalProtection(checked as boolean)}
                    data-testid="checkbox-personal-protection"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="armoredVehicle" className="cursor-pointer flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Armored Vehicle
                  </Label>
                  <Checkbox
                    id="armoredVehicle"
                    checked={hasArmoredVehicle}
                    onCheckedChange={(checked) => setHasArmoredVehicle(checked as boolean)}
                    data-testid="checkbox-armored-vehicle"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="panicRoom" className="cursor-pointer flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Panic Room / Safe Haven
                  </Label>
                  <Checkbox
                    id="panicRoom"
                    checked={hasPanicRoom}
                    onCheckedChange={(checked) => setHasPanicRoom(checked as boolean)}
                    data-testid="checkbox-panic-room"
                  />
                </div>
              </div>
            </div>

            {/* Resource Requirements */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Resource Requirements
              </h3>
              <p className="text-xs text-muted-foreground">
                Budget allocation for protection program implementation
              </p>

              <div className="space-y-2">
                <Label htmlFor="annualProtectionBudget">Annual Protection Budget ($)</Label>
                <input
                  id="annualProtectionBudget"
                  type="number"
                  value={annualProtectionBudget}
                  onChange={(e) => setAnnualProtectionBudget(e.target.value)}
                  placeholder="500000"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  data-testid="input-annual-protection-budget"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceDeductible">K&R Insurance Deductible ($)</Label>
                <input
                  id="insuranceDeductible"
                  type="number"
                  value={insuranceDeductible}
                  onChange={(e) => setInsuranceDeductible(e.target.value)}
                  placeholder="1000000"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  data-testid="input-insurance-deductible"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyLossOfValue">Daily Loss of Value ($)</Label>
                <input
                  id="dailyLossOfValue"
                  type="number"
                  value={dailyLossOfValue}
                  onChange={(e) => setDailyLossOfValue(e.target.value)}
                  placeholder="50000"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  data-testid="input-daily-loss-of-value"
                />
                <p className="text-xs text-muted-foreground">
                  Cost to company if executive is incapacitated (per day)
                </p>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleSaveAndAnalyze}
              disabled={updateProfileMutation.isPending}
              className="w-full"
              size="lg"
              data-testid="button-save-analyze"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
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

        {/* RIGHT COLUMN - Intelligence Radar */}
        <div className="space-y-6">
          {/* Exposure Factor Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Exposure Factor
              </CardTitle>
              <CardDescription>
                Threat landscape multiplier based on visibility and wealth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold text-primary">
                    {exposureFactor.toFixed(1)}x
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Risk Multiplier
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Public Profile</span>
                  <span className="capitalize">{publicProfile.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Media Exposure</span>
                  <span className="capitalize">{mediaExposure || 'Not Set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wealth Visibility</span>
                  <span className="capitalize">{netWorthRange ? netWorthRange.replace('_', ' ') : 'Not Set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Score
              </CardTitle>
              <CardDescription>
                Estimated threat likelihood based on current profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className={`text-6xl font-bold ${
                    riskScore < 25 ? 'text-green-500' :
                    riskScore < 50 ? 'text-yellow-500' :
                    riskScore < 75 ? 'text-orange-500' :
                    'text-red-500'
                  }`}>
                    {riskScore}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inherent Risk Score
                  </p>
                  <Badge variant={
                    riskScore < 25 ? 'outline' :
                    riskScore < 50 ? 'secondary' :
                    'destructive'
                  }>
                    {riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Controls Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Active Controls
              </CardTitle>
              <CardDescription>
                Current protective measures in place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hasPersonalProtection && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Personal Protection Detail</span>
                  </div>
                )}
                {hasArmoredVehicle && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Armored Vehicle</span>
                  </div>
                )}
                {hasPanicRoom && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Panic Room / Safe Haven</span>
                  </div>
                )}
                {!hasPersonalProtection && !hasArmoredVehicle && !hasPanicRoom && (
                  <p className="text-sm text-muted-foreground italic">
                    No active controls configured
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BOTTOM ROW - Resource Justification */}
      <ExecutiveCostBenefitCalculator 
        profile={data?.profile || null} 
        tcor={data?.tcor || null}
      />
    </div>
  );
}
