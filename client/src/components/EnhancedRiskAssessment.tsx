import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Edit,
  Shield, 
  Target,
  Activity,
  Users,
  Cloud,
  Zap,
  Settings,
  Save,
  Download
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentApi, riskAssetApi, riskScenarioApi, treatmentPlanApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RiskAsset, RiskScenario, TreatmentPlan, InsertRiskScenario, InsertTreatmentPlan } from "@shared/schema";

// Risk calculation constants
const LIKELIHOOD_VALUES = {
  "very-low": { value: 1, label: "Very Low (1)", description: "Extremely unlikely to occur" },
  "low": { value: 2, label: "Low (2)", description: "Unlikely to occur" },
  "medium": { value: 3, label: "Medium (3)", description: "Possible to occur" },
  "high": { value: 4, label: "High (4)", description: "Likely to occur" },
  "very-high": { value: 5, label: "Very High (5)", description: "Very likely to occur" }
};

const IMPACT_VALUES = {
  "negligible": { value: 1, label: "Negligible (1)", description: "Minimal disruption" },
  "minor": { value: 2, label: "Minor (2)", description: "Limited disruption" },
  "moderate": { value: 3, label: "Moderate (3)", description: "Significant disruption" },
  "major": { value: 4, label: "Major (4)", description: "Severe disruption" },
  "catastrophic": { value: 5, label: "Catastrophic (5)", description: "Complete disruption" }
};

const THREAT_CATEGORIES = {
  "human": { 
    label: "Human Threats", 
    icon: Users, 
    color: "bg-red-500", 
    threats: ["Theft", "Vandalism", "Workplace Violence", "Insider Threat", "Unauthorized Access", "Espionage"]
  },
  "environmental": { 
    label: "Environmental Threats", 
    icon: Cloud, 
    color: "bg-blue-500", 
    threats: ["Natural Disaster", "Fire", "Flood", "Weather Damage", "Power Outage", "Infrastructure Failure"]
  },
  "technical": { 
    label: "Technical Threats", 
    icon: Zap, 
    color: "bg-purple-500", 
    threats: ["System Failure", "Cyber Attack", "Equipment Malfunction", "Software Vulnerability", "Data Breach", "Network Compromise"]
  },
  "operational": { 
    label: "Operational Threats", 
    icon: Settings, 
    color: "bg-orange-500", 
    threats: ["Process Failure", "Human Error", "Training Gap", "Procedure Violation", "Communication Breakdown", "Resource Shortage"]
  }
};

const TREATMENT_OPTIONS = {
  "accept": { label: "Accept", description: "Accept the risk as is", color: "bg-gray-500" },
  "avoid": { label: "Avoid", description: "Eliminate the risk by avoiding the activity", color: "bg-blue-500" },
  "control": { label: "Control", description: "Implement controls to reduce risk", color: "bg-green-500" },
  "transfer": { label: "Transfer", description: "Transfer risk to third party (insurance)", color: "bg-purple-500" }
};

function calculateRiskLevel(likelihood: string, impact: string): { level: string; score: number; color: string } {
  const likelihoodValue = LIKELIHOOD_VALUES[likelihood as keyof typeof LIKELIHOOD_VALUES]?.value || 0;
  const impactValue = IMPACT_VALUES[impact as keyof typeof IMPACT_VALUES]?.value || 0;
  const score = likelihoodValue * impactValue;

  if (score >= 20) return { level: "Critical", score, color: "bg-red-600" };
  if (score >= 15) return { level: "High", score, color: "bg-red-500" };
  if (score >= 10) return { level: "Medium", score, color: "bg-yellow-500" };
  if (score >= 5) return { level: "Low", score, color: "bg-green-500" };
  return { level: "Very Low", score, color: "bg-gray-500" };
}

interface EnhancedRiskAssessmentProps {
  assessmentId: string;
  onComplete?: () => void;
}

export function EnhancedRiskAssessment({ assessmentId, onComplete }: EnhancedRiskAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedAssets, setExtractedAssets] = useState<RiskAsset[]>([]);
  const [scenarios, setScenarios] = useState<RiskScenario[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [newAsset, setNewAsset] = useState({ 
    name: "", 
    type: "", 
    owner: "", 
    criticality: 3, 
    scope: "", 
    notes: "", 
    protectionSystems: [] as string[] 
  });
  const [isExtracting, setIsExtracting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load existing data
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "risk-assets"],
    queryFn: () => riskAssetApi.getAll(assessmentId),
    enabled: !!assessmentId,
  });

  const { data: existingScenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "risk-scenarios"], 
    queryFn: () => riskScenarioApi.getAll(assessmentId),
    enabled: !!assessmentId,
  });

  const { data: existingPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "treatment-plans"],
    queryFn: () => treatmentPlanApi.getAll(assessmentId),
    enabled: !!assessmentId,
  });

  useEffect(() => {
    setExtractedAssets(assets);
  }, [assets]);

  useEffect(() => {
    setScenarios(existingScenarios);
  }, [existingScenarios]);

  useEffect(() => {
    setTreatmentPlans(existingPlans);
  }, [existingPlans]);


  // Asset creation mutation
  const createAssetMutation = useMutation({
    mutationFn: (assetData: any) => riskAssetApi.create({
      assessmentId,
      name: assetData.name,
      type: assetData.type,
      owner: assetData.owner,
      criticality: assetData.criticality,
      scope: assetData.scope,
      notes: assetData.notes,
      protectionSystems: assetData.protectionSystems
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
      setNewAsset({ 
        name: "", 
        type: "", 
        owner: "", 
        criticality: 3, 
        scope: "", 
        notes: "", 
        protectionSystems: [] 
      });
      toast({
        title: "Asset Added",
        description: "Asset has been added successfully.",
      });
    },
  });

  // Asset deletion mutation
  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => riskAssetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
      toast({
        title: "Asset Deleted",
        description: "Asset has been removed successfully.",
      });
    },
  });

  // Scenario mutations
  const createScenarioMutation = useMutation({
    mutationFn: (scenarioData: InsertRiskScenario) => riskScenarioApi.create(scenarioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] });
      toast({
        title: "Scenario Added",
        description: "Risk scenario has been created successfully.",
      });
    },
  });

  const updateScenarioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RiskScenario> }) => 
      riskScenarioApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] });
    },
  });

  const deleteScenarioMutation = useMutation({
    mutationFn: (id: string) => riskScenarioApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] });
      toast({
        title: "Scenario Deleted",
        description: "Risk scenario has been removed.",
      });
    },
  });

  // Treatment plan mutations
  const createTreatmentMutation = useMutation({
    mutationFn: (planData: InsertTreatmentPlan) => treatmentPlanApi.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "treatment-plans"] });
      toast({
        title: "Treatment Plan Created",
        description: "Risk treatment plan has been added.",
      });
    },
  });

  const updateTreatmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TreatmentPlan> }) => 
      treatmentPlanApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "treatment-plans"] });
    },
  });

  const steps = [
    { title: "Asset Identification", icon: Target },
    { title: "Risk Scenarios", icon: AlertTriangle },
    { title: "Risk Analysis", icon: Activity },
    { title: "Treatment Planning", icon: Shield },
    { title: "Review & Submit", icon: CheckCircle }
  ];


  const handleAddCustomAsset = () => {
    if (!newAsset.name.trim() || !newAsset.type.trim()) {
      toast({
        title: "Invalid Asset",
        description: "Please provide asset name and type.",
        variant: "destructive",
      });
      return;
    }
    createAssetMutation.mutate(newAsset);
  };

  const handleAddScenario = () => {
    const newScenario: InsertRiskScenario = {
      assessmentId,
      assetId: extractedAssets[0]?.id || "",
      scenario: "New Risk Scenario",
      asset: extractedAssets[0]?.name || "Unknown Asset",
      likelihood: "medium",
      impact: "moderate",
      riskLevel: "Medium",
      riskRating: ""
    };
    
    createScenarioMutation.mutate(newScenario);
  };

  const handleUpdateScenario = (id: string, field: string, value: any) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    let updatedData = { [field]: value };
    
    // Recalculate risk if likelihood or impact changed
    if (field === "likelihood" || field === "impact") {
      const likelihood = field === "likelihood" ? value : scenario.likelihood;
      const impact = field === "impact" ? value : scenario.impact;
      const risk = calculateRiskLevel(likelihood, impact);
      updatedData = {
        ...updatedData,
        riskLevel: risk.level
      };
    }

    updateScenarioMutation.mutate({ id, data: updatedData });
  };

  // Debounced version for text inputs to prevent API spam
  const [debouncedUpdates, setDebouncedUpdates] = useState<{[key: string]: NodeJS.Timeout}>({});
  
  const handleUpdateScenarioDebounced = useCallback((id: string, field: string, value: any) => {
    // Clear existing timeout for this field
    const key = `${id}-${field}`;
    if (debouncedUpdates[key]) {
      clearTimeout(debouncedUpdates[key]);
    }
    
    // Update local state immediately for responsive UI
    setScenarios(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      handleUpdateScenario(id, field, value);
      setDebouncedUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[key];
        return newUpdates;
      });
    }, 500); // 500ms delay
    
    setDebouncedUpdates(prev => ({ ...prev, [key]: timeoutId }));
  }, [debouncedUpdates, scenarios]);

  const handleUpdateTreatment = (id: string, field: string, value: any) => {
    const originalPlans = treatmentPlans;
    
    // Optimistic update - update local state immediately
    setTreatmentPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, [field]: value } : plan
    ));
    
    // Persist to database with error handling
    updateTreatmentMutation.mutate({ id, data: { [field]: value } }, {
      onError: (error) => {
        // Rollback optimistic update on error
        setTreatmentPlans(originalPlans);
        toast({
          title: "Update Failed",
          description: `Failed to update treatment plan: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };

  const completedSteps = currentStep;
  const progress = ((completedSteps + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Asset Identification
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Step 1: Asset Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Identify the valuable assets your organization wants to protect. These can be people, property, 
                    information, reputation, or other things of value that could be compromised by threats.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> Customer database (Information), Executive team (People), 
                    Server room (Property), Company reputation (Reputation)
                  </p>
                </div>

                {extractedAssets.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium">Assets to Protect</h4>
                    <div className="grid gap-2">
                      {extractedAssets.map((asset) => (
                        <Card key={asset.id} className="hover-elevate">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{asset.name}</p>
                                  <Badge variant="outline">{asset.type}</Badge>
                                  <Badge variant="secondary">Criticality: {asset.criticality}</Badge>
                                </div>
                                {asset.owner && (
                                  <p className="text-sm text-muted-foreground">Owner: {asset.owner}</p>
                                )}
                                {asset.scope && (
                                  <p className="text-sm text-muted-foreground">Scope: {asset.scope}</p>
                                )}
                                {asset.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">{asset.notes}</p>
                                )}
                                {asset.protectionSystems && asset.protectionSystems.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {asset.protectionSystems.map(system => (
                                      <Badge key={system} variant="outline" className="text-xs">
                                        {system.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setNewAsset({
                                      name: asset.name,
                                      type: asset.type,
                                      owner: asset.owner || "",
                                      criticality: asset.criticality,
                                      scope: asset.scope || "",
                                      notes: asset.notes || "",
                                      protectionSystems: asset.protectionSystems || []
                                    });
                                  }}
                                  data-testid={`button-edit-asset-${asset.id}`}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteAssetMutation.mutate(asset.id)}
                                  disabled={deleteAssetMutation.isPending}
                                  data-testid={`button-delete-asset-${asset.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Add Asset to Protect</h4>
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="asset-name">Asset Name</Label>
                      <Input
                        id="asset-name"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Customer Database, Executive Team, Server Room"
                        data-testid="input-asset-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset-type">Asset Type</Label>
                      <Select 
                        value={newAsset.type} 
                        onValueChange={(value) => setNewAsset(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger data-testid="select-asset-type">
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="People">People - Employees, visitors, contractors</SelectItem>
                          <SelectItem value="Property">Property - Buildings, equipment, inventory</SelectItem>
                          <SelectItem value="Information">Information - Data, documents, intellectual property</SelectItem>
                          <SelectItem value="Reputation">Reputation - Brand, customer trust, public image</SelectItem>
                          <SelectItem value="Other">Other - Specify in notes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="asset-owner">Owner</Label>
                      <Input
                        id="asset-owner"
                        value={newAsset.owner}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, owner: e.target.value }))}
                        placeholder="e.g., IT Department, HR Manager"
                        data-testid="input-asset-owner"
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset-criticality">Criticality (1-5)</Label>
                      <Select 
                        value={newAsset.criticality.toString()} 
                        onValueChange={(value) => setNewAsset(prev => ({ ...prev, criticality: parseInt(value) }))}
                      >
                        <SelectTrigger data-testid="select-asset-criticality">
                          <SelectValue placeholder="Select criticality level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Very Low Impact</SelectItem>
                          <SelectItem value="2">2 - Low Impact</SelectItem>
                          <SelectItem value="3">3 - Medium Impact</SelectItem>
                          <SelectItem value="4">4 - High Impact</SelectItem>
                          <SelectItem value="5">5 - Critical Impact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="asset-scope">Scope</Label>
                      <Input
                        id="asset-scope"
                        value={newAsset.scope}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, scope: e.target.value }))}
                        placeholder="e.g., HQ Building, IT Department, Company-wide"
                        data-testid="input-asset-scope"
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset-notes">Notes</Label>
                      <Textarea
                        id="asset-notes"
                        value={newAsset.notes}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional description or context..."
                        data-testid="textarea-asset-notes"
                        rows={2}
                      />
                    </div>
                    <Button 
                      onClick={handleAddCustomAsset}
                      disabled={createAssetMutation.isPending}
                      data-testid="button-add-asset"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Asset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1: // Risk Scenarios
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Step 2: Risk Scenario Development
                  </CardTitle>
                  <Button 
                    onClick={handleAddScenario}
                    disabled={extractedAssets.length === 0}
                    data-testid="button-add-scenario"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Scenario
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {extractedAssets.length === 0 ? (
                  <p className="text-muted-foreground">Complete asset identification first.</p>
                ) : scenarios.length === 0 ? (
                  <p className="text-muted-foreground">No risk scenarios created yet. Click "Add Scenario" to begin.</p>
                ) : (
                  <div className="space-y-4">
                    {scenarios.map((scenario) => {
                      const risk = calculateRiskLevel(scenario.likelihood, scenario.impact);
                      return (
                        <Card key={scenario.id} className="relative">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-blue-500 text-white">
                                    Risk Scenario
                                  </Badge>
                                  <Badge className={`${risk.color} text-white`}>
                                    {risk.level} ({risk.score})
                                  </Badge>
                                </div>
                                <Select 
                                  value={scenario.assetId} 
                                  onValueChange={(value) => handleUpdateScenario(scenario.id, "assetId", value)}
                                >
                                  <SelectTrigger data-testid={`select-asset-${scenario.id}`}>
                                    <SelectValue placeholder="Select affected asset" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {extractedAssets.map((asset) => (
                                      <SelectItem key={asset.id} value={asset.id}>
                                        {asset.name} ({asset.type})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteScenarioMutation.mutate(scenario.id)}
                                data-testid={`button-delete-scenario-${scenario.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Threat Type</Label>
                                <Select 
                                  value={scenario.threatType} 
                                  onValueChange={(value) => handleUpdateScenario(scenario.id, "threatType", value)}
                                >
                                  <SelectTrigger data-testid={`select-threat-type-${scenario.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(THREAT_CATEGORIES).map(([key, category]) => (
                                      <SelectItem key={key} value={key}>
                                        {category.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Specific Threat</Label>
                                <Select 
                                  value={scenario.threatDescription} 
                                  onValueChange={(value) => handleUpdateScenario(scenario.id, "threatDescription", value)}
                                >
                                  <SelectTrigger data-testid={`select-specific-threat-${scenario.id}`}>
                                    <SelectValue placeholder="Select specific threat" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {THREAT_CATEGORIES[scenario.threatType as keyof typeof THREAT_CATEGORIES]?.threats.map((threat) => (
                                      <SelectItem key={threat} value={threat}>
                                        {threat}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label>Vulnerability Description</Label>
                              <Textarea
                                value={scenario.vulnerabilityDescription || ""}
                                onChange={(e) => handleUpdateScenarioDebounced(scenario.id, "vulnerabilityDescription", e.target.value)}
                                placeholder="Describe the specific vulnerability that enables this threat..."
                                data-testid={`textarea-vulnerability-${scenario.id}`}
                                rows={2}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Likelihood</Label>
                                <Select 
                                  value={scenario.likelihood} 
                                  onValueChange={(value) => handleUpdateScenario(scenario.id, "likelihood", value)}
                                >
                                  <SelectTrigger data-testid={`select-likelihood-${scenario.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(LIKELIHOOD_VALUES).map(([key, val]) => (
                                      <SelectItem key={key} value={key}>
                                        {val.label} - {val.description}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Impact</Label>
                                <Select 
                                  value={scenario.impact} 
                                  onValueChange={(value) => handleUpdateScenario(scenario.id, "impact", value)}
                                >
                                  <SelectTrigger data-testid={`select-impact-${scenario.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(IMPACT_VALUES).map(([key, val]) => (
                                      <SelectItem key={key} value={key}>
                                        {val.label} - {val.description}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
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
        );

      case 2: // Risk Analysis
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Step 3: Risk Analysis Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                {existingScenarios.length === 0 ? (
                  <p className="text-muted-foreground">Complete risk scenario development first.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {existingScenarios.map((scenario) => {
                        const risk = calculateRiskLevel(scenario.likelihood, scenario.impact);
                        const asset = extractedAssets.find(a => a.id === scenario.assetId);
                        
                        return (
                          <div key={scenario.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{asset?.name} - {scenario.threatDescription}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">
                                  L: {LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof LIKELIHOOD_VALUES]?.value}
                                </Badge>
                                <Badge variant="outline">
                                  I: {IMPACT_VALUES[scenario.impact as keyof typeof IMPACT_VALUES]?.value}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={`${risk.color} text-white`}>
                              {risk.level} ({risk.score})
                            </Badge>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-3">Risk Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-sm">
                        {["Very Low", "Low", "Medium", "High", "Critical"].map((level) => {
                          const count = existingScenarios.filter(s => {
                            const risk = calculateRiskLevel(s.likelihood, s.impact);
                            return risk.level === level;
                          }).length;
                          
                          return (
                            <div key={level} className="p-2 border rounded">
                              <p className="font-medium">{level}</p>
                              <p className="text-lg">{count}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3: // Treatment Planning
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Step 4: Risk Treatment Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scenarios.length === 0 ? (
                  <p className="text-muted-foreground">Complete risk analysis first.</p>
                ) : (
                  <div className="space-y-4">
                    {scenarios.map((scenario) => {
                      const risk = calculateRiskLevel(scenario.likelihood, scenario.impact);
                      const asset = extractedAssets.find(a => a.id === scenario.assetId);
                      const existingPlan = treatmentPlans.find(p => p.riskScenarioId === scenario.id);
                      
                      return (
                        <Card key={scenario.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{asset?.name} - {scenario.threatDescription}</p>
                                <Badge className={`${risk.color} text-white mt-1`}>
                                  {risk.level} Risk
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Treatment Strategy</Label>
                              <Select 
                                value={existingPlan?.strategy || ""} 
                                onValueChange={(value) => {
                                  if (existingPlan) {
                                    // Update existing plan
                                    handleUpdateTreatment(existingPlan.id, "strategy", value);
                                  } else {
                                    // Create new plan
                                    const newPlan: InsertTreatmentPlan = {
                                      assessmentId,
                                      riskScenarioId: scenario.id,
                                      risk: scenario.threatDescription || "Unknown Risk",
                                      strategy: value,
                                      description: "",
                                      responsible: "",
                                      deadline: "",
                                      status: "planned"
                                    };
                                    createTreatmentMutation.mutate(newPlan);
                                  }
                                }}
                              >
                                <SelectTrigger data-testid={`select-treatment-${scenario.id}`}>
                                  <SelectValue placeholder="Select treatment strategy" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(TREATMENT_OPTIONS).map(([key, option]) => (
                                    <SelectItem key={key} value={key}>
                                      {option.label} - {option.description}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {existingPlan && (
                              <div className="grid gap-3">
                                <div>
                                  <Label>Action Description</Label>
                                  <Textarea
                                    value={existingPlan.description}
                                    onChange={(e) => handleUpdateTreatment(existingPlan.id, "description", e.target.value)}
                                    placeholder="Describe the specific actions to be taken..."
                                    data-testid={`textarea-action-${scenario.id}`}
                                    rows={2}
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <Label>Responsible Party</Label>
                                    <Input
                                      value={existingPlan.responsible}
                                      onChange={(e) => handleUpdateTreatment(existingPlan.id, "responsible", e.target.value)}
                                      placeholder="Who is responsible?"
                                      data-testid={`input-responsible-${scenario.id}`}
                                    />
                                  </div>
                                  <div>
                                    <Label>Target Deadline</Label>
                                    <Input
                                      type="date"
                                      value={existingPlan.deadline}
                                      onChange={(e) => handleUpdateTreatment(existingPlan.id, "deadline", e.target.value)}
                                      data-testid={`input-deadline-${scenario.id}`}
                                    />
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <Select 
                                      value={existingPlan.status || "planned"} 
                                      onValueChange={(value) => handleUpdateTreatment(existingPlan.id, "status", value)}
                                    >
                                      <SelectTrigger data-testid={`select-status-${scenario.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="planned">Planned</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="on-hold">On Hold</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 4: // Review & Submit
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Step 5: Review & Submit Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Assets Identified</h4>
                    <p className="text-2xl font-bold">{extractedAssets.length}</p>
                    <p className="text-sm text-muted-foreground">Security assets analyzed</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Risk Scenarios</h4>
                    <p className="text-2xl font-bold">{scenarios.length}</p>
                    <p className="text-sm text-muted-foreground">Threat scenarios evaluated</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Treatment Plans</h4>
                    <p className="text-2xl font-bold">{treatmentPlans.length}</p>
                    <p className="text-sm text-muted-foreground">Mitigation strategies defined</p>
                  </div>
                </div>

                <Button 
                  onClick={onComplete}
                  disabled={scenarios.length === 0}
                  size="lg"
                  className="w-full"
                  data-testid="button-complete-assessment"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Enhanced Risk Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (assetsLoading || scenariosLoading || plansLoading) {
    return <div>Loading enhanced risk assessment...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Enhanced Risk Assessment (Six-Step SRA Process)</CardTitle>
            <Badge variant="secondary" data-testid="badge-step-progress">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-2" data-testid="progress-enhanced-assessment" />
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = index < currentStep;
          
          return (
            <Button
              key={step.title}
              variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCurrentStep(index)}
              data-testid={`button-step-${index}`}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <StepIcon className="h-3 w-3" />
              {isCompleted && <CheckCircle className="h-3 w-3" />}
              {step.title}
            </Button>
          );
        })}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button 
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          data-testid="button-previous-step"
        >
          Previous Step
        </Button>
        
        <Button 
          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={currentStep === steps.length - 1}
          data-testid="button-next-step"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}