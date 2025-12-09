/**
 * Retail Store Control Effectiveness Library
 * 
 * RiskFixer AI Assessment Framework - Layer 5: Control Effectiveness Data
 * Provides evidence-based control recommendations with ROI calculations.
 * 
 * Sources:
 * - NRF National Retail Security Survey (2023-2024)
 * - Loss Prevention Research Council (LPRC) studies
 * - ASIS Retail Security Council reports
 * - University of Florida National Retail Security Survey
 * - Insurance industry loss data
 * 
 * @version 1.0
 * @see RiskFixer-AI-Assessment-Framework-v1_0.md Section 3.5
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ControlCategory = 'deterrence' | 'detection' | 'delay' | 'response';
export type StoreSize = 'small' | 'medium' | 'large';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface CostRange {
  min: number;
  max: number;
}

export interface RetailControl {
  id: string;
  name: string;
  category: ControlCategory;
  description: string;
  costRange: {
    small: CostRange;   // <5,000 sq ft
    medium: CostRange;  // 5,000-20,000 sq ft
    large: CostRange;   // >20,000 sq ft
  };
  annualMaintenance: number; // Percentage of install cost (0.05 = 5%)
  effectivenessData: {
    shrinkageReduction: number; // 0.30 = 30% reduction
    source: string;
    confidence: ConfidenceLevel;
  };
  mitigatesThreats: string[];
  applicableWhen: {
    storeFormats: string[];
    excludeWhen?: string[];
    requiresCondition?: string;
  };
  implementationTime: string;
  vendorRequired: boolean;
  asisReference?: string;
}

export interface StoreProfile {
  squareFootage: number;
  storeFormat: string;
  hasHighValueMerchandise: boolean;
  hasDressingRooms: boolean;
  hasSelfCheckout: boolean;
  operatingHours: 'standard' | 'extended' | '24hour';
  annualRevenue: number;
  currentShrinkageRate: number;
}

export interface ROICalculation {
  controlId: string;
  controlName: string;
  implementationCost: number;
  annualMaintenanceCost: number;
  estimatedAnnualSavings: number;
  paybackPeriodMonths: number;
  fiveYearROI: number;
  confidence: ConfidenceLevel;
}

export interface ControlRecommendation {
  control: RetailControl;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
  estimatedROI: ROICalculation;
  addressesThreats: string[];
}

export interface SurveyResponses {
  [key: string]: string | number | boolean | undefined;
}

export interface ThreatAssessment {
  threatId: string;
  threatName: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  inherentRisk: number;
}

// ============================================================================
// RETAIL CONTROL DEFINITIONS (50+ Controls)
// ============================================================================

export const RETAIL_CONTROLS: RetailControl[] = [
  // -------------------------------------------------------------------------
  // DETERRENCE CONTROLS (14 controls)
  // -------------------------------------------------------------------------
  {
    id: 'eas_pedestals',
    name: 'EAS Pedestals/Gates',
    category: 'deterrence',
    description: 'Electronic Article Surveillance detection pedestals at store exits triggering alarms for active tags.',
    costRange: {
      small: { min: 3000, max: 6000 },
      medium: { min: 6000, max: 15000 },
      large: { min: 15000, max: 35000 },
    },
    annualMaintenance: 0.10,
    effectivenessData: {
      shrinkageReduction: 0.30,
      source: 'NRF 2023 National Retail Security Survey',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
      excludeWhen: ['Service Only', 'Behind Counter Only'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
    asisReference: 'ASIS GDL-RA Retail',
  },
  {
    id: 'security_guard_uniformed',
    name: 'Uniformed Security Officer',
    category: 'deterrence',
    description: 'Visible security presence providing deterrence, customer assistance, and incident response.',
    costRange: {
      small: { min: 25000, max: 40000 },
      medium: { min: 40000, max: 75000 },
      large: { min: 75000, max: 150000 },
    },
    annualMaintenance: 1.0, // Ongoing cost
    effectivenessData: {
      shrinkageReduction: 0.25,
      source: 'LPRC 2022 Retail Security Study',
      confidence: 'medium',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime', 'customer_violence', 'armed_robbery'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store', 'Luxury'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'prosecution_signage',
    name: 'Prosecution Policy Signage',
    category: 'deterrence',
    description: 'Visible signage warning that shoplifters will be prosecuted to the fullest extent of the law.',
    costRange: {
      small: { min: 100, max: 300 },
      medium: { min: 200, max: 500 },
      large: { min: 400, max: 1000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.05,
      source: 'Industry consensus estimate',
      confidence: 'low',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1-3 days',
    vendorRequired: false,
  },
  {
    id: 'clear_sightlines',
    name: 'Clear Sightlines - Sales Floor',
    category: 'deterrence',
    description: 'Fixture placement maintaining clear visibility across the sales floor for natural surveillance.',
    costRange: {
      small: { min: 500, max: 2000 },
      medium: { min: 2000, max: 8000 },
      large: { min: 8000, max: 25000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.12,
      source: 'CPTED Guidelines / LPRC Research',
      confidence: 'medium',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime', 'customer_violence'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1-4 weeks',
    vendorRequired: false,
  },
  {
    id: 'adequate_lighting_interior',
    name: 'Adequate Interior Lighting',
    category: 'deterrence',
    description: 'Proper lighting levels throughout the store interior eliminating dark concealment areas.',
    costRange: {
      small: { min: 1000, max: 3000 },
      medium: { min: 3000, max: 10000 },
      large: { min: 10000, max: 30000 },
    },
    annualMaintenance: 0.08,
    effectivenessData: {
      shrinkageReduction: 0.08,
      source: 'CPTED Guidelines',
      confidence: 'medium',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime', 'customer_violence'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store', 'Luxury'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'adequate_lighting_exterior',
    name: 'Adequate Exterior Lighting',
    category: 'deterrence',
    description: 'Proper lighting in parking lots, entrances, and exterior areas deterring after-hours crime.',
    costRange: {
      small: { min: 2000, max: 5000 },
      medium: { min: 5000, max: 15000 },
      large: { min: 15000, max: 40000 },
    },
    annualMaintenance: 0.10,
    effectivenessData: {
      shrinkageReduction: 0.10,
      source: 'CPTED Guidelines / Insurance data',
      confidence: 'medium',
    },
    mitigatesThreats: ['after_hours_burglary', 'smash_and_grab', 'parking_lot_crime', 'armed_robbery'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store', 'Strip Mall'],
    },
    implementationTime: '1-3 weeks',
    vendorRequired: true,
  },
  {
    id: 'mirrors_blind_spots',
    name: 'Convex Mirrors - Blind Spots',
    category: 'deterrence',
    description: 'Convex mirrors providing visibility into blind spots and hard-to-monitor areas.',
    costRange: {
      small: { min: 200, max: 500 },
      medium: { min: 500, max: 1500 },
      large: { min: 1500, max: 4000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.06,
      source: 'Industry estimate',
      confidence: 'low',
    },
    mitigatesThreats: ['shoplifting'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service'],
    },
    implementationTime: '1-3 days',
    vendorRequired: false,
  },
  {
    id: 'greeter_program',
    name: 'Customer Greeter Program',
    category: 'deterrence',
    description: 'Staff positioned at entrance to greet customers, creating awareness of observation.',
    costRange: {
      small: { min: 15000, max: 25000 },
      medium: { min: 25000, max: 45000 },
      large: { min: 45000, max: 80000 },
    },
    annualMaintenance: 1.0,
    effectivenessData: {
      shrinkageReduction: 0.15,
      source: 'LPRC Store Observations Study',
      confidence: 'medium',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Department Store', 'Warehouse Club'],
    },
    implementationTime: '1 week',
    vendorRequired: false,
  },
  {
    id: 'employee_awareness_training',
    name: 'Employee LP Awareness Training',
    category: 'deterrence',
    description: 'Training programs making employees aware of shoplifting indicators and prevention techniques.',
    costRange: {
      small: { min: 500, max: 1500 },
      medium: { min: 1500, max: 4000 },
      large: { min: 4000, max: 10000 },
    },
    annualMaintenance: 0.50,
    effectivenessData: {
      shrinkageReduction: 0.10,
      source: 'NRF 2023 Security Survey',
      confidence: 'medium',
    },
    mitigatesThreats: ['shoplifting', 'employee_theft', 'return_fraud'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store', 'Specialty'],
    },
    implementationTime: '2-4 weeks',
    vendorRequired: false,
  },
  {
    id: 'bollards_storefront',
    name: 'Bollards - Storefront Protection',
    category: 'deterrence',
    description: 'Vehicle barrier posts protecting storefront from ram-raid and smash-and-grab attacks.',
    costRange: {
      small: { min: 3000, max: 8000 },
      medium: { min: 8000, max: 20000 },
      large: { min: 20000, max: 50000 },
    },
    annualMaintenance: 0.02,
    effectivenessData: {
      shrinkageReduction: 0.35,
      source: 'ASIS Vehicle Barrier Guidelines / Insurance data',
      confidence: 'high',
    },
    mitigatesThreats: ['smash_and_grab'],
    applicableWhen: {
      storeFormats: ['Strip Mall', 'Standalone', 'Big Box'],
      requiresCondition: 'hasStorefrontGlass',
    },
    implementationTime: '2-4 weeks',
    vendorRequired: true,
  },
  {
    id: 'security_gates_after_hours',
    name: 'Security Gates/Shutters (After Hours)',
    category: 'deterrence',
    description: 'Roll-down security gates or shutters protecting storefront during closed hours.',
    costRange: {
      small: { min: 2000, max: 5000 },
      medium: { min: 5000, max: 15000 },
      large: { min: 15000, max: 35000 },
    },
    annualMaintenance: 0.05,
    effectivenessData: {
      shrinkageReduction: 0.40,
      source: 'Insurance industry loss data',
      confidence: 'high',
    },
    mitigatesThreats: ['after_hours_burglary', 'smash_and_grab', 'vandalism'],
    applicableWhen: {
      storeFormats: ['Strip Mall', 'Mall', 'Standalone'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'time_delay_safe',
    name: 'Time-Delay Safe',
    category: 'deterrence',
    description: 'Safe with programmable time delay (5-10 minutes) deterring robbery by delaying cash access.',
    costRange: {
      small: { min: 1500, max: 3000 },
      medium: { min: 3000, max: 6000 },
      large: { min: 6000, max: 12000 },
    },
    annualMaintenance: 0.02,
    effectivenessData: {
      shrinkageReduction: 0.45,
      source: 'FBI Robbery Statistics / Insurance data',
      confidence: 'high',
    },
    mitigatesThreats: ['armed_robbery', 'cash_handling_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Convenience', 'Pharmacy'],
    },
    implementationTime: '1 week',
    vendorRequired: true,
  },
  {
    id: 'cash_limit_policy',
    name: 'Cash Limit - Registers',
    category: 'deterrence',
    description: 'Policy limiting cash in registers with regular drops to safe when limit is exceeded.',
    costRange: {
      small: { min: 0, max: 500 },
      medium: { min: 0, max: 1000 },
      large: { min: 0, max: 2000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.25,
      source: 'FBI Robbery Prevention Guidelines',
      confidence: 'high',
    },
    mitigatesThreats: ['armed_robbery', 'cash_handling_theft', 'employee_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Convenience', 'Pharmacy'],
    },
    implementationTime: '1 week',
    vendorRequired: false,
  },
  {
    id: 'employee_background_checks',
    name: 'Employee Background Checks',
    category: 'deterrence',
    description: 'Pre-employment criminal background checks for all employees handling merchandise or cash.',
    costRange: {
      small: { min: 500, max: 1500 },
      medium: { min: 1500, max: 4000 },
      large: { min: 4000, max: 12000 },
    },
    annualMaintenance: 0.80,
    effectivenessData: {
      shrinkageReduction: 0.18,
      source: 'UF National Retail Security Survey',
      confidence: 'medium',
    },
    mitigatesThreats: ['employee_theft', 'cash_handling_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store', 'Luxury'],
    },
    implementationTime: 'Ongoing',
    vendorRequired: true,
  },

  // -------------------------------------------------------------------------
  // DETECTION CONTROLS (18 controls)
  // -------------------------------------------------------------------------
  {
    id: 'eas_tags',
    name: 'EAS Tags/Labels',
    category: 'detection',
    description: 'Electronic Article Surveillance tags or labels attached to merchandise triggering exit alarms.',
    costRange: {
      small: { min: 1000, max: 3000 },
      medium: { min: 3000, max: 8000 },
      large: { min: 8000, max: 25000 },
    },
    annualMaintenance: 0.30,
    effectivenessData: {
      shrinkageReduction: 0.28,
      source: 'NRF 2023 National Retail Security Survey',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store', 'Apparel'],
      excludeWhen: ['Service Only', 'Behind Counter Only'],
    },
    implementationTime: 'Ongoing',
    vendorRequired: true,
  },
  {
    id: 'cctv_sales_floor',
    name: 'CCTV - Sales Floor Coverage',
    category: 'detection',
    description: 'Comprehensive camera coverage of retail sales floor capturing customer and employee activity.',
    costRange: {
      small: { min: 5000, max: 12000 },
      medium: { min: 12000, max: 35000 },
      large: { min: 35000, max: 100000 },
    },
    annualMaintenance: 0.12,
    effectivenessData: {
      shrinkageReduction: 0.22,
      source: 'LPRC Video Analytics Study 2022',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime', 'customer_violence', 'employee_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store', 'Luxury'],
    },
    implementationTime: '2-4 weeks',
    vendorRequired: true,
  },
  {
    id: 'cctv_pos_registers',
    name: 'CCTV - POS/Register Coverage',
    category: 'detection',
    description: 'Camera coverage of POS terminals capturing transactions and employee cash handling.',
    costRange: {
      small: { min: 2000, max: 5000 },
      medium: { min: 5000, max: 15000 },
      large: { min: 15000, max: 40000 },
    },
    annualMaintenance: 0.12,
    effectivenessData: {
      shrinkageReduction: 0.25,
      source: 'NRF 2023 Security Survey',
      confidence: 'high',
    },
    mitigatesThreats: ['employee_theft', 'cash_handling_theft', 'return_fraud', 'credit_card_fraud'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'cctv_cash_room',
    name: 'CCTV - Cash Room Coverage',
    category: 'detection',
    description: 'Camera coverage of cash counting room capturing all cash handling activities.',
    costRange: {
      small: { min: 1500, max: 3000 },
      medium: { min: 3000, max: 6000 },
      large: { min: 6000, max: 12000 },
    },
    annualMaintenance: 0.10,
    effectivenessData: {
      shrinkageReduction: 0.30,
      source: 'Industry estimate / Insurance data',
      confidence: 'medium',
    },
    mitigatesThreats: ['employee_theft', 'cash_handling_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1 week',
    vendorRequired: true,
  },
  {
    id: 'cctv_stockroom',
    name: 'CCTV - Stockroom Coverage',
    category: 'detection',
    description: 'Camera coverage of stockroom and receiving areas capturing inventory handling.',
    costRange: {
      small: { min: 2000, max: 5000 },
      medium: { min: 5000, max: 12000 },
      large: { min: 12000, max: 30000 },
    },
    annualMaintenance: 0.10,
    effectivenessData: {
      shrinkageReduction: 0.20,
      source: 'UF National Retail Security Survey',
      confidence: 'medium',
    },
    mitigatesThreats: ['employee_theft', 'inventory_shrinkage'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'cctv_parking_lot',
    name: 'CCTV - Parking Lot Coverage',
    category: 'detection',
    description: 'Camera coverage of parking areas for customer and employee safety and incident documentation.',
    costRange: {
      small: { min: 3000, max: 8000 },
      medium: { min: 8000, max: 20000 },
      large: { min: 20000, max: 60000 },
    },
    annualMaintenance: 0.12,
    effectivenessData: {
      shrinkageReduction: 0.15,
      source: 'LPRC Parking Lot Safety Study',
      confidence: 'medium',
    },
    mitigatesThreats: ['parking_lot_crime', 'armed_robbery', 'vandalism'],
    applicableWhen: {
      storeFormats: ['Strip Mall', 'Standalone', 'Big Box'],
    },
    implementationTime: '2-4 weeks',
    vendorRequired: true,
  },
  {
    id: 'cctv_entrance_exit',
    name: 'CCTV - Entrance/Exit Coverage',
    category: 'detection',
    description: 'Camera coverage at all store entrances capturing facial images for identification.',
    costRange: {
      small: { min: 2000, max: 5000 },
      medium: { min: 5000, max: 12000 },
      large: { min: 12000, max: 25000 },
    },
    annualMaintenance: 0.10,
    effectivenessData: {
      shrinkageReduction: 0.18,
      source: 'LPRC Video Analytics Study',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime', 'armed_robbery', 'after_hours_burglary'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store', 'Mall'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'facial_recognition',
    name: 'Facial Recognition System',
    category: 'detection',
    description: 'AI-powered facial recognition integrated with CCTV to identify known shoplifters and ORC suspects.',
    costRange: {
      small: { min: 10000, max: 25000 },
      medium: { min: 25000, max: 60000 },
      large: { min: 60000, max: 150000 },
    },
    annualMaintenance: 0.25,
    effectivenessData: {
      shrinkageReduction: 0.20,
      source: 'LPRC Facial Recognition Pilot 2023',
      confidence: 'medium',
    },
    mitigatesThreats: ['organized_retail_crime', 'return_fraud'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Department Store', 'Luxury'],
      requiresCondition: 'hasHighValueMerchandise',
    },
    implementationTime: '4-8 weeks',
    vendorRequired: true,
  },
  {
    id: 'pos_exception_reporting',
    name: 'POS Exception-Based Reporting',
    category: 'detection',
    description: 'Software analyzing POS transactions to identify suspicious patterns and employee theft indicators.',
    costRange: {
      small: { min: 5000, max: 12000 },
      medium: { min: 12000, max: 30000 },
      large: { min: 30000, max: 75000 },
    },
    annualMaintenance: 0.20,
    effectivenessData: {
      shrinkageReduction: 0.35,
      source: 'NRF 2023 Security Survey',
      confidence: 'high',
    },
    mitigatesThreats: ['employee_theft', 'cash_handling_theft', 'return_fraud', 'credit_card_fraud'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '4-8 weeks',
    vendorRequired: true,
  },
  {
    id: 'lp_plain_clothes',
    name: 'Plain-Clothes Loss Prevention',
    category: 'detection',
    description: 'Plain-clothes LP officers conducting floor surveillance and making apprehensions.',
    costRange: {
      small: { min: 35000, max: 55000 },
      medium: { min: 55000, max: 95000 },
      large: { min: 95000, max: 180000 },
    },
    annualMaintenance: 1.0,
    effectivenessData: {
      shrinkageReduction: 0.40,
      source: 'LPRC LP Staffing ROI Study',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime', 'employee_theft'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Department Store', 'Luxury', 'Electronics'],
      requiresCondition: 'hasHighValueMerchandise',
    },
    implementationTime: '2-4 weeks',
    vendorRequired: false,
  },
  {
    id: 'self_checkout_monitoring',
    name: 'Self-Checkout Monitoring System',
    category: 'detection',
    description: 'AI-powered monitoring of self-checkout stations detecting scan avoidance and sweethearting.',
    costRange: {
      small: { min: 8000, max: 20000 },
      medium: { min: 20000, max: 50000 },
      large: { min: 50000, max: 120000 },
    },
    annualMaintenance: 0.18,
    effectivenessData: {
      shrinkageReduction: 0.45,
      source: 'LPRC Self-Checkout Loss Study 2023',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'display_tampering'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Grocery', 'Warehouse Club'],
      requiresCondition: 'hasSelfCheckout',
    },
    implementationTime: '4-8 weeks',
    vendorRequired: true,
  },
  {
    id: 'alarm_intrusion',
    name: 'Intrusion Detection System',
    category: 'detection',
    description: 'Alarm system monitoring entry points, motion, and glass break during closed hours.',
    costRange: {
      small: { min: 2000, max: 5000 },
      medium: { min: 5000, max: 12000 },
      large: { min: 12000, max: 30000 },
    },
    annualMaintenance: 0.15,
    effectivenessData: {
      shrinkageReduction: 0.50,
      source: 'Insurance industry data',
      confidence: 'high',
    },
    mitigatesThreats: ['after_hours_burglary', 'smash_and_grab'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Strip Mall', 'Standalone'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'alarm_panic_buttons',
    name: 'Panic/Duress Alarm Buttons',
    category: 'detection',
    description: 'Silent panic buttons at registers and manager office for robbery/emergency activation.',
    costRange: {
      small: { min: 500, max: 1500 },
      medium: { min: 1500, max: 4000 },
      large: { min: 4000, max: 10000 },
    },
    annualMaintenance: 0.10,
    effectivenessData: {
      shrinkageReduction: 0.15,
      source: 'FBI Robbery Prevention Guidelines',
      confidence: 'medium',
    },
    mitigatesThreats: ['armed_robbery', 'customer_violence'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Convenience', 'Pharmacy', 'Jewelry'],
    },
    implementationTime: '1 week',
    vendorRequired: true,
  },
  {
    id: 'inventory_rfid',
    name: 'RFID Inventory Tracking',
    category: 'detection',
    description: 'Radio frequency identification tags for real-time inventory visibility and shrinkage detection.',
    costRange: {
      small: { min: 15000, max: 35000 },
      medium: { min: 35000, max: 90000 },
      large: { min: 90000, max: 250000 },
    },
    annualMaintenance: 0.25,
    effectivenessData: {
      shrinkageReduction: 0.25,
      source: 'Auburn University RFID Lab Studies',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime', 'employee_theft', 'inventory_shrinkage'],
    applicableWhen: {
      storeFormats: ['Apparel', 'Department Store', 'Big Box'],
    },
    implementationTime: '8-16 weeks',
    vendorRequired: true,
  },
  {
    id: 'cycle_counting',
    name: 'Inventory Cycle Counting',
    category: 'detection',
    description: 'Regular partial inventory counts to identify shrinkage patterns and discrepancies.',
    costRange: {
      small: { min: 500, max: 2000 },
      medium: { min: 2000, max: 6000 },
      large: { min: 6000, max: 15000 },
    },
    annualMaintenance: 1.0,
    effectivenessData: {
      shrinkageReduction: 0.15,
      source: 'NRF Inventory Management Best Practices',
      confidence: 'medium',
    },
    mitigatesThreats: ['employee_theft', 'inventory_shrinkage'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: 'Ongoing',
    vendorRequired: false,
  },
  {
    id: 'dressing_room_attendant',
    name: 'Dressing Room Attendant',
    category: 'detection',
    description: 'Staffed fitting room with attendant controlling access, counting items, and monitoring for concealment.',
    costRange: {
      small: { min: 20000, max: 35000 },
      medium: { min: 35000, max: 60000 },
      large: { min: 60000, max: 100000 },
    },
    annualMaintenance: 1.0,
    effectivenessData: {
      shrinkageReduction: 0.35,
      source: 'LPRC Fitting Room Study',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Apparel', 'Department Store'],
      requiresCondition: 'hasDressingRooms',
    },
    implementationTime: '1 week',
    vendorRequired: false,
  },
  {
    id: 'refund_authorization',
    name: 'Refund Authorization Controls',
    category: 'detection',
    description: 'Multi-level authorization for refunds based on amount, payment method, and return circumstances.',
    costRange: {
      small: { min: 0, max: 500 },
      medium: { min: 500, max: 2000 },
      large: { min: 2000, max: 5000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.30,
      source: 'NRF Return Fraud Survey 2023',
      confidence: 'high',
    },
    mitigatesThreats: ['return_fraud', 'employee_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: false,
  },
  {
    id: 'receipt_checking',
    name: 'Receipt Checking Policy',
    category: 'detection',
    description: 'Policy for checking customer receipts against merchandise at exit points.',
    costRange: {
      small: { min: 0, max: 500 },
      medium: { min: 500, max: 2000 },
      large: { min: 2000, max: 5000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.12,
      source: 'Industry estimate',
      confidence: 'low',
    },
    mitigatesThreats: ['shoplifting', 'display_tampering'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Warehouse Club', 'Electronics'],
    },
    implementationTime: '1 week',
    vendorRequired: false,
  },

  // -------------------------------------------------------------------------
  // DELAY CONTROLS (12 controls)
  // -------------------------------------------------------------------------
  {
    id: 'display_case_locks',
    name: 'Locking Display Cases',
    category: 'delay',
    description: 'Locked display cases for high-value merchandise requiring employee assistance.',
    costRange: {
      small: { min: 2000, max: 6000 },
      medium: { min: 6000, max: 18000 },
      large: { min: 18000, max: 50000 },
    },
    annualMaintenance: 0.05,
    effectivenessData: {
      shrinkageReduction: 0.60,
      source: 'LPRC Protected Merchandise Study',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime', 'smash_and_grab'],
    applicableWhen: {
      storeFormats: ['Electronics', 'Jewelry', 'Pharmacy', 'Luxury'],
      requiresCondition: 'hasHighValueMerchandise',
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'spider_wraps',
    name: 'Spider Wraps/Security Boxes',
    category: 'delay',
    description: 'Reusable security wraps and boxes for high-theft items triggering EAS alarms if removed.',
    costRange: {
      small: { min: 1000, max: 3000 },
      medium: { min: 3000, max: 8000 },
      large: { min: 8000, max: 20000 },
    },
    annualMaintenance: 0.15,
    effectivenessData: {
      shrinkageReduction: 0.45,
      source: 'LPRC Spider Wrap Study',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Electronics', 'Big Box', 'Department Store'],
      requiresCondition: 'hasHighValueMerchandise',
    },
    implementationTime: 'Ongoing',
    vendorRequired: true,
  },
  {
    id: 'cable_locks_tethers',
    name: 'Cable Locks/Tethers',
    category: 'delay',
    description: 'Physical tethers and cables securing merchandise to fixtures preventing grab-and-run.',
    costRange: {
      small: { min: 500, max: 1500 },
      medium: { min: 1500, max: 4000 },
      large: { min: 4000, max: 12000 },
    },
    annualMaintenance: 0.10,
    effectivenessData: {
      shrinkageReduction: 0.50,
      source: 'LPRC Merchandise Protection Study',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Electronics', 'Sporting Goods', 'Department Store'],
      requiresCondition: 'hasHighValueMerchandise',
    },
    implementationTime: 'Ongoing',
    vendorRequired: true,
  },
  {
    id: 'keeper_cases',
    name: 'Keeper Cases',
    category: 'delay',
    description: 'Locking plastic cases surrounding individual high-theft items requiring employee removal at checkout.',
    costRange: {
      small: { min: 800, max: 2000 },
      medium: { min: 2000, max: 5000 },
      large: { min: 5000, max: 15000 },
    },
    annualMaintenance: 0.12,
    effectivenessData: {
      shrinkageReduction: 0.55,
      source: 'LPRC Protected Merchandise Study',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Pharmacy', 'Grocery', 'Big Box'],
    },
    implementationTime: 'Ongoing',
    vendorRequired: true,
  },
  {
    id: 'high_value_lockup',
    name: 'High-Value Lockup/Cage',
    category: 'delay',
    description: 'Secure lockup area or cage in stockroom for high-value merchandise with restricted access.',
    costRange: {
      small: { min: 3000, max: 8000 },
      medium: { min: 8000, max: 20000 },
      large: { min: 20000, max: 50000 },
    },
    annualMaintenance: 0.03,
    effectivenessData: {
      shrinkageReduction: 0.40,
      source: 'Industry estimate / Insurance data',
      confidence: 'medium',
    },
    mitigatesThreats: ['employee_theft', 'after_hours_burglary'],
    applicableWhen: {
      storeFormats: ['Electronics', 'Big Box', 'Department Store'],
      requiresCondition: 'hasHighValueMerchandise',
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'reinforced_doors',
    name: 'Reinforced Entrance Doors',
    category: 'delay',
    description: 'Commercial-grade doors with reinforced frames and high-security locks resisting forced entry.',
    costRange: {
      small: { min: 3000, max: 8000 },
      medium: { min: 8000, max: 18000 },
      large: { min: 18000, max: 40000 },
    },
    annualMaintenance: 0.02,
    effectivenessData: {
      shrinkageReduction: 0.35,
      source: 'Insurance industry data',
      confidence: 'high',
    },
    mitigatesThreats: ['after_hours_burglary', 'smash_and_grab'],
    applicableWhen: {
      storeFormats: ['Strip Mall', 'Standalone', 'Big Box'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'drop_safe',
    name: 'Drop Safe',
    category: 'delay',
    description: 'Secure safe with deposit slot for register drops, reducing accessible cash during robbery.',
    costRange: {
      small: { min: 800, max: 2000 },
      medium: { min: 2000, max: 4000 },
      large: { min: 4000, max: 8000 },
    },
    annualMaintenance: 0.02,
    effectivenessData: {
      shrinkageReduction: 0.30,
      source: 'FBI Robbery Prevention Guidelines',
      confidence: 'high',
    },
    mitigatesThreats: ['armed_robbery', 'cash_handling_theft', 'employee_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Convenience', 'Pharmacy'],
    },
    implementationTime: '1 week',
    vendorRequired: true,
  },
  {
    id: 'stockroom_access_control',
    name: 'Stockroom Access Control',
    category: 'delay',
    description: 'Restricted access to stockroom with locks, badge readers, or keypad entry.',
    costRange: {
      small: { min: 1500, max: 4000 },
      medium: { min: 4000, max: 10000 },
      large: { min: 10000, max: 25000 },
    },
    annualMaintenance: 0.08,
    effectivenessData: {
      shrinkageReduction: 0.22,
      source: 'Industry estimate',
      confidence: 'medium',
    },
    mitigatesThreats: ['employee_theft', 'shoplifting'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'cash_room_access',
    name: 'Cash Room Access Control',
    category: 'delay',
    description: 'Restricted access to cash counting room with multi-factor authentication and audit logging.',
    costRange: {
      small: { min: 2000, max: 5000 },
      medium: { min: 5000, max: 12000 },
      large: { min: 12000, max: 25000 },
    },
    annualMaintenance: 0.08,
    effectivenessData: {
      shrinkageReduction: 0.28,
      source: 'Insurance industry data',
      confidence: 'medium',
    },
    mitigatesThreats: ['employee_theft', 'cash_handling_theft', 'armed_robbery'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Department Store', 'Grocery'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
  {
    id: 'key_control',
    name: 'Key Control System',
    category: 'delay',
    description: 'Systematic key management including logs, restricted duplication, and periodic rekeying.',
    costRange: {
      small: { min: 500, max: 1500 },
      medium: { min: 1500, max: 4000 },
      large: { min: 4000, max: 10000 },
    },
    annualMaintenance: 0.15,
    effectivenessData: {
      shrinkageReduction: 0.15,
      source: 'Industry estimate',
      confidence: 'low',
    },
    mitigatesThreats: ['employee_theft', 'after_hours_burglary'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: false,
  },
  {
    id: 'item_count_policy',
    name: 'Item Count Policy (Dressing Room)',
    category: 'delay',
    description: 'Policy limiting items taken into dressing rooms with counting verification.',
    costRange: {
      small: { min: 0, max: 200 },
      medium: { min: 0, max: 500 },
      large: { min: 0, max: 1000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.18,
      source: 'LPRC Fitting Room Study',
      confidence: 'medium',
    },
    mitigatesThreats: ['shoplifting'],
    applicableWhen: {
      storeFormats: ['Apparel', 'Department Store'],
      requiresCondition: 'hasDressingRooms',
    },
    implementationTime: '1 week',
    vendorRequired: false,
  },
  {
    id: 'behind_counter_merchandise',
    name: 'Behind-Counter Merchandise',
    category: 'delay',
    description: 'High-theft items stored behind counter requiring employee assistance for purchase.',
    costRange: {
      small: { min: 1000, max: 3000 },
      medium: { min: 3000, max: 8000 },
      large: { min: 8000, max: 20000 },
    },
    annualMaintenance: 0.02,
    effectivenessData: {
      shrinkageReduction: 0.70,
      source: 'Pharmacy industry data',
      confidence: 'high',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Pharmacy', 'Convenience', 'Tobacco/Vape'],
      requiresCondition: 'hasHighValueMerchandise',
    },
    implementationTime: '1-2 weeks',
    vendorRequired: false,
  },

  // -------------------------------------------------------------------------
  // RESPONSE CONTROLS (10 controls)
  // -------------------------------------------------------------------------
  {
    id: 'robbery_response_training',
    name: 'Robbery Response Training',
    category: 'response',
    description: 'Employee training on robbery response emphasizing compliance, safety, and post-incident protocols.',
    costRange: {
      small: { min: 500, max: 1500 },
      medium: { min: 1500, max: 4000 },
      large: { min: 4000, max: 10000 },
    },
    annualMaintenance: 0.50,
    effectivenessData: {
      shrinkageReduction: 0.10,
      source: 'FBI Robbery Prevention Guidelines',
      confidence: 'medium',
    },
    mitigatesThreats: ['armed_robbery', 'customer_violence'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Convenience', 'Pharmacy', 'Jewelry'],
    },
    implementationTime: '2-4 weeks',
    vendorRequired: false,
  },
  {
    id: 'de_escalation_training',
    name: 'De-escalation Training',
    category: 'response',
    description: 'Training employees on techniques to de-escalate confrontational situations with customers.',
    costRange: {
      small: { min: 500, max: 1500 },
      medium: { min: 1500, max: 4000 },
      large: { min: 4000, max: 10000 },
    },
    annualMaintenance: 0.50,
    effectivenessData: {
      shrinkageReduction: 0.08,
      source: 'ASIS Workplace Violence Prevention',
      confidence: 'medium',
    },
    mitigatesThreats: ['customer_violence'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '2-4 weeks',
    vendorRequired: false,
  },
  {
    id: 'closing_two_person',
    name: 'Two-Person Closing Procedures',
    category: 'response',
    description: 'Requirement for minimum two employees during closing for safety and theft prevention.',
    costRange: {
      small: { min: 0, max: 500 },
      medium: { min: 0, max: 1000 },
      large: { min: 0, max: 2000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.20,
      source: 'OSHA Guidelines / Industry best practice',
      confidence: 'medium',
    },
    mitigatesThreats: ['armed_robbery', 'employee_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Convenience', 'Pharmacy'],
    },
    implementationTime: '1 week',
    vendorRequired: false,
  },
  {
    id: 'apprehension_policy',
    name: 'Shoplifter Apprehension Policy',
    category: 'response',
    description: 'Documented policy for LP staff on when and how to make shoplifter apprehensions safely.',
    costRange: {
      small: { min: 1000, max: 3000 },
      medium: { min: 3000, max: 8000 },
      large: { min: 8000, max: 15000 },
    },
    annualMaintenance: 0.10,
    effectivenessData: {
      shrinkageReduction: 0.15,
      source: 'ASIS LP Guidelines',
      confidence: 'medium',
    },
    mitigatesThreats: ['shoplifting', 'organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Department Store', 'Electronics'],
    },
    implementationTime: '2-4 weeks',
    vendorRequired: false,
  },
  {
    id: 'orc_task_force',
    name: 'ORC Task Force Participation',
    category: 'response',
    description: 'Participation in regional organized retail crime task forces for intelligence sharing and prosecution.',
    costRange: {
      small: { min: 500, max: 2000 },
      medium: { min: 2000, max: 5000 },
      large: { min: 5000, max: 15000 },
    },
    annualMaintenance: 1.0,
    effectivenessData: {
      shrinkageReduction: 0.12,
      source: 'NRF ORC Survey 2023',
      confidence: 'medium',
    },
    mitigatesThreats: ['organized_retail_crime'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Department Store', 'Pharmacy'],
    },
    implementationTime: 'Ongoing',
    vendorRequired: false,
  },
  {
    id: 'law_enforcement_liaison',
    name: 'Law Enforcement Liaison Program',
    category: 'response',
    description: 'Established relationship with local law enforcement for rapid response and prosecution support.',
    costRange: {
      small: { min: 0, max: 500 },
      medium: { min: 0, max: 1000 },
      large: { min: 0, max: 2000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.08,
      source: 'Industry best practice',
      confidence: 'low',
    },
    mitigatesThreats: ['armed_robbery', 'organized_retail_crime', 'smash_and_grab'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '2-4 weeks',
    vendorRequired: false,
  },
  {
    id: 'incident_reporting',
    name: 'Incident Reporting System',
    category: 'response',
    description: 'Formal system for documenting and tracking all security incidents for trend analysis.',
    costRange: {
      small: { min: 0, max: 500 },
      medium: { min: 500, max: 2000 },
      large: { min: 2000, max: 8000 },
    },
    annualMaintenance: 0.20,
    effectivenessData: {
      shrinkageReduction: 0.10,
      source: 'Industry best practice',
      confidence: 'low',
    },
    mitigatesThreats: ['shoplifting', 'employee_theft', 'customer_violence', 'armed_robbery'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '2-4 weeks',
    vendorRequired: false,
  },
  {
    id: 'dual_control_cash',
    name: 'Dual Control Cash Procedures',
    category: 'response',
    description: 'Two-person requirement for cash counting, safe access, and large transactions.',
    costRange: {
      small: { min: 0, max: 500 },
      medium: { min: 0, max: 1000 },
      large: { min: 0, max: 2000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.25,
      source: 'ASIS Cash Handling Guidelines',
      confidence: 'high',
    },
    mitigatesThreats: ['employee_theft', 'cash_handling_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1 week',
    vendorRequired: false,
  },
  {
    id: 'bag_check_policy',
    name: 'Employee Bag Check Policy',
    category: 'response',
    description: 'Policy for checking employee bags and packages when leaving the store.',
    costRange: {
      small: { min: 0, max: 200 },
      medium: { min: 0, max: 500 },
      large: { min: 0, max: 1000 },
    },
    annualMaintenance: 0.0,
    effectivenessData: {
      shrinkageReduction: 0.12,
      source: 'Industry estimate',
      confidence: 'low',
    },
    mitigatesThreats: ['employee_theft'],
    applicableWhen: {
      storeFormats: ['Open Shelving', 'Self-Service', 'Big Box', 'Department Store'],
    },
    implementationTime: '1 week',
    vendorRequired: false,
  },
  {
    id: 'armored_car_service',
    name: 'Armored Car Service',
    category: 'response',
    description: 'Professional armored car service for cash pickup/delivery reducing robbery and theft risk.',
    costRange: {
      small: { min: 3000, max: 6000 },
      medium: { min: 6000, max: 12000 },
      large: { min: 12000, max: 25000 },
    },
    annualMaintenance: 1.0,
    effectivenessData: {
      shrinkageReduction: 0.30,
      source: 'Insurance industry data',
      confidence: 'high',
    },
    mitigatesThreats: ['armed_robbery', 'cash_handling_theft'],
    applicableWhen: {
      storeFormats: ['Big Box', 'Department Store', 'Grocery', 'Jewelry'],
    },
    implementationTime: '1-2 weeks',
    vendorRequired: true,
  },
];

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Determine store size category from square footage
 */
function getStoreSize(squareFootage: number): StoreSize {
  if (squareFootage < 5000) return 'small';
  if (squareFootage <= 20000) return 'medium';
  return 'large';
}

/**
 * Get controls applicable to a specific store profile
 */
export function getApplicableControls(storeProfile: StoreProfile): RetailControl[] {
  return RETAIL_CONTROLS.filter((control) => {
    const { applicableWhen } = control;

    // Check if store format matches
    if (!applicableWhen.storeFormats.some((format) =>
      storeProfile.storeFormat.toLowerCase().includes(format.toLowerCase()) ||
      format.toLowerCase() === 'open shelving' // Default applicable
    )) {
      return false;
    }

    // Check exclusions
    if (applicableWhen.excludeWhen?.some((exclude) =>
      storeProfile.storeFormat.toLowerCase().includes(exclude.toLowerCase())
    )) {
      return false;
    }

    // Check required conditions
    if (applicableWhen.requiresCondition) {
      switch (applicableWhen.requiresCondition) {
        case 'hasHighValueMerchandise':
          if (!storeProfile.hasHighValueMerchandise) return false;
          break;
        case 'hasDressingRooms':
          if (!storeProfile.hasDressingRooms) return false;
          break;
        case 'hasSelfCheckout':
          if (!storeProfile.hasSelfCheckout) return false;
          break;
        case 'hasStorefrontGlass':
          // Assume true for most retail formats
          break;
      }
    }

    return true;
  });
}

/**
 * Get controls that mitigate a specific threat
 */
export function getControlsForThreat(threatId: string): RetailControl[] {
  return RETAIL_CONTROLS.filter((control) =>
    control.mitigatesThreats.includes(threatId)
  );
}

/**
 * Calculate ROI for a control given store metrics
 */
export function calculateControlROI(
  control: RetailControl,
  storeProfile: StoreProfile,
  currentShrinkageRate: number,
  annualRevenue: number
): ROICalculation {
  const storeSize = getStoreSize(storeProfile.squareFootage);
  const costRange = control.costRange[storeSize];

  // Use midpoint of cost range
  const implementationCost = (costRange.min + costRange.max) / 2;
  const annualMaintenanceCost = implementationCost * control.annualMaintenance;

  // Calculate current annual shrinkage loss
  const currentAnnualLoss = annualRevenue * currentShrinkageRate;

  // Estimate savings based on control effectiveness
  const estimatedReduction = control.effectivenessData.shrinkageReduction;
  const estimatedAnnualSavings = currentAnnualLoss * estimatedReduction;

  // Calculate payback period
  const netFirstYearSavings = estimatedAnnualSavings - annualMaintenanceCost;
  const paybackPeriodMonths = netFirstYearSavings > 0
    ? Math.ceil((implementationCost / netFirstYearSavings) * 12)
    : 999; // Never pays back

  // Calculate 5-year ROI
  const totalCost = implementationCost + (annualMaintenanceCost * 5);
  const totalSavings = estimatedAnnualSavings * 5;
  const fiveYearROI = totalCost > 0 ? ((totalSavings - totalCost) / totalCost) * 100 : 0;

  return {
    controlId: control.id,
    controlName: control.name,
    implementationCost: Math.round(implementationCost),
    annualMaintenanceCost: Math.round(annualMaintenanceCost),
    estimatedAnnualSavings: Math.round(estimatedAnnualSavings),
    paybackPeriodMonths,
    fiveYearROI: Math.round(fiveYearROI),
    confidence: control.effectivenessData.confidence,
  };
}

/**
 * Generate control recommendations based on identified gaps
 */
export function generateControlRecommendations(
  surveyResponses: SurveyResponses,
  storeProfile: StoreProfile,
  identifiedThreats: ThreatAssessment[]
): ControlRecommendation[] {
  const recommendations: ControlRecommendation[] = [];
  const applicableControls = getApplicableControls(storeProfile);

  // Identify priority threats (high and critical)
  const priorityThreats = identifiedThreats
    .filter((t) => t.riskLevel === 'critical' || t.riskLevel === 'high')
    .map((t) => t.threatId);

  // For each applicable control, check if it addresses gaps
  for (const control of applicableControls) {
    // Check if control addresses priority threats
    const addressedThreats = control.mitigatesThreats.filter((t) =>
      priorityThreats.includes(t)
    );

    if (addressedThreats.length === 0) continue;

    // Check if control is already implemented based on survey responses
    const isImplemented = checkControlImplementation(control.id, surveyResponses);
    if (isImplemented) continue;

    // Calculate ROI
    const roi = calculateControlROI(
      control,
      storeProfile,
      storeProfile.currentShrinkageRate || 0.015, // Default 1.5%
      storeProfile.annualRevenue
    );

    // Determine priority based on threats addressed and ROI
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
    const criticalThreatsAddressed = addressedThreats.filter((t) =>
      identifiedThreats.find((it) => it.threatId === t && it.riskLevel === 'critical')
    );

    if (criticalThreatsAddressed.length > 0 && roi.paybackPeriodMonths < 12) {
      priority = 'critical';
    } else if (addressedThreats.length >= 2 || roi.paybackPeriodMonths < 18) {
      priority = 'high';
    } else if (addressedThreats.length >= 1 || roi.paybackPeriodMonths < 36) {
      priority = 'medium';
    }

    // Generate rationale
    const threatNames = addressedThreats.map((t) =>
      identifiedThreats.find((it) => it.threatId === t)?.threatName || t
    );

    const rationale = `Addresses ${threatNames.join(', ')}. ` +
      `Expected ${Math.round(control.effectivenessData.shrinkageReduction * 100)}% shrinkage reduction. ` +
      `Payback in ${roi.paybackPeriodMonths} months. ` +
      `Source: ${control.effectivenessData.source}.`;

    recommendations.push({
      control,
      priority,
      rationale,
      estimatedROI: roi,
      addressesThreats: addressedThreats,
    });
  }

  // Sort by priority and ROI
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.estimatedROI.paybackPeriodMonths - b.estimatedROI.paybackPeriodMonths;
  });
}

/**
 * Check if a control is already implemented based on survey responses
 */
function checkControlImplementation(
  controlId: string,
  responses: SurveyResponses
): boolean {
  // Map control IDs to survey response keys
  const controlResponseMap: Record<string, string[]> = {
    eas_pedestals: ['eas_1'],
    eas_tags: ['eas_1'],
    cctv_sales_floor: ['cctv_1'],
    cctv_pos_registers: ['cctv_3'],
    cctv_cash_room: ['cctv_4'],
    cctv_stockroom: ['cctv_5'],
    alarm_intrusion: ['physical_5'],
    alarm_panic_buttons: ['physical_6'],
    security_guard_uniformed: ['lp_staff_1'],
    lp_plain_clothes: ['lp_staff_1'],
    robbery_response_training: ['employee_3'],
    closing_two_person: ['employee_5'],
    employee_background_checks: ['employee_1'],
    refund_authorization: ['refunds_1'],
    time_delay_safe: ['cash_2'],
    drop_safe: ['cash_7'],
  };

  const responseKeys = controlResponseMap[controlId];
  if (!responseKeys) return false;

  return responseKeys.some((key) => {
    const response = responses[key];
    if (typeof response === 'string') {
      return response.toLowerCase() === 'yes' ||
             response.toLowerCase().includes('yes') ||
             !response.toLowerCase().includes('no');
    }
    return response === true;
  });
}

/**
 * Get all controls grouped by category
 */
export function getControlsByCategory(): Record<ControlCategory, RetailControl[]> {
  const grouped: Record<ControlCategory, RetailControl[]> = {
    deterrence: [],
    detection: [],
    delay: [],
    response: [],
  };

  for (const control of RETAIL_CONTROLS) {
    grouped[control.category].push(control);
  }

  return grouped;
}

/**
 * Get control effectiveness summary for reporting
 */
export function getControlEffectivenessSummary(): {
  category: ControlCategory;
  avgEffectiveness: number;
  controlCount: number;
  sources: string[];
}[] {
  const categories: ControlCategory[] = ['deterrence', 'detection', 'delay', 'response'];

  return categories.map((category) => {
    const categoryControls = RETAIL_CONTROLS.filter((c) => c.category === category);
    const avgEffectiveness = categoryControls.reduce(
      (sum, c) => sum + c.effectivenessData.shrinkageReduction,
      0
    ) / categoryControls.length;

    const sources = [...new Set(categoryControls.map((c) => c.effectivenessData.source))];

    return {
      category,
      avgEffectiveness: Math.round(avgEffectiveness * 100) / 100,
      controlCount: categoryControls.length,
      sources,
    };
  });
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  RETAIL_CONTROLS,
  getApplicableControls,
  getControlsForThreat,
  calculateControlROI,
  generateControlRecommendations,
  getControlsByCategory,
  getControlEffectivenessSummary,
};
