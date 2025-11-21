import { useState, useEffect } from "react";
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
import type { LoadingDock } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
    warehouse_profile?: {
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

  // Fetch warehouse analysis data
  const { data, isLoading, error } = useQuery<WarehouseAnalysisResponse>({
    queryKey: ['/api/assessments', id, 'warehouse-analysis'],
  });

  // Form state for warehouse profile
  const [inventoryValue, setInventoryValue] = useState<string>('');
  const [shrinkageRate, setShrinkageRate] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Initialize form when data loads
  useEffect(() => {
    if (data?.assessment.warehouse_profile) {
      const profile = data.assessment.warehouse_profile;
      setInventoryValue(profile.inventoryValue?.toString() || '');
      setShrinkageRate(profile.shrinkageRate?.toString() || '');
      setSelectedProducts(profile.highValueProducts || []);
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
    inventoryValue: parseFloat(inventoryValue) || assessment?.warehouse_profile?.inventoryValue || 0,
    shrinkageRate: parseFloat(shrinkageRate) || assessment?.warehouse_profile?.shrinkageRate || 0,
    cargoTheftHistory: assessment?.warehouse_profile?.cargoTheftIncidents || [],
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
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Warehouse className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{assessment?.name}</h1>
            <p className="text-muted-foreground">Warehouse Security Analysis Dashboard</p>
          </div>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* RIGHT COLUMN: Risk Score & ROI Calculator */}
        <div className="space-y-6">
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
    </div>
  );
}
