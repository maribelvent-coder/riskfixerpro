import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CargoTheftROICalculator } from "@/components/calculators/CargoTheftROICalculator";
import { LoadingDockGrid } from "@/components/warehouse/LoadingDockGrid";
import { LoadingDockDialog } from "@/components/warehouse/LoadingDockDialog";
import { ExecutiveSummaryCard } from "@/components/analysis/ExecutiveSummaryCard";
import type { LoadingDock } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoGenerateRisks } from "@/hooks/useAutoGenerateRisks";
import { useProfileAutosave } from "@/hooks/useProfileAutosave";
import { 
  Warehouse, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Save,
  Loader2,
  Package,
  Shield,
  Plus
} from "lucide-react";

interface WarehouseAnalysisResponse {
  assessment: {
    id: string;
    name: string;
    warehouseProfile?: {
      warehouseType?: string;
      squareFootage?: number;
      inventoryValue?: number;
      highValueProducts?: string[];
      loadingDockCount?: number;
      dailyTruckVolume?: number;
      shrinkageRate?: number;
      cargoTheftIncidents?: Array<{
        date: string;
        loss: number;
        insiderInvolvement?: boolean;
      }>;
      locationRisk?: 'High' | 'Medium' | 'Low';
    };
  };
  riskAnalysis: {
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    breakdown: {
      locationRisk: number;
      highValueGoods: number;
      controlGaps: number;
      incidentHistory: number;
      operationalVulnerabilities: number;
    };
  };
  loadingDocks: LoadingDock[];
}

const HIGH_VALUE_PRODUCT_OPTIONS = [
  { id: 'electronics', label: 'Electronics' },
  { id: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { id: 'alcohol', label: 'Alcohol & Beverages' },
  { id: 'designer_clothing', label: 'Designer Clothing' },
  { id: 'jewelry', label: 'Jewelry & Watches' },
  { id: 'automotive_parts', label: 'Automotive Parts' },
];

export default function WarehouseDashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Dialog state
  const [isAddDockOpen, setIsAddDockOpen] = useState(false);
  const [selectedDock, setSelectedDock] = useState<LoadingDock | null>(null);

  // Fetch warehouse analysis data with fresh data on mount
  const { data, isLoading, error } = useQuery<WarehouseAnalysisResponse>({
    queryKey: ['/api/assessments', id, 'warehouse-analysis'],
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Auto-generate risk scenarios when profile is saved (hybrid model - backend handles generation)
  const profileSaved = !!data?.assessment.warehouseProfile;
  const { scenariosExist } = useAutoGenerateRisks(id, profileSaved);

  // Form state for warehouse profile
  const [inventoryValue, setInventoryValue] = useState<string>('');
  const [shrinkageRate, setShrinkageRate] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // TCOR (Total Cost of Risk) fields
  const [employeeCount, setEmployeeCount] = useState<string>('');
  const [annualTurnoverRate, setAnnualTurnoverRate] = useState<string>('');
  const [avgHiringCost, setAvgHiringCost] = useState<string>('');
  const [annualLiabilityEstimates, setAnnualLiabilityEstimates] = useState<string>('');
  const [securityIncidentsPerYear, setSecurityIncidentsPerYear] = useState<string>('');
  const [brandDamageEstimate, setBrandDamageEstimate] = useState<string>('');

  // Build profile data for autosave
  const profileData = useMemo(() => ({
    inventoryValue: parseFloat(inventoryValue) || 0,
    shrinkageRate: parseFloat(shrinkageRate) || 0,
    highValueProducts: selectedProducts,
    employeeCount: parseFloat(employeeCount) || 0,
    annualTurnoverRate: parseFloat(annualTurnoverRate) || 0,
    avgHiringCost: parseFloat(avgHiringCost) || 0,
    annualLiabilityEstimates: parseFloat(annualLiabilityEstimates) || 0,
    securityIncidentsPerYear: parseFloat(securityIncidentsPerYear) || 0,
    brandDamageEstimate: parseFloat(brandDamageEstimate) || 0,
  }), [inventoryValue, shrinkageRate, selectedProducts, employeeCount, annualTurnoverRate, 
      avgHiringCost, annualLiabilityEstimates, securityIncidentsPerYear, brandDamageEstimate]);

  // Autosave profile changes with debounce
  useProfileAutosave({
    assessmentId: id,
    profileType: 'warehouse',
    data: profileData,
    onSaveSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'warehouse-analysis'] });
    },
  });

  // Initialize form when data loads
  useEffect(() => {
    if (data?.assessment.warehouseProfile) {
      const profile = data.assessment.warehouseProfile;
      setInventoryValue(profile.inventoryValue?.toString() || '');
      setShrinkageRate(profile.shrinkageRate?.toString() || '');
      setSelectedProducts(profile.highValueProducts || []);
      
      // TCOR fields
      setEmployeeCount((profile as any).employeeCount?.toString() || '');
      setAnnualTurnoverRate((profile as any).annualTurnoverRate?.toString() || '');
      setAvgHiringCost((profile as any).avgHiringCost?.toString() || '');
      setAnnualLiabilityEstimates((profile as any).annualLiabilityEstimates?.toString() || '');
      setSecurityIncidentsPerYear((profile as any).securityIncidentsPerYear?.toString() || '');
      setBrandDamageEstimate((profile as any).brandDamageEstimate?.toString() || '');
    }
  }, [data]);

  // Update warehouse profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('PATCH', `/api/assessments/${id}/warehouse-profile`, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', id, 'warehouse-analysis'] });
      toast({
        title: 'Profile Updated',
        description: 'Warehouse profile saved successfully. Risk analysis updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update warehouse profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleSaveAndAnalyze = () => {
    const profileData = {
      inventoryValue: parseFloat(inventoryValue) || 0,
      shrinkageRate: parseFloat(shrinkageRate) || 0,
      highValueProducts: selectedProducts,
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

  // Handle product selection
  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Get risk level badge color
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'default'; // Uses green styling
      case 'MEDIUM':
        return 'secondary'; // Uses yellow/warning styling
      case 'HIGH':
        return 'destructive'; // Uses orange styling
      case 'CRITICAL':
        return 'destructive'; // Uses red styling
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading warehouse analysis...</p>
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
              Failed to load warehouse analysis. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assessment = data?.assessment;
  const riskAnalysis = data?.riskAnalysis;
  const loadingDocks = (data?.loadingDocks || []) as LoadingDock[];

  // Prepare data for ROI Calculator
  const roiAssessmentData = {
    inventoryValue: parseFloat(inventoryValue) || assessment?.warehouseProfile?.inventoryValue || 0,
    shrinkageRate: parseFloat(shrinkageRate) || assessment?.warehouseProfile?.shrinkageRate || 0,
    cargoTheftHistory: assessment?.warehouseProfile?.cargoTheftIncidents || [],
  };

  // Example proposed controls (in production, these would come from the control library)
  const proposedControls = [
    {
      name: 'Loading Dock CCTV System (16 cameras)',
      estimatedCost: 45000,
      reductionPercentage: 25,
    },
    {
      name: 'GPS Fleet Tracking (All Vehicles)',
      estimatedCost: 35000,
      reductionPercentage: 20,
    },
    {
      name: 'Perimeter Access Control with Guard Booth',
      estimatedCost: 60000,
      reductionPercentage: 15,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-2 sm:gap-3">
        <Warehouse className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{assessment?.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Warehouse Security Analysis Dashboard</p>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* LEFT COLUMN: Facility Profile Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Facility Profile
              </CardTitle>
              <CardDescription>
                Configure your warehouse metrics for accurate risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Annual Inventory Value */}
              <div className="space-y-2">
                <Label htmlFor="inventory-value">Annual Inventory Value ($)</Label>
                <Input
                  id="inventory-value"
                  type="number"
                  placeholder="e.g., 15000000"
                  value={inventoryValue}
                  onChange={(e) => setInventoryValue(e.target.value)}
                  min="0"
                  step="100000"
                  data-testid="input-inventory-value"
                />
                <p className="text-xs text-muted-foreground">
                  Total value of inventory stored at this facility
                </p>
              </div>

              {/* Shrinkage Rate */}
              <div className="space-y-2">
                <Label htmlFor="shrinkage-rate">Shrinkage Rate (%)</Label>
                <Input
                  id="shrinkage-rate"
                  type="number"
                  placeholder="e.g., 2.8"
                  value={shrinkageRate}
                  onChange={(e) => setShrinkageRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  data-testid="input-shrinkage-rate"
                />
                <p className="text-xs text-muted-foreground">
                  Industry average: 1.5% | Best-in-class: 0.8%
                </p>
              </div>

              {/* High-Value Products */}
              <div className="space-y-3">
                <Label>High-Value Products</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HIGH_VALUE_PRODUCT_OPTIONS.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={product.id}
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                        data-testid={`checkbox-${product.id}`}
                      />
                      <label
                        htmlFor={product.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {product.label}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select all product types stored at this facility
                </p>
              </div>

              {/* TCOR (Total Cost of Risk) Section */}
              <div className="pt-6 space-y-4 border-t">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold">Total Cost of Risk (TCOR) Factors</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional: Add indirect cost factors to calculate comprehensive annual risk exposure
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
                      placeholder="e.g., 75"
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
                      placeholder="e.g., 35"
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
                      placeholder="e.g., 4000"
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
                      placeholder="e.g., 35000"
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
                      placeholder="e.g., 5"
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
                      placeholder="e.g., 15000"
                      value={brandDamageEstimate}
                      onChange={(e) => setBrandDamageEstimate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Save & Analyze Button */}
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
        </div>

        {/* RIGHT COLUMN: Control Gaps → Risk Score → ROI Calculator */}
        <div className="space-y-6">
          {/* Control Gaps - PRIORITIZED */}
          {riskAnalysis && riskAnalysis.breakdown.controlGaps > 0 && (
            <Card className="border-2 border-orange-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Security Control Gaps
                </CardTitle>
                <CardDescription>Critical vulnerabilities requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Control Gap Impact</span>
                    <Badge variant="destructive" className="text-lg px-3">
                      {riskAnalysis.breakdown.controlGaps} pts
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-muted-foreground">Common Gaps:</div>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Open loading docks without supervision</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Missing or inadequate CCTV coverage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Perimeter fence weaknesses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Inadequate access controls</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Addressing these control gaps is the most effective way to reduce cargo theft risk exposure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Score Card */}
          {riskAnalysis && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Cargo Theft Risk Score
                  </div>
                  <Badge
                    variant={getRiskBadgeVariant(riskAnalysis.riskLevel)}
                    className="text-lg px-4 py-1"
                    data-testid={`badge-risk-${riskAnalysis.riskLevel.toLowerCase()}`}
                  >
                    {riskAnalysis.riskLevel}
                  </Badge>
                </CardTitle>
                <CardDescription>0-100 vulnerability assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score Display */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary" data-testid="text-risk-score">
                    {riskAnalysis.score}
                  </div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="text-sm font-semibold mb-2">Risk Breakdown</div>
                  {Object.entries(riskAnalysis.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium">{value} pts</span>
                    </div>
                  ))}
                </div>

                {/* Risk Level Description */}
                <div className={`p-3 rounded-lg ${
                  riskAnalysis.riskLevel === 'LOW' ? 'bg-green-500/10 text-green-700 dark:text-green-300' :
                  riskAnalysis.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' :
                  riskAnalysis.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300' :
                  'bg-red-500/10 text-red-700 dark:text-red-300'
                }`}>
                  <div className="flex items-start gap-2">
                    {riskAnalysis.riskLevel === 'LOW' && <CheckCircle2 className="h-4 w-4 mt-0.5" />}
                    {riskAnalysis.riskLevel !== 'LOW' && <AlertTriangle className="h-4 w-4 mt-0.5" />}
                    <div className="text-xs">
                      {riskAnalysis.riskLevel === 'LOW' && 'Excellent security posture. Maintain current controls.'}
                      {riskAnalysis.riskLevel === 'MEDIUM' && 'Moderate risk. Consider implementing additional controls.'}
                      {riskAnalysis.riskLevel === 'HIGH' && 'Elevated risk. Security improvements strongly recommended.'}
                      {riskAnalysis.riskLevel === 'CRITICAL' && 'Critical vulnerability. Immediate security measures required.'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ROI Calculator */}
          <CargoTheftROICalculator
            assessment={roiAssessmentData}
            proposedControls={proposedControls}
          />
        </div>
      </div>

      {/* Loading Dock Security Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Loading Dock Security Grid
              </CardTitle>
              <CardDescription>
                Dock-by-dock security assessment and recommendations
              </CardDescription>
            </div>
            {loadingDocks.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                data-testid="button-add-dock"
                onClick={() => setIsAddDockOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Dock
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingDocks.length > 0 ? (
            <LoadingDockGrid
              // @ts-ignore - Type compatibility issue between Date | null vs Date | undefined
              loadingDocks={loadingDocks}
              onDockClick={(dock) => {
                // @ts-ignore - Type compatibility issue
                setSelectedDock(dock);
                setIsAddDockOpen(true);
              }}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">No Loading Docks Configured</p>
              <p className="text-sm mb-6">
                Add loading docks to track security metrics and identify vulnerabilities.
              </p>
              <Button
                variant="default"
                data-testid="button-add-first-dock"
                onClick={() => setIsAddDockOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Dock
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading Dock Dialog (Create/Edit) */}
      <LoadingDockDialog
        assessmentId={id!}
        open={isAddDockOpen}
        onOpenChange={(open) => {
          setIsAddDockOpen(open);
          if (!open) {
            setSelectedDock(null);
          }
        }}
        dockToEdit={selectedDock ?? undefined}
      />

      {/* AI Executive Summary */}
      {id && assessment?.assessment && (
        <div className="mt-6">
          <ExecutiveSummaryCard 
            assessmentId={id} 
            executiveSummary={assessment.assessment.executiveSummary}
          />
        </div>
      )}
    </div>
  );
}
