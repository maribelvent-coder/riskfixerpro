import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RiskAsset, RiskScenario, TreatmentPlan, InsertRiskAsset, InsertRiskScenario, InsertTreatmentPlan } from "@shared/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingDown, 
  Calculator,
  BarChart3,
  Target,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface RiskAssessmentNBSProps {
  assessmentId: string;
  onComplete?: () => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRiskColor(riskScore: number): string {
  if (riskScore >= 20) return "bg-red-500/20 border-red-500/40 text-red-300";
  if (riskScore >= 12) return "bg-orange-500/20 border-orange-500/40 text-orange-300";
  if (riskScore >= 6) return "bg-yellow-500/20 border-yellow-500/40 text-yellow-300";
  return "bg-green-500/20 border-green-500/40 text-green-300";
}

function getRiskLabel(riskScore: number): string {
  if (riskScore >= 20) return "Critical";
  if (riskScore >= 12) return "High";
  if (riskScore >= 6) return "Medium";
  return "Low";
}

function getHeatmapCellColor(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 20) return "bg-red-600 hover:bg-red-500";
  if (score >= 12) return "bg-orange-500 hover:bg-orange-400";
  if (score >= 6) return "bg-yellow-500 hover:bg-yellow-400";
  return "bg-green-600 hover:bg-green-500";
}

// ============================================================================
// ASSET DIALOG COMPONENT
// ============================================================================

interface AssetDialogProps {
  assessmentId: string;
  asset?: RiskAsset;
  onClose: () => void;
}

function AssetDialog({ assessmentId, asset, onClose }: AssetDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<InsertRiskAsset>>({
    assessmentId,
    name: asset?.name || "",
    type: asset?.type || "Property",
    owner: asset?.owner || "",
    criticality: asset?.criticality || 3,
    scope: asset?.scope || "",
    notes: asset?.notes || "",
    protectionSystems: asset?.protectionSystems || [],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRiskAsset) => {
      const response = await apiRequest("POST", `/api/assessments/${assessmentId}/risk-assets`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Asset created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create asset", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RiskAsset>) => {
      const response = await apiRequest("PATCH", `/api/risk-assets/${asset?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Asset updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update asset", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (asset) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData as InsertRiskAsset);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent className="max-w-2xl" data-testid="dialog-asset">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle>
          <DialogDescription>
            Define the critical assets you need to protect. Criticality (1-5) determines the impact in risk calculations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="asset-name">Asset Name *</Label>
            <Input
              id="asset-name"
              data-testid="input-asset-name"
              placeholder="e.g., Customer Database, Executive Team, Server Room"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-type">Asset Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="asset-type" data-testid="select-asset-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="People">People</SelectItem>
                  <SelectItem value="Property">Property</SelectItem>
                  <SelectItem value="Information">Information</SelectItem>
                  <SelectItem value="Reputation">Reputation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asset-owner">Owner</Label>
              <Input
                id="asset-owner"
                data-testid="input-asset-owner"
                placeholder="e.g., IT Department"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset-criticality">
              Criticality: {formData.criticality} 
              <span className="text-xs text-muted-foreground ml-2">(1=Lowest, 5=Highest)</span>
            </Label>
            <Slider
              id="asset-criticality"
              data-testid="slider-asset-criticality"
              min={1}
              max={5}
              step={1}
              value={[formData.criticality || 3]}
              onValueChange={([value]) => setFormData({ ...formData, criticality: value })}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimal Impact</span>
              <span>Catastrophic Impact</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset-scope">Scope</Label>
            <Input
              id="asset-scope"
              data-testid="input-asset-scope"
              placeholder="e.g., HQ Building, IT Department"
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset-notes">Notes</Label>
            <Textarea
              id="asset-notes"
              data-testid="textarea-asset-notes"
              placeholder="Additional description..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-asset-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} data-testid="button-asset-save">
            {isLoading ? "Saving..." : asset ? "Update Asset" : "Create Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  );
}

// ============================================================================
// SCENARIO DIALOG COMPONENT
// ============================================================================

interface ScenarioDialogProps {
  assessmentId: string;
  scenario?: RiskScenario;
  assets: RiskAsset[];
  onClose: () => void;
}

function ScenarioDialog({ assessmentId, scenario, assets, onClose }: ScenarioDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<InsertRiskScenario>>({
    assessmentId,
    assetId: scenario?.assetId || "",
    scenario: scenario?.scenario || "",
    asset: scenario?.asset || "",
    threatType: scenario?.threatType || "human",
    threatDescription: scenario?.threatDescription || "",
    vulnerabilityDescription: scenario?.vulnerabilityDescription || "",
    likelihood: scenario?.likelihood || "medium",
    impact: scenario?.impact || "moderate",
    riskLevel: scenario?.riskLevel || "Medium",
    likelihoodScore: scenario?.likelihoodScore || 3,
    impactScore: scenario?.impactScore || 3,
    inherentRisk: scenario?.inherentRisk || 9,
    controlEffectiveness: scenario?.controlEffectiveness || 0,
    residualRisk: scenario?.residualRisk || 9,
  });

  // Auto-calculate risk when likelihood or impact changes
  const updateRiskCalculations = (likelihood: number, impact: number, effectiveness: number = formData.controlEffectiveness || 0) => {
    const inherent = likelihood * impact;
    const residual = inherent * (1 - effectiveness);
    
    setFormData(prev => ({
      ...prev,
      likelihoodScore: likelihood,
      impactScore: impact,
      inherentRisk: inherent,
      residualRisk: residual,
      controlEffectiveness: effectiveness,
      riskLevel: getRiskLabel(residual),
      likelihood: ["very-low", "low", "medium", "high", "very-high"][likelihood - 1] || "medium",
      impact: ["negligible", "minor", "moderate", "major", "catastrophic"][impact - 1] || "moderate",
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertRiskScenario) => {
      const response = await apiRequest("POST", `/api/assessments/${assessmentId}/risk-scenarios`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Risk scenario created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-matrix"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create scenario", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<RiskScenario>) => {
      const response = await apiRequest("PATCH", `/api/risk-scenarios/${scenario?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Risk scenario updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-matrix"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update scenario", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenario) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData as InsertRiskScenario);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const selectedAsset = assets.find(a => a.id === formData.assetId);

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent className="max-w-3xl max-h-[90vh]" data-testid="dialog-scenario">
        <DialogHeader>
          <DialogTitle>{scenario ? "Edit Risk Scenario" : "Add Risk Scenario"}</DialogTitle>
          <DialogDescription>
            Define a threat scenario and assess its likelihood and impact. Risk is calculated automatically.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="scenario-asset">Asset *</Label>
              <Select
                value={formData.assetId}
                onValueChange={(value) => {
                  const asset = assets.find(a => a.id === value);
                  setFormData({ 
                    ...formData, 
                    assetId: value,
                    asset: asset?.name || "",
                    impactScore: asset?.criticality || 3
                  });
                  updateRiskCalculations(formData.likelihoodScore || 3, asset?.criticality || 3);
                }}
              >
                <SelectTrigger id="scenario-asset" data-testid="select-scenario-asset">
                  <SelectValue placeholder="Select asset..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} (Criticality: {asset.criticality})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scenario-description">Scenario Description *</Label>
              <Textarea
                id="scenario-description"
                data-testid="textarea-scenario-description"
                placeholder="e.g., Unauthorized access to server room during off-hours"
                value={formData.scenario}
                onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scenario-threat-type">Threat Type</Label>
                <Select
                  value={formData.threatType}
                  onValueChange={(value) => setFormData({ ...formData, threatType: value })}
                >
                  <SelectTrigger id="scenario-threat-type" data-testid="select-scenario-threat-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">Human</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scenario-threat">Threat Description</Label>
                <Input
                  id="scenario-threat"
                  data-testid="input-scenario-threat"
                  placeholder="e.g., Insider threat, External attacker"
                  value={formData.threatDescription}
                  onChange={(e) => setFormData({ ...formData, threatDescription: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scenario-vulnerability">Vulnerability Description</Label>
              <Textarea
                id="scenario-vulnerability"
                data-testid="textarea-scenario-vulnerability"
                placeholder="What makes this threat possible?"
                value={formData.vulnerabilityDescription}
                onChange={(e) => setFormData({ ...formData, vulnerabilityDescription: e.target.value })}
                rows={2}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Risk Assessment</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="scenario-likelihood">
                  Likelihood: {formData.likelihoodScore}
                  <span className="text-xs text-muted-foreground ml-2">(1=Rare, 5=Almost Certain)</span>
                </Label>
                <Slider
                  id="scenario-likelihood"
                  data-testid="slider-scenario-likelihood"
                  min={1}
                  max={5}
                  step={1}
                  value={[formData.likelihoodScore || 3]}
                  onValueChange={([value]) => updateRiskCalculations(value, formData.impactScore || 3)}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rare</span>
                  <span>Unlikely</span>
                  <span>Possible</span>
                  <span>Likely</span>
                  <span>Almost Certain</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scenario-impact">
                  Impact: {formData.impactScore}
                  {selectedAsset && <span className="text-xs text-muted-foreground ml-2">(From asset criticality)</span>}
                </Label>
                <Slider
                  id="scenario-impact"
                  data-testid="slider-scenario-impact"
                  min={1}
                  max={5}
                  step={1}
                  value={[formData.impactScore || 3]}
                  onValueChange={([value]) => updateRiskCalculations(formData.likelihoodScore || 3, value)}
                  className="py-4"
                  disabled={!!selectedAsset}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Negligible</span>
                  <span>Minor</span>
                  <span>Moderate</span>
                  <span>Major</span>
                  <span>Catastrophic</span>
                </div>
              </div>

              <Card className={`${getRiskColor(formData.residualRisk || 0)} border-2`}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Inherent Risk (L × I):</span>
                    <span className="font-mono font-bold">{formData.inherentRisk?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Control Effectiveness:</span>
                    <span className="font-mono font-bold">{((formData.controlEffectiveness || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Residual Risk:</span>
                    <span className="font-mono font-bold text-lg">{formData.residualRisk?.toFixed(1)} ({formData.riskLevel})</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-scenario-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} data-testid="button-scenario-save">
            {isLoading ? "Saving..." : scenario ? "Update Scenario" : "Create Scenario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  );
}

// ============================================================================
// SCENARIOS LIST COMPONENT
// ============================================================================

interface ScenariosListProps {
  assessmentId: string;
  scenarios: RiskScenario[];
  assets: RiskAsset[];
  onEdit: (scenario: RiskScenario) => void;
  onDelete: (id: string) => void;
}

function ScenariosList({ assessmentId, scenarios, assets, onEdit, onDelete }: ScenariosListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/risk-scenarios/${id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete scenario", description: error.message, variant: "destructive" });
    },
  });

  const generateNarrativeMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      const response = await apiRequest("POST", `/api/risk-scenarios/${scenarioId}/generate-narrative`);
      return { scenarioId, ...response };
    },
    onSuccess: (data, scenarioId) => {
      toast({ 
        title: "AI Analysis Generated", 
        description: "Professional security narrative has been generated successfully." 
      });
      
      // Update cache immediately with full updated scenario from API
      queryClient.setQueryData<RiskScenario[]>(
        ["/api/assessments", assessmentId, "risk-scenarios"],
        (oldScenarios) => {
          if (!oldScenarios) return oldScenarios;
          return oldScenarios.map(s => 
            s.id === scenarioId ? data.updatedScenario : s
          );
        }
      );
      
      // Also invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to generate AI analysis", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No risk scenarios defined yet.</p>
        <p className="text-sm">Add scenarios to begin your risk assessment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scenarios.filter(scenario => scenario).map((scenario) => {
        const asset = assets.find(a => a.id === scenario.assetId);
        
        return (
          <Card key={scenario.id} className="hover-elevate" data-testid={`card-scenario-${scenario.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <h3 className="font-medium leading-tight">{scenario.scenario}</h3>
                      {asset && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Asset: <span className="font-medium">{asset.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Likelihood:</span>
                      <span className="ml-2 font-mono font-medium">{scenario.likelihoodScore}/5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impact:</span>
                      <span className="ml-2 font-mono font-medium">{scenario.impactScore}/5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Inherent Risk:</span>
                      <span className="ml-2 font-mono font-medium">{scenario.inherentRisk?.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Control Effectiveness:</span>
                      <span className="ml-2 font-mono font-medium">{((scenario.controlEffectiveness || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Residual Risk:</span>
                      <Badge className={`ml-2 ${getRiskColor(scenario.residualRisk || 0)}`}>
                        {scenario.residualRisk?.toFixed(1)} - {getRiskLabel(scenario.residualRisk || 0)}
                      </Badge>
                    </div>
                  </div>

                  {/* AI-Generated Professional Analysis */}
                  {scenario.threatDescription && scenario.threatDescription.length > 100 && (
                    <div className="mt-3 p-3 rounded-md bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">AI Security Analysis</span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {scenario.threatDescription}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => generateNarrativeMutation.mutate(scenario.id)}
                    disabled={generateNarrativeMutation.isPending}
                    title="Generate AI Analysis"
                    data-testid={`button-generate-ai-${scenario.id}`}
                  >
                    {generateNarrativeMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onEdit(scenario)}
                    data-testid={`button-edit-scenario-${scenario.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this scenario?")) {
                        deleteMutation.mutate(scenario.id);
                        onDelete(scenario.id);
                      }
                    }}
                    data-testid={`button-delete-scenario-${scenario.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// RISK HEATMAP COMPONENT
// ============================================================================

interface RiskHeatmapProps {
  scenarios: RiskScenario[];
}

function RiskHeatmap({ scenarios }: RiskHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null);

  // Get scenarios for a specific cell
  const getScenariosForCell = (likelihood: number, impact: number) => {
    return scenarios.filter(
      s => Math.round(s.likelihoodScore || 0) === likelihood && Math.round(s.impactScore || 0) === impact
    );
  };

  // Get all scenarios in the selected cell
  const selectedScenarios = selectedCell 
    ? getScenariosForCell(selectedCell.likelihood, selectedCell.impact)
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Grid */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Risk Matrix (5×5)</h3>
          <div className="space-y-2">
            {/* Column Headers */}
            <div className="grid grid-cols-6 gap-1">
              <div className="h-10"></div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 flex items-center justify-center text-xs font-medium">
                  {i}
                </div>
              ))}
            </div>

            {/* Rows (5 to 1, top to bottom) */}
            {[5, 4, 3, 2, 1].map(likelihood => (
              <div key={likelihood} className="grid grid-cols-6 gap-1">
                {/* Row Header */}
                <div className="h-16 flex items-center justify-center text-xs font-medium">
                  {likelihood}
                </div>

                {/* Cells */}
                {[1, 2, 3, 4, 5].map(impact => {
                  const cellScenarios = getScenariosForCell(likelihood, impact);
                  const isSelected = selectedCell?.likelihood === likelihood && selectedCell?.impact === impact;

                  return (
                    <button
                      key={impact}
                      type="button"
                      onClick={() => setSelectedCell({ likelihood, impact })}
                      className={`h-16 rounded-md ${getHeatmapCellColor(likelihood, impact)} ${
                        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                      } transition-all relative group`}
                      data-testid={`cell-heatmap-${likelihood}-${impact}`}
                    >
                      {cellScenarios.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-background/90 rounded-full h-8 w-8 flex items-center justify-center font-mono font-bold text-sm">
                            {cellScenarios.length}
                          </div>
                        </div>
                      )}
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg border">
                          L:{likelihood} × I:{impact} = {likelihood * impact}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Axis Labels */}
            <div className="grid grid-cols-6 gap-1 mt-2">
              <div></div>
              <div className="col-span-5 text-center text-xs font-medium text-muted-foreground">
                Impact →
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <div className="rotate-180" style={{ writingMode: 'vertical-rl' }}>
                Likelihood →
              </div>
            </div>
          </div>
        </div>

        {/* Selected Cell Details */}
        <div>
          <h3 className="text-sm font-semibold mb-4">
            {selectedCell 
              ? `Cell Details: L${selectedCell.likelihood} × I${selectedCell.impact}` 
              : "Click a cell to view scenarios"}
          </h3>

          <ScrollArea className="h-[400px]">
            {selectedCell ? (
              selectedScenarios.length > 0 ? (
                <div className="space-y-3 pr-4">
                  {selectedScenarios.map((scenario) => (
                    <Card key={scenario.id} data-testid={`card-heatmap-scenario-${scenario.id}`}>
                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm font-medium">{scenario.scenario}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Asset:</span>
                          <span className="font-medium">{scenario.asset}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Residual Risk:</span>
                          <Badge className={getRiskColor(scenario.residualRisk || 0)}>
                            {scenario.residualRisk?.toFixed(1)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No scenarios in this risk level</p>
                  <p className="text-xs mt-1">
                    Risk Score: {selectedCell.likelihood * selectedCell.impact}
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a cell to view scenarios</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-3">Risk Level Guide</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-green-600"></div>
              <div className="text-sm">
                <div className="font-medium">Low</div>
                <div className="text-xs text-muted-foreground">Score: 1-5</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-yellow-500"></div>
              <div className="text-sm">
                <div className="font-medium">Medium</div>
                <div className="text-xs text-muted-foreground">Score: 6-11</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-orange-500"></div>
              <div className="text-sm">
                <div className="font-medium">High</div>
                <div className="text-xs text-muted-foreground">Score: 12-19</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-red-600"></div>
              <div className="text-sm">
                <div className="font-medium">Critical</div>
                <div className="text-xs text-muted-foreground">Score: 20-25</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// TREATMENT DIALOG COMPONENT
// ============================================================================

interface TreatmentDialogProps {
  assessmentId: string;
  treatment?: TreatmentPlan;
  scenarios: RiskScenario[];
  onClose: () => void;
}

function TreatmentDialog({ assessmentId, treatment, scenarios, onClose }: TreatmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<InsertTreatmentPlan>>({
    assessmentId,
    riskScenarioId: treatment?.riskScenarioId || "",
    risk: treatment?.risk || "",
    threatDescription: treatment?.threatDescription || "",
    strategy: treatment?.strategy || "Control",
    description: treatment?.description || "",
    type: treatment?.type || "physical",
    effect: treatment?.effect || "reduce_likelihood",
    value: treatment?.value || 1,
    projectedRiskReduction: treatment?.projectedRiskReduction || 0,
    responsible: treatment?.responsible || "",
    deadline: treatment?.deadline || "",
    cost: treatment?.cost || "",
    status: treatment?.status || "planned",
  });

  const selectedScenario = scenarios.find(s => s.id === formData.riskScenarioId);

  // Auto-calculate projected risk reduction
  const calculateProjectedReduction = (value: number, effect: string) => {
    if (!selectedScenario) return 0;
    
    const currentResidual = selectedScenario.residualRisk || 0;
    const reductionFactor = value / 5; // 1-5 scale to 0.2-1.0
    
    if (effect === "reduce_likelihood") {
      const newLikelihood = Math.max(1, (selectedScenario.likelihoodScore || 3) - value);
      const newInherent = newLikelihood * (selectedScenario.impactScore || 3);
      const newResidual = newInherent * (1 - (selectedScenario.controlEffectiveness || 0));
      return Math.max(0, currentResidual - newResidual);
    } else {
      const newImpact = Math.max(1, (selectedScenario.impactScore || 3) - value);
      const newInherent = (selectedScenario.likelihoodScore || 3) * newImpact;
      const newResidual = newInherent * (1 - (selectedScenario.controlEffectiveness || 0));
      return Math.max(0, currentResidual - newResidual);
    }
  };

  const updateProjection = (value: number, effect: string) => {
    const reduction = calculateProjectedReduction(value, effect);
    setFormData(prev => ({ ...prev, value, effect, projectedRiskReduction: reduction }));
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertTreatmentPlan) => {
      const response = await apiRequest("POST", `/api/assessments/${assessmentId}/treatment-plans`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Treatment plan created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "treatment-plans"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create treatment plan", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<TreatmentPlan>) => {
      const response = await apiRequest("PATCH", `/api/treatment-plans/${treatment?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Treatment plan updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "treatment-plans"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update treatment plan", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (treatment) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData as InsertTreatmentPlan);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const currentRisk = selectedScenario?.residualRisk || 0;
  const targetRisk = Math.max(0, currentRisk - Math.min(formData.projectedRiskReduction || 0, currentRisk));

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent className="max-w-3xl max-h-[90vh]" data-testid="dialog-treatment">
        <DialogHeader>
          <DialogTitle>{treatment ? "Edit Treatment Plan" : "Add Treatment Plan"}</DialogTitle>
          <DialogDescription>
            Define mitigation strategies to reduce risk. See projected before/after impact.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="treatment-scenario">Risk Scenario *</Label>
              <Select
                value={formData.riskScenarioId}
                onValueChange={(value) => {
                  const scenario = scenarios.find(s => s.id === value);
                  setFormData({
                    ...formData,
                    riskScenarioId: value,
                    risk: scenario?.scenario || "",
                    threatDescription: scenario?.threatDescription || "",
                  });
                }}
              >
                <SelectTrigger id="treatment-scenario" data-testid="select-treatment-scenario">
                  <SelectValue placeholder="Select risk scenario..." />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.scenario} (Risk: {scenario.residualRisk?.toFixed(1)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="treatment-strategy">Strategy *</Label>
                <Select
                  value={formData.strategy}
                  onValueChange={(value) => setFormData({ ...formData, strategy: value })}
                >
                  <SelectTrigger id="treatment-strategy" data-testid="select-treatment-strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accept">Accept</SelectItem>
                    <SelectItem value="Avoid">Avoid</SelectItem>
                    <SelectItem value="Control">Control</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="treatment-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="treatment-type" data-testid="select-treatment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="people">People</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treatment-description">Treatment Description *</Label>
              <Textarea
                id="treatment-description"
                data-testid="textarea-treatment-description"
                placeholder="Describe the mitigation action..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Risk Reduction</h3>

              <div className="grid gap-2">
                <Label htmlFor="treatment-effect">Primary Effect</Label>
                <Select
                  value={formData.effect}
                  onValueChange={(value) => updateProjection(formData.value || 1, value)}
                >
                  <SelectTrigger id="treatment-effect" data-testid="select-treatment-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reduce_likelihood">Reduce Likelihood</SelectItem>
                    <SelectItem value="reduce_impact">Reduce Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="treatment-value">
                  Reduction Value: {formData.value}
                  <span className="text-xs text-muted-foreground ml-2">(1=Minimal, 5=Maximum)</span>
                </Label>
                <Slider
                  id="treatment-value"
                  data-testid="slider-treatment-value"
                  min={1}
                  max={5}
                  step={1}
                  value={[formData.value || 1]}
                  onValueChange={([value]) => updateProjection(value, formData.effect || "reduce_likelihood")}
                  className="py-4"
                />
              </div>

              {selectedScenario && (
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3">Before/After Visualization</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Current Risk</span>
                          <span className="font-mono font-bold">{currentRisk.toFixed(1)}</span>
                        </div>
                        <div className="h-6 rounded-md overflow-hidden bg-background">
                          <div 
                            className="h-full bg-red-600 transition-all"
                            style={{ width: `${Math.min(100, (currentRisk / 25) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Target Risk (After Treatment)</span>
                          <span className="font-mono font-bold">{targetRisk.toFixed(1)}</span>
                        </div>
                        <div className="h-6 rounded-md overflow-hidden bg-background">
                          <div 
                            className="h-full bg-green-600 transition-all"
                            style={{ width: `${Math.min(100, (targetRisk / 25) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <TrendingDown className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">
                          Projected Reduction: {(formData.projectedRiskReduction || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="treatment-responsible">Responsible Party</Label>
                <Input
                  id="treatment-responsible"
                  data-testid="input-treatment-responsible"
                  placeholder="e.g., Security Manager"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="treatment-deadline">Deadline</Label>
                <Input
                  id="treatment-deadline"
                  data-testid="input-treatment-deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="treatment-cost">Estimated Cost</Label>
                <Input
                  id="treatment-cost"
                  data-testid="input-treatment-cost"
                  placeholder="e.g., $5,000"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treatment-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="treatment-status" data-testid="select-treatment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-treatment-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} data-testid="button-treatment-save">
            {isLoading ? "Saving..." : treatment ? "Update Treatment" : "Create Treatment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  );
}

// ============================================================================
// TREATMENTS LIST COMPONENT
// ============================================================================

interface TreatmentsListProps {
  assessmentId: string;
  treatments: TreatmentPlan[];
  scenarios: RiskScenario[];
  onEdit: (treatment: TreatmentPlan) => void;
  onDelete: (id: string) => void;
}

function TreatmentsList({ assessmentId, treatments, scenarios, onEdit, onDelete }: TreatmentsListProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/treatment-plans/${id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete treatment plan", description: error.message, variant: "destructive" });
    },
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/40">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">In Progress</Badge>;
      default:
        return <Badge variant="outline">Planned</Badge>;
    }
  };

  if (treatments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No treatment plans defined yet.</p>
        <p className="text-sm">Add treatments to mitigate identified risks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {treatments.map((treatment) => {
        const scenario = scenarios.find(s => s.id === treatment.riskScenarioId);
        const currentRisk = scenario?.residualRisk || 0;
        const targetRisk = Math.max(0, currentRisk - Math.min(treatment.projectedRiskReduction || 0, currentRisk));

        return (
          <Card key={treatment.id} className="hover-elevate" data-testid={`card-treatment-${treatment.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium leading-tight">{treatment.description}</h3>
                        {getStatusBadge(treatment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Risk: <span className="font-medium">{treatment.risk}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Strategy:</span>
                      <span className="ml-2 font-medium">{treatment.strategy}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium capitalize">{treatment.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Responsible:</span>
                      <span className="ml-2 font-medium">{treatment.responsible || "TBD"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="ml-2 font-medium">{treatment.deadline || "TBD"}</span>
                    </div>
                  </div>

                  {/* Before/After Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Current Risk</span>
                        <span className="font-mono font-medium">{currentRisk.toFixed(1)}</span>
                      </div>
                      <div className="h-4 rounded-md overflow-hidden bg-muted">
                        <div 
                          className="h-full bg-red-600 transition-all"
                          style={{ width: `${Math.min(100, (currentRisk / 25) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Target Risk</span>
                        <span className="font-mono font-medium">{targetRisk.toFixed(1)}</span>
                      </div>
                      <div className="h-4 rounded-md overflow-hidden bg-muted">
                        <div 
                          className="h-full bg-green-600 transition-all"
                          style={{ width: `${Math.min(100, (targetRisk / 25) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <TrendingDown className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">
                        Reduction: <span className="font-mono font-medium">{(treatment.projectedRiskReduction || 0).toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onEdit(treatment)}
                    data-testid={`button-edit-treatment-${treatment.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this treatment plan?")) {
                        deleteMutation.mutate(treatment.id);
                        onDelete(treatment.id);
                      }
                    }}
                    data-testid={`button-delete-treatment-${treatment.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RiskAssessmentNBS({ assessmentId, onComplete }: RiskAssessmentNBSProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("scenarios"); // Default to scenarios tab for immediate value
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<RiskAsset | undefined>(undefined);
  const [editingScenario, setEditingScenario] = useState<RiskScenario | undefined>(undefined);
  const [editingTreatment, setEditingTreatment] = useState<TreatmentPlan | undefined>(undefined);

  // Fetch data
  const { data: assets = [], isLoading: assetsLoading } = useQuery<RiskAsset[]>({
    queryKey: ["/api/assessments", assessmentId, "risk-assets"],
  });

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery<RiskScenario[]>({
    queryKey: ["/api/assessments", assessmentId, "risk-scenarios"],
  });

  const { data: treatments = [], isLoading: treatmentsLoading } = useQuery<TreatmentPlan[]>({
    queryKey: ["/api/assessments", assessmentId, "treatment-plans"],
  });

  // Recalculate all risks mutation
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/assessments/${assessmentId}/recalc-controls`);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Risks recalculated successfully", 
        description: "All risk scenarios have been updated with current control effectiveness."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] });
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to recalculate risks", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/risk-assets/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Asset deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-assets"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete asset", description: error.message, variant: "destructive" });
    },
  });

  const handleEditAsset = (asset: RiskAsset) => {
    setEditingAsset(asset);
    setAssetDialogOpen(true);
  };

  const handleEditScenario = (scenario: RiskScenario) => {
    setEditingScenario(scenario);
    setScenarioDialogOpen(true);
  };

  const handleEditTreatment = (treatment: TreatmentPlan) => {
    setEditingTreatment(treatment);
    setTreatmentDialogOpen(true);
  };

  const handleCloseAssetDialog = () => {
    setAssetDialogOpen(false);
    setEditingAsset(undefined);
  };

  const handleCloseScenarioDialog = () => {
    setScenarioDialogOpen(false);
    setEditingScenario(undefined);
  };

  const handleCloseTreatmentDialog = () => {
    setTreatmentDialogOpen(false);
    setEditingTreatment(undefined);
  };

  const isLoading = assetsLoading || scenariosLoading || treatmentsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Quantitative risk analysis with numeric calculations
              </p>
            </div>
            <Button
              onClick={() => recalculateMutation.mutate()}
              disabled={recalculateMutation.isPending || scenarios.length === 0}
              data-testid="button-recalculate-risks"
              variant="outline"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {recalculateMutation.isPending ? "Recalculating..." : "Recalculate All Risks"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-risk-assessment">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets" data-testid="tab-assets">
            Assets ({assets.length})
          </TabsTrigger>
          <TabsTrigger value="scenarios" data-testid="tab-scenarios">
            Scenarios ({scenarios.length})
          </TabsTrigger>
          <TabsTrigger value="heatmap" data-testid="tab-heatmap">
            Heatmap
          </TabsTrigger>
          <TabsTrigger value="treatments" data-testid="tab-treatments">
            Treatments ({treatments.length})
          </TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Define the critical assets you need to protect. Criticality drives impact calculations.
            </p>
            <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAsset(undefined)} data-testid="button-add-asset">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              {assetDialogOpen && (
                <AssetDialog
                  assessmentId={assessmentId}
                  asset={editingAsset}
                  onClose={handleCloseAssetDialog}
                />
              )}
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assets defined yet.</p>
              <p className="text-sm">Start by adding the critical assets you need to protect.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {assets.map((asset) => (
                <Card key={asset.id} className="hover-elevate" data-testid={`card-asset-${asset.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{asset.name}</h3>
                          <Badge variant="outline">{asset.type}</Badge>
                          <Badge className={`${getRiskColor(asset.criticality * 5)}`}>
                            Criticality: {asset.criticality}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          {asset.owner && (
                            <div>
                              <span>Owner:</span>
                              <span className="ml-2 font-medium text-foreground">{asset.owner}</span>
                            </div>
                          )}
                          {asset.scope && (
                            <div>
                              <span>Scope:</span>
                              <span className="ml-2 font-medium text-foreground">{asset.scope}</span>
                            </div>
                          )}
                        </div>

                        {asset.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{asset.notes}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditAsset(asset)}
                          data-testid={`button-edit-asset-${asset.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this asset?")) {
                              deleteAssetMutation.mutate(asset.id);
                            }
                          }}
                          data-testid={`button-delete-asset-${asset.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Define threat scenarios and assess likelihood and impact. Risk is calculated automatically.
            </p>
            <Dialog open={scenarioDialogOpen} onOpenChange={setScenarioDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setEditingScenario(undefined)} 
                  disabled={assets.length === 0}
                  data-testid="button-add-scenario"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scenario
                </Button>
              </DialogTrigger>
              {scenarioDialogOpen && (
                <ScenarioDialog
                  assessmentId={assessmentId}
                  scenario={editingScenario}
                  assets={assets}
                  onClose={handleCloseScenarioDialog}
                />
              )}
            </Dialog>
          </div>

          {assets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Please add assets first before creating scenarios.</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading scenarios...</div>
          ) : (
            <ScenariosList
              assessmentId={assessmentId}
              scenarios={scenarios}
              assets={assets}
              onEdit={handleEditScenario}
              onDelete={(id) => queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "risk-scenarios"] })}
            />
          )}
        </TabsContent>

        {/* Heatmap Tab */}
        <TabsContent value="heatmap" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            5×5 risk matrix visualization. Click cells to see scenarios at each risk level.
          </p>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading heatmap...</div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scenarios to visualize yet.</p>
              <p className="text-sm">Add risk scenarios to see them on the heatmap.</p>
            </div>
          ) : (
            <RiskHeatmap scenarios={scenarios} />
          )}
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Define mitigation strategies. See projected risk reduction with before/after visualization.
            </p>
            <Dialog open={treatmentDialogOpen} onOpenChange={setTreatmentDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setEditingTreatment(undefined)} 
                  disabled={scenarios.length === 0}
                  data-testid="button-add-treatment"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Treatment
                </Button>
              </DialogTrigger>
              {treatmentDialogOpen && (
                <TreatmentDialog
                  assessmentId={assessmentId}
                  treatment={editingTreatment}
                  scenarios={scenarios}
                  onClose={handleCloseTreatmentDialog}
                />
              )}
            </Dialog>
          </div>

          {scenarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Please add risk scenarios first before creating treatments.</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading treatments...</div>
          ) : (
            <TreatmentsList
              assessmentId={assessmentId}
              treatments={treatments}
              scenarios={scenarios}
              onEdit={handleEditTreatment}
              onDelete={(id) => queryClient.invalidateQueries({ queryKey: ["/api/assessments", assessmentId, "treatment-plans"] })}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Completion Card */}
      {onComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Complete Risk Assessment
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Finalize all risk calculations and proceed to next phase
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => recalculateMutation.mutate()}
              disabled={recalculateMutation.isPending || scenarios.length === 0}
              data-testid="button-complete-phase2"
              className="w-full"
            >
              {recalculateMutation.isPending ? "Completing..." : "Complete Phase 2"}
            </Button>
            {scenarios.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Add at least one risk scenario before completing
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
