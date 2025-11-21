/**
 * CARGO THEFT ROI CALCULATOR - USAGE EXAMPLE
 * 
 * This example demonstrates how to use the CargoTheftROICalculator component
 * in a warehouse security assessment workflow.
 * 
 * Framework: Warehouse Framework v2.0 (Section 8.5)
 */

import { CargoTheftROICalculator } from './CargoTheftROICalculator';

export function CargoTheftROICalculatorExample() {
  // ============================================================
  // EXAMPLE 1: HIGH-RISK WAREHOUSE (Electronics Distribution)
  // ============================================================
  const highRiskWarehouse = {
    assessment: {
      inventoryValue: 15000000, // $15M inventory
      shrinkageRate: 2.8, // 2.8% shrinkage rate
      cargoTheftHistory: [
        { date: '2024-06-15', loss: 125000, insiderInvolvement: true },
        { date: '2024-03-22', loss: 85000, insiderInvolvement: false },
        { date: '2023-11-10', loss: 200000, insiderInvolvement: false },
      ],
    },
    proposedControls: [
      {
        name: 'Loading Dock CCTV System (16 cameras)',
        estimatedCost: 45000,
        reductionPercentage: 25, // 25% reduction
      },
      {
        name: 'GPS Fleet Tracking (85 vehicles)',
        estimatedCost: 35000,
        reductionPercentage: 20, // 20% reduction
      },
      {
        name: 'Perimeter Access Control with Guard Booth',
        estimatedCost: 60000,
        reductionPercentage: 15, // 15% reduction
      },
      {
        name: 'High-Value Inventory Caging (Zone A)',
        estimatedCost: 25000,
        reductionPercentage: 10, // 10% reduction
      },
      {
        name: 'RFID Seal Verification System',
        estimatedCost: 18000,
        reductionPercentage: 8, // 8% reduction
      },
    ],
  };

  // ============================================================
  // EXAMPLE 2: MEDIUM-RISK WAREHOUSE (General Merchandise)
  // ============================================================
  const mediumRiskWarehouse = {
    assessment: {
      inventoryValue: 5000000, // $5M inventory
      shrinkageRate: 1.6, // 1.6% shrinkage rate
      cargoTheftHistory: [
        { date: '2024-04-10', loss: 45000, insiderInvolvement: false },
      ],
    },
    proposedControls: [
      {
        name: 'Basic CCTV System (8 cameras)',
        estimatedCost: 22000,
        reductionPercentage: 20,
      },
      {
        name: 'Gate Access Control System',
        estimatedCost: 35000,
        reductionPercentage: 15,
      },
      {
        name: 'Driver Verification Protocol',
        estimatedCost: 5000,
        reductionPercentage: 8,
      },
    ],
  };

  // ============================================================
  // EXAMPLE 3: LOW-RISK WAREHOUSE (Already Well-Protected)
  // ============================================================
  const lowRiskWarehouse = {
    assessment: {
      inventoryValue: 3000000, // $3M inventory
      shrinkageRate: 0.9, // 0.9% shrinkage rate (below best-in-class!)
      cargoTheftHistory: [], // No incidents
    },
    proposedControls: [
      {
        name: 'Security System Upgrade (Annual Maintenance)',
        estimatedCost: 12000,
        reductionPercentage: 5,
      },
    ],
  };

  // ============================================================
  // RENDERING EXAMPLES
  // ============================================================
  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Cargo Theft ROI Calculator Examples</h1>
        <p className="text-muted-foreground">
          Demonstrating ROI calculations for different warehouse security scenarios
        </p>
      </div>

      {/* High-Risk Warehouse Example */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">High-Risk Warehouse: Electronics Distribution Center</h2>
        <p className="text-sm text-muted-foreground">
          $15M inventory • 2.8% shrinkage • 3 cargo theft incidents • $183K investment
        </p>
        <CargoTheftROICalculator 
          assessment={highRiskWarehouse.assessment}
          proposedControls={highRiskWarehouse.proposedControls}
        />
        <div className="text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg">
          <strong>Expected Results:</strong>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>Current Annual Loss: ~$557K (shrinkage + avg theft)</li>
            <li>Projected Savings: ~$446K annually (80% reduction, capped at 85%)</li>
            <li>Payback Period: ~0.4 years (about 5 months)</li>
            <li>3-Year ROI: ~631% (Excellent ROI)</li>
          </ul>
        </div>
      </div>

      {/* Medium-Risk Warehouse Example */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Medium-Risk Warehouse: General Merchandise</h2>
        <p className="text-sm text-muted-foreground">
          $5M inventory • 1.6% shrinkage • 1 cargo theft incident • $62K investment
        </p>
        <CargoTheftROICalculator 
          assessment={mediumRiskWarehouse.assessment}
          proposedControls={mediumRiskWarehouse.proposedControls}
        />
        <div className="text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg">
          <strong>Expected Results:</strong>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>Current Annual Loss: ~$125K</li>
            <li>Projected Savings: ~$54K annually (43% reduction)</li>
            <li>Payback Period: ~1.1 years</li>
            <li>3-Year ROI: ~161% (Positive Return)</li>
          </ul>
        </div>
      </div>

      {/* Low-Risk Warehouse Example */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Low-Risk Warehouse: Already Well-Protected</h2>
        <p className="text-sm text-muted-foreground">
          $3M inventory • 0.9% shrinkage • 0 incidents • $12K annual maintenance
        </p>
        <CargoTheftROICalculator 
          assessment={lowRiskWarehouse.assessment}
          proposedControls={lowRiskWarehouse.proposedControls}
        />
        <div className="text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg">
          <strong>Expected Results:</strong>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>Current Annual Loss: ~$27K (excellent performance!)</li>
            <li>Projected Savings: ~$1.4K annually (5% reduction)</li>
            <li>Payback Period: ~9 years (maintenance investment)</li>
            <li>3-Year ROI: ~-65% (Maintenance cost, not growth investment)</li>
            <li>Note: This warehouse is already performing at best-in-class levels</li>
          </ul>
        </div>
      </div>

      {/* Integration Notes */}
      <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <span>📋</span>
          Integration Notes
        </h3>
        <ul className="text-sm space-y-1 text-muted-foreground list-disc ml-6">
          <li>This component can be embedded in the warehouse assessment workflow</li>
          <li>Data can be sourced from the warehouse_profile JSONB column on assessments table</li>
          <li>Proposed controls can come from the control_library filtered by warehouse template</li>
          <li>Real-time calculations update as user modifies controls/costs</li>
          <li>Export to PDF report for stakeholder presentation</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================
// HOW TO USE IN A WAREHOUSE ASSESSMENT PAGE
// ============================================================
/*
import { CargoTheftROICalculator } from '@/components/calculators/CargoTheftROICalculator';
import { useQuery } from '@tanstack/react-query';

export function WarehouseAssessmentPage({ assessmentId }: { assessmentId: string }) {
  const { data: assessment } = useQuery({
    queryKey: ['/api/assessments', assessmentId],
  });

  const { data: proposedControls } = useQuery({
    queryKey: ['/api/assessments', assessmentId, 'proposed-controls'],
  });

  if (!assessment || !proposedControls) return <div>Loading...</div>;

  const warehouseData = {
    inventoryValue: assessment.warehouse_profile?.inventoryValue || 0,
    shrinkageRate: assessment.warehouse_profile?.shrinkageRate || 0,
    cargoTheftHistory: assessment.warehouse_profile?.cargoTheftIncidents || [],
  };

  return (
    <div className="container mx-auto p-6">
      <h1>Warehouse Security Assessment</h1>
      
      <CargoTheftROICalculator 
        assessment={warehouseData}
        proposedControls={proposedControls}
      />
    </div>
  );
}
*/
