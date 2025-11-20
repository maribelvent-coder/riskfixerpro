import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Trash2,
  Shield, 
  Target,
  Users,
  Home,
  Car,
  FileText,
  ArrowRight,
  ArrowLeft,
  User,
  MapPin,
  Plane,
  MessageSquare
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { riskAssetApi, riskScenarioApi, vulnerabilityApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RiskAsset, RiskScenario, Vulnerability, InsertRiskAsset, InsertRiskScenario, InsertVulnerability } from "@shared/schema";
import { 
  LIKELIHOOD_VALUES, 
  IMPACT_VALUES,
  calculateRiskLevel
} from '@shared/riskCalculations';

const EXECUTIVE_ASSET_TYPES = [
  { value: "executive", label: "Executive/Principal", icon: User },
  { value: "family", label: "Family Members", icon: Users },
  { value: "residence", label: "Residence/Property", icon: Home },
  { value: "vehicle", label: "Vehicles", icon: Car },
  { value: "information", label: "Sensitive Information", icon: FileText },
];

const EXECUTIVE_RISK_SCENARIOS = [
  {
    scenario: "Kidnapping/Abduction",
    threatType: "human" as const,
    description: "Targeted kidnapping of executive or family member for ransom or political leverage",
    defaultLikelihood: "low" as const,
    defaultImpact: "catastrophic" as const,
    icon: AlertTriangle,
  },
  {
    scenario: "Extortion/Blackmail",
    threatType: "human" as const,
    description: "Threat actor uses compromising information or threats to coerce executive",
    defaultLikelihood: "medium" as const,
    defaultImpact: "major" as const,
    icon: MessageSquare,
  },
  {
    scenario: "Stalking/Harassment",
    threatType: "human" as const,
    description: "Persistent unwanted attention, surveillance, or contact with executive or family",
    defaultLikelihood: "medium" as const,
    defaultImpact: "moderate" as const,
    icon: Target,
  },
  {
    scenario: "Home Invasion/Burglary",
    threatType: "human" as const,
    description: "Unauthorized entry into executive's residence with intent to steal or harm",
    defaultLikelihood: "low" as const,
    defaultImpact: "major" as const,
    icon: Home,
  },
  {
    scenario: "Workplace Violence/Active Shooter",
    threatType: "human" as const,
    description: "Violent attack targeting executive at workplace or public appearance",
    defaultLikelihood: "very-low" as const,
    defaultImpact: "catastrophic" as const,
    icon: Shield,
  },
  {
    scenario: "Cyber/Digital Threats",
    threatType: "technical" as const,
    description: "Hacking, identity theft, social engineering, or digital surveillance of executive",
    defaultLikelihood: "high" as const,
    defaultImpact: "major" as const,
    icon: Shield,
  },
  {
    scenario: "Travel-Related Threats",
    threatType: "operational" as const,
    description: "Risks during executive travel including surveillance, tracking, or targeted attacks",
    defaultLikelihood: "medium" as const,
    defaultImpact: "major" as const,
    icon: Plane,
  },
  {
    scenario: "Reputational Threats",
    threatType: "human" as const,
    description: "Coordinated attacks on executive's reputation through media, social media, or false allegations",
    defaultLikelihood: "medium" as const,
    defaultImpact: "moderate" as const,
    icon: MessageSquare,
  },
];

function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case "critical": return "bg-red-600";
    case "high": return "bg-red-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
  }
}

interface ExecutiveRiskAnalysisProps {
  assessmentId: string;
  onComplete?: () => void;
}

export function ExecutiveRiskAnalysis({ assessmentId, onComplete }: ExecutiveRiskAnalysisProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [localAssets, setLocalAssets] = useState<RiskAsset[]>([]);
  const [localScenarios, setLocalScenarios] = useState<RiskScenario[]>([]);
  const [localVulnerabilities, setLocalVulnerabilities] = useState<Vulnerability[]>([]);
  const [newAsset, setNewAsset] = useState({ 
    name: "", 
    type: "executive", 
    owner: "", 
    criticality: 5, 
    scope: "", 
    notes: "" 
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "risk-assets"],
    queryFn: () => riskAssetApi.getAll(assessmentId),
    enabled: !!assessmentId,
  });

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "risk-scenarios"], 
    queryFn: () => riskScenarioApi.getAll(assessmentId),
    enabled: !!assessmentId,
  });

  const { data: vulnerabilities = [], isLoading: vulnerabilitiesLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "vulnerabilities"],
    queryFn: () => vulnerabilityApi.getAll(assessmentId),
    enabled: !!assessmentId,
  });

  useEffect(() => {
    setLocalAssets(assets);
  }, [assets]);

  useEffect(() => {
    if (scenarios.length > 0) {
      setLocalScenarios(scenarios);
    } else {
      const initialScenarios = EXECUTIVE_RISK_SCENARIOS.map(template => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        assessmentId,
        assetId: null,
        scenario: template.scenario,
        asset: "Executive Protection",
        threatType: template.threatType,
        threatDescription: template.description,
        vulnerabilityDescription: "",
        likelihood: template.defaultLikelihood,
        impact: template.defaultImpact,
        riskLevel: calculateRiskLevel(template.defaultLikelihood, template.defaultImpact),
        currentLikelihood: null,
        currentImpact: null,
        currentRiskLevel: null,
        decision: "undecided",
        riskRating: null,
        createdAt: new Date(),
      } as RiskScenario));
      setLocalScenarios(initialScenarios);
    }
  }, [scenarios, assessmentId]);

  useEffect(() => {
    setLocalVulnerabilities(vulnerabilities);
  }, [vulnerabilities]);

  const createAssetMutation = useMutation({
    mutationFn: (data: InsertRiskAsset) => riskAssetApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
      toast({
        title: "Asset Added",
        description: "Executive asset has been added successfully.",
      });
      setNewAsset({ name: "", type: "executive", owner: "", criticality: 5, scope: "", notes: "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add asset",
        variant: "destructive",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => riskAssetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
      toast({
        title: "Asset Removed",
        description: "Asset has been removed successfully.",
      });
    },
  });

  const bulkUpsertScenariosMutation = useMutation({
    mutationFn: (scenarios: InsertRiskScenario[]) => 
      riskScenarioApi.bulkUpsert(assessmentId, scenarios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] });
      toast({
        title: "Scenarios Saved",
        description: "Risk scenarios have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save scenarios",
        variant: "destructive",
      });
    },
  });

  const createVulnerabilityMutation = useMutation({
    mutationFn: (data: InsertVulnerability) => vulnerabilityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "vulnerabilities"] });
      toast({
        title: "Vulnerability Added",
        description: "Vulnerability has been added successfully.",
      });
    },
  });

  const deleteVulnerabilityMutation = useMutation({
    mutationFn: (id: string) => vulnerabilityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "vulnerabilities"] });
      toast({
        title: "Vulnerability Removed",
        description: "Vulnerability has been removed successfully.",
      });
    },
  });

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.type) {
      toast({
        title: "Validation Error",
        description: "Please provide asset name and type",
        variant: "destructive",
      });
      return;
    }

    createAssetMutation.mutate({
      assessmentId,
      name: newAsset.name,
      type: newAsset.type,
      owner: newAsset.owner,
      criticality: newAsset.criticality,
      scope: newAsset.scope,
      notes: newAsset.notes,
      protectionSystems: [],
    });
  };

  const handleUpdateScenario = (index: number, field: string, value: any) => {
    setLocalScenarios(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === "likelihood" || field === "impact") {
        const scenario = updated[index];
        updated[index].riskLevel = calculateRiskLevel(
          scenario.likelihood as keyof typeof LIKELIHOOD_VALUES,
          scenario.impact as keyof typeof IMPACT_VALUES
        );
      }
      
      return updated;
    });
  };

  const handleSaveScenarios = () => {
    const scenariosToSave = localScenarios.map(s => ({
      assessmentId,
      assetId: s.assetId,
      scenario: s.scenario,
      asset: s.asset,
      threatType: s.threatType,
      threatDescription: s.threatDescription,
      vulnerabilityDescription: s.vulnerabilityDescription,
      likelihood: s.likelihood,
      impact: s.impact,
      riskLevel: s.riskLevel,
    }));

    bulkUpsertScenariosMutation.mutate(scenariosToSave);
  };

  const handleAddVulnerability = () => {
    createVulnerabilityMutation.mutate({
      assessmentId,
      riskScenarioId: null,
      description: "New vulnerability identified from executive survey",
      notes: "",
    });
  };

  const handleNext = () => {
    if (currentStep === 0 && localAssets.length === 0) {
      toast({
        title: "No Assets Defined",
        description: "Please add at least one asset before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 1) {
      handleSaveScenarios();
    }
    
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    handleSaveScenarios();
    toast({
      title: "Risk Analysis Complete",
      description: "Executive risk analysis has been saved successfully.",
    });
    onComplete?.();
  };

  const progressPercentage = ((currentStep + 1) / 3) * 100;

  const steps = [
    { title: "Define Assets", icon: Target },
    { title: "Risk Scenarios", icon: AlertTriangle },
    { title: "Vulnerabilities", icon: Shield },
  ];

  return (
    <div className="space-y-3 sm:space-y-6" data-testid="executive-risk-analysis">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Executive Protection Risk Analysis</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Step {currentStep + 1}/3: {steps[currentStep].title}
          </p>
        </div>
        <Badge variant="outline" data-testid="badge-progress" className="text-[10px] sm:text-xs w-fit">
          {Math.round(progressPercentage)}% Complete
        </Badge>
      </div>

      <Progress value={progressPercentage} className="h-1.5 sm:h-2" data-testid="progress-bar" />

      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <Card 
              key={index} 
              className={`flex-1 min-w-[90px] ${currentStep === index ? 'border-primary' : ''}`}
              data-testid={`step-indicator-${index}`}
            >
              <CardContent className="p-2 sm:p-4 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
                <div className={`p-1 sm:p-2 rounded-md ${currentStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <StepIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="text-[10px] sm:text-sm font-medium truncate">{step.title}</div>
                </div>
                {currentStep > index && (
                  <CheckCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-500" data-testid={`step-complete-${index}`} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentStep === 0 && (
        <div className="space-y-3 sm:space-y-6">
          <Card data-testid="card-add-asset">
            <CardHeader className="p-2.5 sm:p-4">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add Executive Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-4 p-2.5 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="asset-type" className="text-xs sm:text-sm">Asset Type</Label>
                  <Select 
                    value={newAsset.type} 
                    onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}
                  >
                    <SelectTrigger id="asset-type" data-testid="select-asset-type" className="text-xs sm:text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXECUTIVE_ASSET_TYPES.map(type => {
                        const TypeIcon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value} className="text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <TypeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="asset-name" className="text-xs sm:text-sm">Name</Label>
                  <Input
                    id="asset-name"
                    data-testid="input-asset-name"
                    placeholder="e.g., CEO John Smith"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="asset-owner" className="text-xs sm:text-sm">Owner/Manager</Label>
                  <Input
                    id="asset-owner"
                    data-testid="input-asset-owner"
                    placeholder="e.g., Security Department"
                    value={newAsset.owner}
                    onChange={(e) => setNewAsset({ ...newAsset, owner: e.target.value })}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="asset-scope" className="text-xs sm:text-sm">Scope/Location</Label>
                  <Input
                    id="asset-scope"
                    data-testid="input-asset-scope"
                    placeholder="e.g., Corporate HQ"
                    value={newAsset.scope}
                    onChange={(e) => setNewAsset({ ...newAsset, scope: e.target.value })}
                    className="text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Criticality: {newAsset.criticality}</Label>
                <Slider
                  data-testid="slider-asset-criticality"
                  value={[newAsset.criticality]}
                  onValueChange={([value]) => setNewAsset({ ...newAsset, criticality: value })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full py-1"
                />
                <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span>Critical</span>
                  <span>Essential</span>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="asset-notes" className="text-xs sm:text-sm">Notes</Label>
                <Textarea
                  id="asset-notes"
                  data-testid="textarea-asset-notes"
                  placeholder="Additional details about this asset..."
                  value={newAsset.notes}
                  onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                  rows={3}
                  className="text-xs sm:text-sm"
                />
              </div>

              <Button 
                onClick={handleAddAsset} 
                disabled={createAssetMutation.isPending}
                data-testid="button-add-asset"
                className="text-xs sm:text-sm"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Add Asset
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-assets-list">
            <CardHeader className="p-2.5 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Defined Assets ({localAssets.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4">
              {assetsLoading ? (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">Loading assets...</div>
              ) : localAssets.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
                  No assets defined yet. Add your first executive asset above.
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {localAssets.map((asset) => {
                    const assetType = EXECUTIVE_ASSET_TYPES.find(t => t.value === asset.type);
                    const AssetIcon = assetType?.icon || Target;
                    return (
                      <Card key={asset.id} data-testid={`asset-card-${asset.id}`}>
                        <CardContent className="p-2 sm:p-4 flex items-start gap-2 sm:gap-4">
                          <div className="p-1 sm:p-2 bg-primary/10 rounded-md flex-shrink-0">
                            <AssetIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{asset.name}</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                              {assetType?.label} • Criticality: {asset.criticality}/5
                            </div>
                            {asset.scope && (
                              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 flex items-center gap-0.5 sm:gap-1">
                                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                {asset.scope}
                              </div>
                            )}
                            {asset.notes && (
                              <div className="text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2">{asset.notes}</div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAssetMutation.mutate(asset.id)}
                            disabled={deleteAssetMutation.isPending}
                            data-testid={`button-delete-asset-${asset.id}`}
                            className="h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-3 sm:space-y-6">
          <Card data-testid="card-risk-scenarios">
            <CardHeader className="p-2.5 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Executive Protection Risk Scenarios</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Pre-populated executive-specific threats. Adjust likelihood and impact based on your assessment.
              </p>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4">
              {scenariosLoading ? (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">Loading scenarios...</div>
              ) : (
                <div className="space-y-2 sm:space-y-4">
                  {localScenarios.map((scenario, index) => {
                    const likelihoodValue = LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof LIKELIHOOD_VALUES]?.value || 3;
                    const impactValue = IMPACT_VALUES[scenario.impact as keyof typeof IMPACT_VALUES]?.value || 3;
                    const riskScore = likelihoodValue * impactValue;
                    const riskColor = getRiskColor(scenario.riskLevel);
                    
                    return (
                      <Card key={scenario.id || index} data-testid={`scenario-card-${index}`}>
                        <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                <h4 className="font-medium text-xs sm:text-sm">{scenario.scenario}</h4>
                                <Badge className={riskColor} data-testid={`badge-risk-${index}`} className={`${riskColor} text-[10px] sm:text-xs`}>
                                  {scenario.riskLevel} ({riskScore})
                                </Badge>
                              </div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                {scenario.threatDescription}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                            <div className="space-y-1.5 sm:space-y-2">
                              <Label className="text-xs sm:text-sm">Likelihood</Label>
                              <Select
                                value={scenario.likelihood}
                                onValueChange={(value) => handleUpdateScenario(index, "likelihood", value)}
                              >
                                <SelectTrigger data-testid={`select-likelihood-${index}`} className="text-xs sm:text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(LIKELIHOOD_VALUES).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key} className="text-xs sm:text-sm">
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                              <Label className="text-xs sm:text-sm">Impact</Label>
                              <Select
                                value={scenario.impact}
                                onValueChange={(value) => handleUpdateScenario(index, "impact", value)}
                              >
                                <SelectTrigger data-testid={`select-impact-${index}`} className="text-xs sm:text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(IMPACT_VALUES).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key} className="text-xs sm:text-sm">
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-1.5 sm:space-y-2">
                            <Label className="text-xs sm:text-sm">Vulnerability Details</Label>
                            <Textarea
                              data-testid={`textarea-vulnerability-${index}`}
                              placeholder="Describe specific vulnerabilities..."
                              value={scenario.vulnerabilityDescription || ""}
                              onChange={(e) => handleUpdateScenario(index, "vulnerabilityDescription", e.target.value)}
                              rows={2}
                              className="text-xs sm:text-sm"
                            />
                          </div>

                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-3 sm:space-y-6">
          <Card data-testid="card-vulnerabilities">
            <CardHeader className="p-2.5 sm:p-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-base sm:text-lg">
                <span>Identified Vulnerabilities</span>
                <Button 
                  onClick={handleAddVulnerability}
                  disabled={createVulnerabilityMutation.isPending}
                  data-testid="button-add-vulnerability"
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Add Vulnerability
                </Button>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Vulnerabilities identified from executive survey responses that increase risk exposure.
              </p>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-4">
              {vulnerabilitiesLoading ? (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">Loading vulnerabilities...</div>
              ) : localVulnerabilities.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
                  No vulnerabilities identified yet. Add vulnerabilities based on your survey findings.
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {localVulnerabilities.map((vuln) => (
                    <Card key={vuln.id} data-testid={`vulnerability-card-${vuln.id}`}>
                      <CardContent className="p-2 sm:p-4 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {vuln.description && (
                            <p className="text-xs sm:text-sm font-medium">{vuln.description}</p>
                          )}
                          {vuln.notes && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{vuln.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteVulnerabilityMutation.mutate(vuln.id)}
                          disabled={deleteVulnerabilityMutation.isPending}
                          data-testid={`button-delete-vulnerability-${vuln.id}`}
                          className="h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-risk-summary">
            <CardHeader className="p-2.5 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Risk Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-2.5 sm:p-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-primary">{localAssets.length}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Assets</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-yellow-500">{localScenarios.length}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Scenarios</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-red-500">{localVulnerabilities.length}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Vulnerabilities</div>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-xs sm:text-sm font-medium">Risk Level Distribution</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  {["Critical", "High", "Medium", "Low", "Very Low"].map(level => {
                    const count = localScenarios.filter(s => s.riskLevel === level).length;
                    const percentage = localScenarios.length > 0 ? (count / localScenarios.length) * 100 : 0;
                    return (
                      <div key={level} className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-16 sm:w-24 text-[10px] sm:text-xs">{level}</div>
                        <div className="flex-1 bg-muted rounded-full h-4 sm:h-6 overflow-hidden">
                          <div 
                            className={`h-full ${getRiskColor(level)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-8 sm:w-12 text-[10px] sm:text-xs text-right" data-testid={`count-${level.toLowerCase().replace(' ', '-')}`}>
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-2 pt-4 sm:pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          data-testid="button-previous"
          className="text-sm min-h-11 w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < 2 ? (
          <Button onClick={handleNext} data-testid="button-next" className="text-sm min-h-11 w-full sm:w-auto">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleComplete} data-testid="button-complete" className="text-sm min-h-11 w-full sm:w-auto">
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Analysis
          </Button>
        )}
      </div>
    </div>
  );
}
