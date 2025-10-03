import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Download,
  ArrowRight
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentApi, riskAssetApi, riskScenarioApi, vulnerabilityApi, controlApi, treatmentPlanApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RiskAsset, RiskScenario, Vulnerability, Control, TreatmentPlan, InsertRiskScenario, InsertVulnerability, InsertControl, InsertTreatmentPlan } from "@shared/schema";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  calculateResidualRisk as calculateResidualRiskCompound, 
  calculateCurrentRisk as calculateCurrentRiskCompound,
  LIKELIHOOD_VALUES as SHARED_LIKELIHOOD_VALUES, 
  IMPACT_VALUES as SHARED_IMPACT_VALUES,
  calculateRiskLevel as calculateRiskLevelNew
} from '@shared/riskCalculations';

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
  const [localVulnerabilities, setLocalVulnerabilities] = useState<Vulnerability[]>([]);
  const [localControls, setLocalControls] = useState<Control[]>([]);
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
  const [assetDialogOpen, setAssetDialogOpen] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);
  const scenariosEndRef = useRef<HTMLDivElement>(null);
  const previousScenariosCount = useRef(0);
  const editingVulnerabilities = useRef<Set<string>>(new Set());
  const editingControls = useRef<Set<string>>(new Set());

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

  const { data: vulnerabilities = [], isLoading: vulnerabilitiesLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "vulnerabilities"],
    queryFn: () => vulnerabilityApi.getAll(assessmentId),
    enabled: !!assessmentId,
  });

  const { data: controls = [], isLoading: controlsLoading } = useQuery({
    queryKey: ["/api/assessments", assessmentId, "controls"],
    queryFn: () => controlApi.getAll(assessmentId),
    enabled: !!assessmentId,
    refetchOnWindowFocus: false, // Prevent refetch on window focus to avoid interrupting editing
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

  useEffect(() => {
    if (vulnerabilities) {
      setLocalVulnerabilities(prev => {
        const editing = editingVulnerabilities.current;
        return vulnerabilities.map(v => {
          if (editing.has(v.id)) {
            // Keep local version if being edited
            return prev.find(p => p.id === v.id) || v;
          }
          return v;
        });
      });
    }
  }, [vulnerabilities]);

  useEffect(() => {
    if (controls && controls.length > 0) {
      setLocalControls(prev => {
        const editing = editingControls.current;
        const newControls = controls.map(c => {
          if (editing.has(c.id)) {
            // Keep local version if being edited
            const localVersion = prev.find(p => p.id === c.id);
            return localVersion || c;
          }
          return c;
        });
        
        // Only update if there are actual changes
        if (prev.length === 0) return newControls;
        if (prev.length !== newControls.length) return newControls;
        
        // Check if any control has changed
        const hasChanges = newControls.some((newCtrl, idx) => {
          const prevCtrl = prev[idx];
          return !prevCtrl || newCtrl.id !== prevCtrl.id || 
                 (!editing.has(newCtrl.id) && JSON.stringify(newCtrl) !== JSON.stringify(prevCtrl));
        });
        
        return hasChanges ? newControls : prev;
      });
    }
  }, [controls]);

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Auto-scroll to newly created scenario (only on additions, not deletions)
  useEffect(() => {
    if (scenarios.length > previousScenariosCount.current && scenariosEndRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scenariosEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
    previousScenariosCount.current = scenarios.length;
  }, [scenarios.length]);


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

  // Vulnerability mutations
  const createVulnerabilityMutation = useMutation({
    mutationFn: (data: InsertVulnerability) => vulnerabilityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "vulnerabilities"] });
      toast({
        title: "Vulnerability Added",
        description: "Vulnerability has been created successfully.",
      });
    },
  });

  const updateVulnerabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vulnerability> }) => 
      vulnerabilityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "vulnerabilities"] });
    },
  });

  const deleteVulnerabilityMutation = useMutation({
    mutationFn: (id: string) => vulnerabilityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "vulnerabilities"] });
      toast({
        title: "Vulnerability Deleted",
        description: "Vulnerability has been removed.",
      });
    },
  });

  // Control mutations
  const createControlMutation = useMutation({
    mutationFn: (data: InsertControl) => controlApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "controls"] });
      toast({
        title: "Control Added",
        description: "Control has been created successfully.",
      });
    },
  });

  const updateControlMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Control> }) => 
      controlApi.update(id, data),
    onSuccess: () => {
      // Don't invalidate query during editing to prevent focus loss
      // The local state is already updated optimistically
    },
  });

  const deleteControlMutation = useMutation({
    mutationFn: (id: string) => controlApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "controls"] });
      toast({
        title: "Control Deleted",
        description: "Control has been removed.",
      });
    },
  });

  const steps = [
    { title: "Asset Identification", icon: Target },
    { title: "Risk Scenarios", icon: AlertTriangle },
    { title: "Vulnerabilities & Controls", icon: Shield },
    { title: "Prioritize Risks", icon: Activity },
    { title: "Treatment Planning", icon: Settings },
    { title: "Executive Summary", icon: Activity },
    { title: "Review & Submit", icon: CheckCircle }
  ];


  const handleSaveAndAddAnother = () => {
    if (!newAsset.name.trim() || !newAsset.type.trim()) {
      toast({
        title: "Invalid Asset",
        description: "Please provide asset name and type.",
        variant: "destructive",
      });
      return;
    }
    createAssetMutation.mutate(newAsset, {
      onSuccess: () => {
        // Clear form for next asset
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
          title: "Asset Saved",
          description: "Asset added. Add another or click 'Finish' to complete.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
      },
      onError: (error: any) => {
        toast({
          title: "Error Adding Asset",
          description: error.message || "Failed to add asset. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleSaveAndFinish = () => {
    if (!newAsset.name.trim() || !newAsset.type.trim()) {
      toast({
        title: "Invalid Asset",
        description: "Please provide asset name and type.",
        variant: "destructive",
      });
      return;
    }
    createAssetMutation.mutate(newAsset, {
      onSuccess: () => {
        // Clear form and show completion message
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
          title: "Asset Saved",
          description: "Moving to next step...",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
        // Auto-advance to next step
        setCurrentStep(1);
      },
      onError: (error: any) => {
        toast({
          title: "Error Adding Asset",
          description: error.message || "Failed to add asset. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleAddScenario = () => {
    const newScenario: InsertRiskScenario = {
      assessmentId,
      assetId: assets[0]?.id || "",
      scenario: "New Risk Scenario",
      asset: assets[0]?.name || "Unknown Asset",
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
  const debouncedTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({});
  
  const handleUpdateScenarioDebounced = useCallback((id: string, field: string, value: any) => {
    // Clear existing timeout for this field
    const key = `${id}-${field}`;
    if (debouncedTimeouts.current[key]) {
      clearTimeout(debouncedTimeouts.current[key]);
    }
    
    // Update local state immediately for responsive UI
    setScenarios(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      handleUpdateScenario(id, field, value);
      delete debouncedTimeouts.current[key];
    }, 800); // Increased delay for better stability
    
    debouncedTimeouts.current[key] = timeoutId;
  }, []);

  const handleUpdateVulnerabilityDebounced = useCallback((id: string, value: string) => {
    const key = `vuln-${id}`;
    if (debouncedTimeouts.current[key]) {
      clearTimeout(debouncedTimeouts.current[key]);
    }
    
    // Mark as being edited
    editingVulnerabilities.current.add(id);
    
    // Update local state immediately
    setLocalVulnerabilities(prev => prev.map(v => 
      v.id === id ? { ...v, description: value } : v
    ));
    
    // Debounce API call
    const timeoutId = setTimeout(() => {
      updateVulnerabilityMutation.mutate({ id, data: { description: value } }, {
        onSuccess: () => {
          // Remove from editing set after successful mutation
          editingVulnerabilities.current.delete(id);
        },
        onError: () => {
          // Remove from editing set on error too
          editingVulnerabilities.current.delete(id);
        }
      });
      delete debouncedTimeouts.current[key];
    }, 500);
    
    debouncedTimeouts.current[key] = timeoutId;
  }, [updateVulnerabilityMutation]);

  const handleUpdateControlDebounced = useCallback((id: string, value: string) => {
    const key = `control-${id}`;
    if (debouncedTimeouts.current[key]) {
      clearTimeout(debouncedTimeouts.current[key]);
    }
    
    // Mark as being edited
    editingControls.current.add(id);
    
    // Update local state immediately
    setLocalControls(prev => prev.map(c => 
      c.id === id ? { ...c, description: value } : c
    ));
    
    // Debounce API call
    const timeoutId = setTimeout(() => {
      updateControlMutation.mutate({ id, data: { description: value } }, {
        onSuccess: () => {
          // Remove from editing set after successful mutation
          editingControls.current.delete(id);
        },
        onError: () => {
          // Remove from editing set on error too
          editingControls.current.delete(id);
        }
      });
      delete debouncedTimeouts.current[key];
    }, 500);
    
    debouncedTimeouts.current[key] = timeoutId;
  }, [updateControlMutation]);

  const handleUpdateControlField = useCallback((id: string, field: string, value: any) => {
    const key = `control-${id}-${field}`;
    if (debouncedTimeouts.current[key]) {
      clearTimeout(debouncedTimeouts.current[key]);
    }
    
    // Mark as being edited
    editingControls.current.add(id);
    
    // Update local state immediately
    setLocalControls(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
    
    // Debounce API call
    const timeoutId = setTimeout(() => {
      updateControlMutation.mutate({ id, data: { [field]: value } }, {
        onSuccess: () => {
          // Remove from editing set after successful mutation
          editingControls.current.delete(id);
        },
        onError: () => {
          // Remove from editing set on error too
          editingControls.current.delete(id);
        }
      });
      delete debouncedTimeouts.current[key];
    }, 500);
    
    debouncedTimeouts.current[key] = timeoutId;
  }, [updateControlMutation]);

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

                {assets.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium">Assets to Protect ({assets.length} total)</h4>
                    <div className="grid gap-2">
                      {assets.map((asset) => (
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
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSaveAndAddAnother}
                        disabled={createAssetMutation.isPending}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-save-and-add-another"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Save & Add Another
                      </Button>
                      <Button 
                        onClick={handleSaveAndFinish}
                        disabled={createAssetMutation.isPending}
                        className="flex-1"
                        data-testid="button-save-and-finish"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save & Finish
                      </Button>
                    </div>
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
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Step 2: Risk Scenario Development
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create at least one risk scenario for each of your identified assets
                    </p>
                  </div>
                  <Button 
                    onClick={handleAddScenario}
                    disabled={assets.length === 0}
                    data-testid="button-add-scenario"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Scenario
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {assets.length === 0 ? (
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
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium">Affected Asset</Label>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Click to select which asset is at risk in this scenario
                                  </p>
                                  <Dialog 
                                    open={assetDialogOpen === scenario.id} 
                                    onOpenChange={(open) => setAssetDialogOpen(open ? scenario.id : null)}
                                  >
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        data-testid={`select-asset-${scenario.id}`}
                                      >
                                        {scenario.assetId 
                                          ? `${assets.find(a => a.id === scenario.assetId)?.name || 'Unknown'} (${assets.find(a => a.id === scenario.assetId)?.type || ''})` 
                                          : "Select affected asset"}
                                      </Button>
                                    </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[600px]">
                                    <DialogHeader>
                                      <DialogTitle>Select Affected Asset ({assets.length} available)</DialogTitle>
                                      <DialogDescription>
                                        Choose the asset that is affected by this risk scenario
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                                      {assets.map((asset) => (
                                        <Card 
                                          key={asset.id}
                                          className={`cursor-pointer hover-elevate transition-all ${
                                            scenario.assetId === asset.id ? 'ring-2 ring-primary' : ''
                                          }`}
                                          onClick={() => {
                                            handleUpdateScenario(scenario.id, "assetId", asset.id);
                                            setAssetDialogOpen(null);
                                          }}
                                        >
                                          <CardHeader className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1">
                                                <h4 className="font-semibold text-sm mb-1">{asset.name}</h4>
                                                <div className="flex flex-wrap gap-1">
                                                  <Badge variant="outline" className="text-xs">
                                                    {asset.type}
                                                  </Badge>
                                                  <Badge 
                                                    variant="outline" 
                                                    className={`text-xs ${
                                                      asset.criticality >= 4 ? 'bg-red-500 text-white' :
                                                      asset.criticality === 3 ? 'bg-yellow-500 text-white' :
                                                      'bg-green-500 text-white'
                                                    }`}
                                                  >
                                                    Criticality: {asset.criticality}
                                                  </Badge>
                                                </div>
                                                {asset.scope && (
                                                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                    {asset.scope}
                                                  </p>
                                                )}
                                              </div>
                                              {scenario.assetId === asset.id && (
                                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                              )}
                                            </div>
                                          </CardHeader>
                                        </Card>
                                      ))}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                </div>
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
                              <Label>Threat Description</Label>
                              <Textarea
                                value={scenario.vulnerabilityDescription || ""}
                                onChange={(e) => handleUpdateScenarioDebounced(scenario.id, "vulnerabilityDescription", e.target.value)}
                                placeholder="Describe what makes this threat scenario possible and its potential impact..."
                                data-testid={`textarea-threat-description-${scenario.id}`}
                                rows={2}
                                spellCheck={false}
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
                    <div ref={scenariosEndRef} />
                  </div>
                )}
                
                {scenarios.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                    <Button 
                      onClick={handleAddScenario}
                      disabled={assets.length === 0}
                      variant="outline"
                      className="flex-1"
                      data-testid="button-add-scenario-bottom"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Scenario
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                      data-testid="button-continue-to-analysis"
                    >
                      Continue to Risk Analysis
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 2: // Vulnerabilities & Controls
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Step 3: Vulnerabilities & Controls
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Identify vulnerabilities for each risk scenario and document EXISTING controls currently in place.
                  Rate control effectiveness (1-5) to calculate current risk levels. Proposed controls will be added later after risk prioritization.
                </p>
              </CardHeader>
              <CardContent>
                {scenarios.length === 0 ? (
                  <p className="text-muted-foreground">Complete risk scenario development first.</p>
                ) : (
                  <div className="space-y-6">
                    {scenarios.map((scenario) => {
                      const inherentRisk = calculateRiskLevel(scenario.likelihood, scenario.impact);
                      const asset = extractedAssets.find(a => a.id === scenario.assetId);
                      const scenarioVulnerabilities = localVulnerabilities.filter(v => 
                        v.description && v.description.includes(scenario.id)
                      );
                      
                      return (
                        <Card key={scenario.id} className="border-l-4" style={{ borderLeftColor: inherentRisk.color.replace('bg-', '') }}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">{asset?.name}</Badge>
                                  <Badge className={`${inherentRisk.color} text-white`}>
                                    Inherent Risk: {inherentRisk.level} ({inherentRisk.score})
                                  </Badge>
                                </div>
                                <p className="font-medium text-sm">{scenario.threatDescription}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>Likelihood: {LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof LIKELIHOOD_VALUES]?.label}</span>
                                  <span>Impact: {IMPACT_VALUES[scenario.impact as keyof typeof IMPACT_VALUES]?.label}</span>
                                </div>
                              </div>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  createVulnerabilityMutation.mutate({
                                    assessmentId,
                                    description: `[Scenario:${scenario.id}] `,
                                    notes: null
                                  });
                                }}
                                data-testid={`button-add-vulnerability-${scenario.id}`}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Vulnerability
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {scenarioVulnerabilities.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No vulnerabilities identified yet. Click "Add Vulnerability" to begin.</p>
                            ) : (
                              <div className="space-y-3">
                                {scenarioVulnerabilities.map((vulnerability) => {
                                  const vulnControls = localControls.filter(c => c.vulnerabilityId === vulnerability.id && c.controlType === 'existing');
                                  const localVuln = localVulnerabilities.find(v => v.id === vulnerability.id) || vulnerability;
                                  
                                  return (
                                    <Card key={vulnerability.id} className="bg-muted/30">
                                      <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start gap-2">
                                          <Badge variant="secondary" className="mt-0.5">Vulnerability</Badge>
                                          <Input
                                            value={localVuln.description?.replace(`[Scenario:${scenario.id}] `, '') || ''}
                                            onChange={(e) => {
                                              handleUpdateVulnerabilityDebounced(vulnerability.id, `[Scenario:${scenario.id}] ${e.target.value}`);
                                            }}
                                            placeholder="Describe the vulnerability..."
                                            className="flex-1"
                                            data-testid={`input-vulnerability-${vulnerability.id}`}
                                          />
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => deleteVulnerabilityMutation.mutate(vulnerability.id)}
                                            data-testid={`button-delete-vulnerability-${vulnerability.id}`}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        
                                        <div className="ml-6 space-y-2">
                                          {vulnControls.map((control) => {
                                            const localControl = localControls.find(c => c.id === control.id) || control;
                                            
                                            return (
                                              <div key={control.id} className="flex items-center gap-2">
                                                <Badge variant="outline" className="shrink-0">
                                                  {control.controlType === 'existing' ? 'Existing' : 'Proposed'}
                                                </Badge>
                                                <Input
                                                  value={localControl.description || ''}
                                                  onChange={(e) => {
                                                    handleUpdateControlDebounced(control.id, e.target.value);
                                                  }}
                                                  placeholder="Describe the existing control..."
                                                  className="flex-1"
                                                  data-testid={`input-control-${control.id}`}
                                                />
                                              {control.controlType === 'existing' && (
                                                <Select
                                                  value={control.effectiveness?.toString() || ''}
                                                  onValueChange={(value) => {
                                                    updateControlMutation.mutate({
                                                      id: control.id,
                                                      data: { effectiveness: parseInt(value) }
                                                    });
                                                  }}
                                                >
                                                  <SelectTrigger className="w-32" data-testid={`select-effectiveness-${control.id}`}>
                                                    <SelectValue placeholder="Rate" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="1">1 - Poor</SelectItem>
                                                    <SelectItem value="2">2 - Fair</SelectItem>
                                                    <SelectItem value="3">3 - Good</SelectItem>
                                                    <SelectItem value="4">4 - Very Good</SelectItem>
                                                    <SelectItem value="5">5 - Excellent</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              )}
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => deleteControlMutation.mutate(control.id)}
                                                data-testid={`button-delete-control-${control.id}`}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            );
                                          })}
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => {
                                                createControlMutation.mutate({
                                                  assessmentId,
                                                  vulnerabilityId: vulnerability.id,
                                                  riskScenarioId: scenario.id,
                                                  controlType: 'existing',
                                                  description: '',
                                                  effectiveness: null,
                                                  notes: null
                                                });
                                              }}
                                              data-testid={`button-add-existing-control-${vulnerability.id}`}
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Existing Control
                                            </Button>
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
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3: // Prioritize Risks - Decision Table
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Step 4: Prioritize Risks
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Review risk calculations and make decisions for each scenario
                </p>
              </CardHeader>
              <CardContent>
                {existingScenarios.length === 0 ? (
                  <p className="text-muted-foreground">Complete risk scenarios and vulnerabilities & controls first.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Decision Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">Risk Scenario</th>
                            <th className="text-center p-3 font-medium w-32">Inherent Risk</th>
                            <th className="text-center p-3 font-medium w-32">Current Risk</th>
                            <th className="text-center p-3 font-medium w-24">Change</th>
                            <th className="text-center p-3 font-medium w-40">Decision</th>
                          </tr>
                        </thead>
                        <tbody>
                          {existingScenarios.map((scenario) => {
                            const asset = extractedAssets.find(a => a.id === scenario.assetId);
                            const inherentRisk = calculateRiskLevel(scenario.likelihood, scenario.impact);
                            
                            const inherentL = LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof LIKELIHOOD_VALUES].value;
                            const inherentI = IMPACT_VALUES[scenario.impact as keyof typeof IMPACT_VALUES].value;
                            const scenarioControls = controls.filter(c => c.riskScenarioId === scenario.id);
                            const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
                            
                            const currentRiskCalc = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
                            const currentRiskLikelihoodKey = Object.keys(LIKELIHOOD_VALUES).find(
                              k => LIKELIHOOD_VALUES[k as keyof typeof LIKELIHOOD_VALUES].value === currentRiskCalc.currentLikelihood
                            ) || scenario.likelihood;
                            const currentRiskImpactKey = Object.keys(IMPACT_VALUES).find(
                              k => IMPACT_VALUES[k as keyof typeof IMPACT_VALUES].value === currentRiskCalc.currentImpact
                            ) || scenario.impact;
                            const currentRisk = calculateRiskLevel(currentRiskLikelihoodKey, currentRiskImpactKey);
                            
                            const reductionPercentage = currentRiskCalc.likelihoodReduction;
                            const riskChange = inherentRisk.score - currentRisk.score;
                            
                            return (
                              <tr key={scenario.id} className="border-t hover-elevate" data-testid={`row-risk-scenario-${scenario.id}`}>
                                <td className="p-3">
                                  <div className="font-medium">{asset?.name}</div>
                                  <div className="text-sm text-muted-foreground">{scenario.threatDescription}</div>
                                </td>
                                <td className="text-center p-3">
                                  <Badge className={`${inherentRisk.color} text-white`} data-testid={`badge-inherent-risk-${scenario.id}`}>
                                    {inherentRisk.level} ({inherentRisk.score})
                                  </Badge>
                                </td>
                                <td className="text-center p-3">
                                  <Badge className={`${currentRisk.color} text-white`} data-testid={`badge-current-risk-${scenario.id}`}>
                                    {currentRisk.level} ({currentRisk.score})
                                  </Badge>
                                  {reductionPercentage > 0 && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {reductionPercentage.toFixed(1)}% reduction
                                    </div>
                                  )}
                                </td>
                                <td className="text-center p-3">
                                  {riskChange > 0 ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200" data-testid={`badge-change-${scenario.id}`}>
                                      ↓ {riskChange}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground" data-testid={`badge-change-${scenario.id}`}>
                                      —
                                    </Badge>
                                  )}
                                </td>
                                <td className="text-center p-3">
                                  <Select
                                    value={scenario.decision || "undecided"}
                                    onValueChange={(value) => {
                                      updateScenarioMutation.mutate({
                                        id: scenario.id,
                                        data: { decision: value }
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="w-full" data-testid={`select-decision-${scenario.id}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="undecided" data-testid="option-undecided">
                                        Undecided
                                      </SelectItem>
                                      <SelectItem value="accept" data-testid="option-accept">
                                        Accept
                                      </SelectItem>
                                      <SelectItem value="transfer" data-testid="option-transfer">
                                        Transfer
                                      </SelectItem>
                                      <SelectItem value="remediate" data-testid="option-remediate">
                                        Remediate
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Scenarios</p>
                            <p className="text-3xl font-bold mt-1" data-testid="text-total-scenarios">{existingScenarios.length}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Decisions Made</p>
                            <p className="text-3xl font-bold mt-1" data-testid="text-decisions-made">
                              {existingScenarios.filter(s => s.decision && s.decision !== 'undecided').length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Require Treatment</p>
                            <p className="text-3xl font-bold mt-1" data-testid="text-require-treatment">
                              {existingScenarios.filter(s => s.decision === 'remediate').length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 4: // Treatment Planning
        const remediateScenarios = existingScenarios.filter(s => s.decision === 'remediate');
        
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Step 5: Risk Treatment Planning
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Add proposed controls and define treatment plans for scenarios marked for remediation. Proposed controls help visualize future risk reduction.
                </p>
              </CardHeader>
              <CardContent>
                {remediateScenarios.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No scenarios marked for remediation.</p>
                    <p className="text-sm text-muted-foreground mt-2">Go to Step 4 to select scenarios that require treatment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {remediateScenarios.map((scenario) => {
                      const asset = extractedAssets.find(a => a.id === scenario.assetId);
                      const inherentRisk = calculateRiskLevel(scenario.likelihood, scenario.impact);
                      const inherentLikelihood = LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof LIKELIHOOD_VALUES]?.value || 3;
                      const inherentImpact = IMPACT_VALUES[scenario.impact as keyof typeof IMPACT_VALUES]?.value || 3;
                      
                      const scenarioExistingControls = localControls.filter(
                        c => c.riskScenarioId === scenario.id && c.controlType === 'existing'
                      );
                      const scenarioProposedControls = localControls.filter(
                        c => c.riskScenarioId === scenario.id && c.controlType === 'proposed'
                      );
                      
                      const currentRiskCalc = calculateCurrentRiskCompound(
                        inherentLikelihood,
                        inherentImpact,
                        scenarioExistingControls
                      );
                      
                      const residualRiskCalc = calculateResidualRiskCompound(
                        currentRiskCalc.currentLikelihoodFloat,
                        currentRiskCalc.currentImpactFloat,
                        scenarioProposedControls
                      );
                      
                      const currentRiskLikelihoodKey = Object.keys(LIKELIHOOD_VALUES).find(
                        k => LIKELIHOOD_VALUES[k as keyof typeof LIKELIHOOD_VALUES].value === currentRiskCalc.currentLikelihood
                      ) || scenario.likelihood;
                      const currentRiskImpactKey = Object.keys(IMPACT_VALUES).find(
                        k => IMPACT_VALUES[k as keyof typeof IMPACT_VALUES].value === currentRiskCalc.currentImpact
                      ) || scenario.impact;
                      const currentRisk = calculateRiskLevel(currentRiskLikelihoodKey, currentRiskImpactKey);
                      
                      const residualRiskLikelihoodKey = Object.keys(LIKELIHOOD_VALUES).find(
                        k => LIKELIHOOD_VALUES[k as keyof typeof LIKELIHOOD_VALUES].value === residualRiskCalc.residualLikelihood
                      ) || currentRiskLikelihoodKey;
                      const residualRiskImpactKey = Object.keys(IMPACT_VALUES).find(
                        k => IMPACT_VALUES[k as keyof typeof IMPACT_VALUES].value === residualRiskCalc.residualImpact
                      ) || currentRiskImpactKey;
                      const residualRisk = calculateRiskLevel(residualRiskLikelihoodKey, residualRiskImpactKey);
                      
                      return (
                        <Card key={scenario.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{asset?.name}</p>
                                <p className="text-sm text-muted-foreground">{scenario.threatDescription}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={`${inherentRisk.color} text-white`}>
                                    Inherent: {inherentRisk.level}
                                  </Badge>
                                  <span className="text-muted-foreground">→</span>
                                  <Badge className={`${currentRisk.color} text-white`}>
                                    Current: {currentRisk.level}
                                  </Badge>
                                  <span className="text-muted-foreground">→</span>
                                  <Badge className={`${residualRisk.color} text-white`} data-testid={`badge-residual-risk-${scenario.id}`}>
                                    Residual: {residualRisk.level}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Proposed Controls</Label>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    createControlMutation.mutate({
                                      assessmentId,
                                      vulnerabilityId: null,
                                      riskScenarioId: scenario.id,
                                      controlType: 'proposed',
                                      description: '',
                                      effectiveness: null,
                                      notes: null,
                                      treatmentType: 'physical',
                                      primaryEffect: 'reduce_likelihood',
                                      treatmentEffectiveness: 3,
                                      actionDescription: '',
                                      responsibleParty: '',
                                      targetDate: '',
                                      estimatedCost: ''
                                    });
                                  }}
                                  data-testid={`button-add-proposed-control-${scenario.id}`}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Proposed Control
                                </Button>
                              </div>
                              
                              {(() => {
                                const scenarioProposedControls = localControls.filter(
                                  c => c.riskScenarioId === scenario.id && c.controlType === 'proposed'
                                );
                                
                                return scenarioProposedControls.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No proposed controls yet. Add controls to reduce risk.</p>
                                ) : (
                                  <div className="space-y-4">
                                    {scenarioProposedControls.map((control) => {
                                      const localControl = localControls.find(c => c.id === control.id) || control;
                                      
                                      return (
                                        <Card key={control.id}>
                                          <CardContent className="pt-4 space-y-4">
                                            <div className="flex items-start gap-2">
                                              <Badge variant="outline" className="shrink-0 mt-2">Proposed</Badge>
                                              <Input
                                                value={localControl.description || ''}
                                                onChange={(e) => {
                                                  handleUpdateControlDebounced(control.id, e.target.value);
                                                }}
                                                placeholder="Control description (e.g., 'Install security cameras')"
                                                className="flex-1"
                                                data-testid={`input-proposed-control-${control.id}`}
                                              />
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => deleteControlMutation.mutate(control.id)}
                                                data-testid={`button-delete-proposed-control-${control.id}`}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                              <div>
                                                <Label>Treatment Type</Label>
                                                <Select 
                                                  value={localControl.treatmentType || "physical"} 
                                                  onValueChange={(value) => {
                                                    handleUpdateControlField(control.id, "treatmentType", value);
                                                  }}
                                                >
                                                  <SelectTrigger data-testid={`select-treatment-type-${control.id}`}>
                                                    <SelectValue placeholder="Select type" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="people">People</SelectItem>
                                                    <SelectItem value="process">Process</SelectItem>
                                                    <SelectItem value="technology">Technology</SelectItem>
                                                    <SelectItem value="physical">Physical</SelectItem>
                                                    <SelectItem value="policy">Policy</SelectItem>
                                                    <SelectItem value="training">Training</SelectItem>
                                                    <SelectItem value="vendor">Vendor/Third Party</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div>
                                                <Label>Primary Effect</Label>
                                                <Select 
                                                  value={localControl.primaryEffect || "reduce_likelihood"} 
                                                  onValueChange={(value) => {
                                                    handleUpdateControlField(control.id, "primaryEffect", value);
                                                  }}
                                                >
                                                  <SelectTrigger data-testid={`select-primary-effect-${control.id}`}>
                                                    <SelectValue placeholder="Select effect" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="reduce_likelihood">Reduce Likelihood</SelectItem>
                                                    <SelectItem value="reduce_impact">Reduce Impact</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div>
                                                <Label>Treatment Effectiveness</Label>
                                                <div className="flex items-center gap-3">
                                                  <Slider
                                                    value={[localControl.treatmentEffectiveness || 3]}
                                                    onValueChange={(value) => {
                                                      handleUpdateControlField(control.id, "treatmentEffectiveness", value[0]);
                                                    }}
                                                    min={1}
                                                    max={5}
                                                    step={1}
                                                    className="flex-1"
                                                    data-testid={`slider-effectiveness-${control.id}`}
                                                  />
                                                  <span className="text-sm font-medium w-8">{localControl.treatmentEffectiveness || 3}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  {localControl.treatmentEffectiveness === 1 && "Minimal (10% reduction)"}
                                                  {localControl.treatmentEffectiveness === 2 && "Slight (20% reduction)"}
                                                  {localControl.treatmentEffectiveness === 3 && "Moderate (30% reduction)"}
                                                  {localControl.treatmentEffectiveness === 4 && "Significant (40% reduction)"}
                                                  {localControl.treatmentEffectiveness === 5 && "Maximum (50% reduction)"}
                                                  {!localControl.treatmentEffectiveness && "Moderate (30% reduction)"}
                                                </p>
                                              </div>
                                            </div>

                                            <div>
                                              <Label>Action Description</Label>
                                              <Textarea
                                                value={localControl.actionDescription || ''}
                                                onChange={(e) => {
                                                  handleUpdateControlField(control.id, "actionDescription", e.target.value);
                                                }}
                                                placeholder="Describe the specific actions to implement this control..."
                                                data-testid={`textarea-action-description-${control.id}`}
                                                rows={2}
                                              />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                              <div>
                                                <Label>Responsible Party</Label>
                                                <Input
                                                  value={localControl.responsibleParty || ''}
                                                  onChange={(e) => {
                                                    handleUpdateControlField(control.id, "responsibleParty", e.target.value);
                                                  }}
                                                  placeholder="Who is responsible?"
                                                  data-testid={`input-responsible-${control.id}`}
                                                />
                                              </div>
                                              <div>
                                                <Label>Target Date</Label>
                                                <Input
                                                  type="date"
                                                  value={localControl.targetDate || ''}
                                                  onChange={(e) => {
                                                    handleUpdateControlField(control.id, "targetDate", e.target.value);
                                                  }}
                                                  data-testid={`input-target-date-${control.id}`}
                                                />
                                              </div>
                                              <div>
                                                <Label>Estimated Cost</Label>
                                                <Input
                                                  value={localControl.estimatedCost || ''}
                                                  onChange={(e) => {
                                                    handleUpdateControlField(control.id, "estimatedCost", e.target.value);
                                                  }}
                                                  placeholder="e.g., $5,000"
                                                  data-testid={`input-estimated-cost-${control.id}`}
                                                />
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
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

      case 5: // Executive Summary
        const acceptScenarios = existingScenarios.filter(s => s.decision === 'accept');
        const transferScenarios = existingScenarios.filter(s => s.decision === 'transfer');
        const remediateWithPlans = existingScenarios.filter(s => s.decision === 'remediate');
        
        const inherentCritical = existingScenarios.filter(s => calculateRiskLevel(s.likelihood, s.impact).level === 'Critical').length;
        const inherentHigh = existingScenarios.filter(s => calculateRiskLevel(s.likelihood, s.impact).level === 'High').length;
        const inherentMedium = existingScenarios.filter(s => calculateRiskLevel(s.likelihood, s.impact).level === 'Medium').length;
        const inherentLow = existingScenarios.filter(s => calculateRiskLevel(s.likelihood, s.impact).level === 'Low').length;
        const inherentVeryLow = existingScenarios.filter(s => calculateRiskLevel(s.likelihood, s.impact).level === 'Very Low').length;
        
        const currentCritical = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const { currentRiskLevel } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          return currentRiskLevel === 'Critical';
        }).length;
        const currentHigh = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const { currentRiskLevel } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          return currentRiskLevel === 'High';
        }).length;
        const currentMedium = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const { currentRiskLevel } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          return currentRiskLevel === 'Medium';
        }).length;
        const currentLow = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const { currentRiskLevel } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          return currentRiskLevel === 'Low';
        }).length;
        const currentVeryLow = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const { currentRiskLevel } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          return currentRiskLevel === 'Very Low';
        }).length;
        
        const residualCritical = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const proposedControls = scenarioControls.filter(c => c.controlType === 'proposed');
          const { currentLikelihoodFloat, currentImpactFloat } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          const { residualRiskLevel } = calculateResidualRiskCompound(currentLikelihoodFloat, currentImpactFloat, proposedControls);
          return residualRiskLevel === 'Critical';
        }).length;
        const residualHigh = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const proposedControls = scenarioControls.filter(c => c.controlType === 'proposed');
          const { currentLikelihoodFloat, currentImpactFloat } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          const { residualRiskLevel } = calculateResidualRiskCompound(currentLikelihoodFloat, currentImpactFloat, proposedControls);
          return residualRiskLevel === 'High';
        }).length;
        const residualMedium = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const proposedControls = scenarioControls.filter(c => c.controlType === 'proposed');
          const { currentLikelihoodFloat, currentImpactFloat } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          const { residualRiskLevel } = calculateResidualRiskCompound(currentLikelihoodFloat, currentImpactFloat, proposedControls);
          return residualRiskLevel === 'Medium';
        }).length;
        const residualLow = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const proposedControls = scenarioControls.filter(c => c.controlType === 'proposed');
          const { currentLikelihoodFloat, currentImpactFloat } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          const { residualRiskLevel } = calculateResidualRiskCompound(currentLikelihoodFloat, currentImpactFloat, proposedControls);
          return residualRiskLevel === 'Low';
        }).length;
        const residualVeryLow = existingScenarios.filter(s => {
          const inherentL = SHARED_LIKELIHOOD_VALUES[s.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
          const inherentI = SHARED_IMPACT_VALUES[s.impact as keyof typeof SHARED_IMPACT_VALUES].value;
          const scenarioControls = controls.filter(c => c.riskScenarioId === s.id);
          const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
          const proposedControls = scenarioControls.filter(c => c.controlType === 'proposed');
          const { currentLikelihoodFloat, currentImpactFloat } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
          const { residualRiskLevel } = calculateResidualRiskCompound(currentLikelihoodFloat, currentImpactFloat, proposedControls);
          return residualRiskLevel === 'Very Low';
        }).length;
        
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Step 6: Executive Summary
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Comprehensive overview of risk assessment findings
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Scenarios</p>
                        <p className="text-3xl font-bold mt-1" data-testid="text-summary-total-scenarios">{existingScenarios.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Accepted</p>
                        <p className="text-3xl font-bold mt-1 text-gray-600" data-testid="text-summary-accepted">{acceptScenarios.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Transferred</p>
                        <p className="text-3xl font-bold mt-1 text-purple-600" data-testid="text-summary-transferred">{transferScenarios.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Remediated</p>
                        <p className="text-3xl font-bold mt-1 text-green-600" data-testid="text-summary-remediated">{remediateWithPlans.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Decision Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Decision Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Accept', value: acceptScenarios.length, color: '#6b7280' },
                              { name: 'Transfer', value: transferScenarios.length, color: '#9333ea' },
                              { name: 'Remediate', value: remediateWithPlans.length, color: '#16a34a' },
                              { name: 'Undecided', value: existingScenarios.filter(s => !s.decision || s.decision === 'undecided').length, color: '#d1d5db' }
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Accept', value: acceptScenarios.length, color: '#6b7280' },
                              { name: 'Transfer', value: transferScenarios.length, color: '#9333ea' },
                              { name: 'Remediate', value: remediateWithPlans.length, color: '#16a34a' },
                              { name: 'Undecided', value: existingScenarios.filter(s => !s.decision || s.decision === 'undecided').length, color: '#d1d5db' }
                            ].filter(item => item.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Risk Progression Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Individual Risk Progression</CardTitle>
                      <p className="text-sm text-muted-foreground">Each row shows one risk scenario's journey: Inherent → Current → Residual</p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={Math.max(350, existingScenarios.length * 60)}>
                        <BarChart
                          data={existingScenarios.map((scenario) => {
                            const asset = extractedAssets.find(a => a.id === scenario.assetId);
                            const inherentRisk = calculateRiskLevel(scenario.likelihood, scenario.impact);
                            
                            const inherentL = SHARED_LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
                            const inherentI = SHARED_IMPACT_VALUES[scenario.impact as keyof typeof SHARED_IMPACT_VALUES].value;
                            const scenarioControls = controls.filter(c => c.riskScenarioId === scenario.id);
                            const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
                            const proposedControls = scenarioControls.filter(c => c.controlType === 'proposed');
                            
                            const { currentLikelihoodFloat, currentImpactFloat } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
                            const { residualLikelihood, residualImpact } = calculateResidualRiskCompound(currentLikelihoodFloat, currentImpactFloat, proposedControls);
                            
                            return {
                              name: `${asset?.name || 'Unknown'}: ${scenario.threatDescription.substring(0, 35)}...`,
                              Inherent: inherentRisk.score,
                              Current: Math.round(currentLikelihoodFloat * currentImpactFloat * 10) / 10,
                              Residual: Math.round(residualLikelihood * residualImpact * 10) / 10,
                            };
                          }).sort((a, b) => b.Inherent - a.Inherent)}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 160, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 25]} label={{ value: 'Risk Score', position: 'insideBottom', offset: -5 }} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={150}
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`Risk Score: ${value}`, '']}
                            labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
                          />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="Inherent" fill="#ef4444" name="Inherent" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="Current" fill="#f59e0b" name="Current" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="Residual" fill="#22c55e" name="Residual" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Register */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Register</CardTitle>
                    <p className="text-sm text-muted-foreground">Complete risk progression for all scenarios</p>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">Scenario</th>
                            <th className="text-center p-3 font-medium w-28">Inherent</th>
                            <th className="text-center p-3 font-medium w-28">Current</th>
                            <th className="text-center p-3 font-medium w-28">Residual</th>
                            <th className="text-center p-3 font-medium w-28">Decision</th>
                          </tr>
                        </thead>
                        <tbody>
                          {existingScenarios.map((scenario) => {
                            const asset = extractedAssets.find(a => a.id === scenario.assetId);
                            const inherentRisk = calculateRiskLevel(scenario.likelihood, scenario.impact);
                            
                            const inherentL = SHARED_LIKELIHOOD_VALUES[scenario.likelihood as keyof typeof SHARED_LIKELIHOOD_VALUES].value;
                            const inherentI = SHARED_IMPACT_VALUES[scenario.impact as keyof typeof SHARED_IMPACT_VALUES].value;
                            const scenarioControls = controls.filter(c => c.riskScenarioId === scenario.id);
                            const existingControls = scenarioControls.filter(c => c.controlType === 'existing');
                            const proposedControls = scenarioControls.filter(c => c.controlType === 'proposed');
                            
                            const { currentRiskLevel, currentLikelihoodFloat, currentImpactFloat } = calculateCurrentRiskCompound(inherentL, inherentI, existingControls);
                            const { residualRiskLevel } = calculateResidualRiskCompound(currentLikelihoodFloat, currentImpactFloat, proposedControls);
                            
                            const getRiskColor = (level: string) => {
                              if (level === 'Critical') return 'bg-red-600';
                              if (level === 'High') return 'bg-red-500';
                              if (level === 'Medium') return 'bg-yellow-500';
                              if (level === 'Low') return 'bg-green-500';
                              return 'bg-gray-500';
                            };
                            
                            return (
                              <tr key={scenario.id} className="border-t" data-testid={`row-register-${scenario.id}`}>
                                <td className="p-3">
                                  <div className="font-medium">{asset?.name}</div>
                                  <div className="text-muted-foreground text-xs">{scenario.threatDescription}</div>
                                </td>
                                <td className="text-center p-3">
                                  <Badge className={`${inherentRisk.color} text-white text-xs`}>
                                    {inherentRisk.level}
                                  </Badge>
                                </td>
                                <td className="text-center p-3">
                                  <Badge className={`${getRiskColor(currentRiskLevel)} text-white text-xs`}>
                                    {currentRiskLevel}
                                  </Badge>
                                </td>
                                <td className="text-center p-3">
                                  <Badge className={`${getRiskColor(residualRiskLevel)} text-white text-xs`}>
                                    {residualRiskLevel}
                                  </Badge>
                                </td>
                                <td className="text-center p-3">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {scenario.decision || 'undecided'}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        );

      case 6: // Review & Submit
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Step 7: Review & Submit Assessment
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
      <div ref={contentRef}>
        {renderStepContent()}
      </div>

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