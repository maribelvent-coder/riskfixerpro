/**
 * Office Building Interview Risk Mapper - SCHEMA CORRECTED VERSION
 *
 * Implements the T×V×I calculation pipeline per RiskFixer Office Building Framework.
 * Transforms interview questionnaire responses into mathematically-derived risk scenarios.
 *
 * CRITICAL SCHEMA CORRECTIONS (vs. framework documentation):
 * - Uses `likelihoodScore` (real) instead of separate threatLikelihood + vulnerability columns
 * - Uses `impactScore` (real) instead of impact column
 * - Uses existing `inherentRisk`, `residualRisk`, `controlEffectiveness` columns
 * - Queries `facility_survey_questions.response` (jsonb) for interview data
 * - Uses text columns (scenario, threatDescription, vulnerabilityDescription) for descriptions
 *
 * @author RiskFixer Team
 * @version 2.0 - Schema Corrected
 * @see RiskFixer-Office-Building-Framework.md
 */

import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import {
  assessments,
  riskScenarios,
  threatLibrary,
  facilitySurveyQuestions,
} from "@shared/schema";

// ============================================================================
// INTERFACES - ALIGNED WITH ACTUAL DATABASE SCHEMA
// ============================================================================

export type InterviewResponses = Record<string, any>;

export interface InterviewRiskMapping {
  assessmentId: string;
  interviewResponses: InterviewResponses;
  threatId: string;
}

/**
 * Calculated risk inputs - internal use during calculation
 * Note: T×V are combined into likelihoodScore for database storage
 */
export interface CalculatedRiskInputs {
  threatLikelihood: number; // 1-5 (internal calculation)
  vulnerability: number; // 1-5 (internal calculation)
  impact: number; // 1-5 (stored as impactScore)
  combinedLikelihood: number; // T × V combined for likelihoodScore
  inherentRisk: number; // likelihoodScore × impactScore (1-25 scale)
  riskLevel: "critical" | "high" | "medium" | "low";
  suggestedControls: string[];
}

/**
 * Risk scenario data structure - ALIGNED WITH ACTUAL SCHEMA
 * Uses columns that actually exist in the database
 */
export interface NewRiskScenario {
  assessmentId: string;
  threatLibraryId: string | null;

  // CORRECTED: Using actual column names
  likelihoodScore: number; // Combined T×V (real, 1-5 scale)
  impactScore: number; // Impact (real, 1-5 scale)
  inherentRisk: number; // likelihoodScore × impactScore (1-25)
  residualRisk: number; // Initially same as inherent
  controlEffectiveness: number;
  riskLevel: string;

  // Required text columns from schema
  scenario: string; // Main scenario description
  asset: string; // Required text column
  likelihood: string; // Required text column
  impact: string; // Required text column
  threatDescription: string | null; // Optional - threat-specific details
  vulnerabilityDescription: string | null; // Optional - vulnerability findings
}

export interface GeneratedScenarioResult {
  success: boolean;
  generatedScenarios: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScenarioIds: string[];
}

// ============================================================================
// OFFICE BUILDING THREAT DEFINITIONS
// ============================================================================

export const OFFICE_BUILDING_THREATS = [
  {
    id: "forced_entry",
    name: "Unauthorized Entry - Forced Entry",
    category: "Physical Intrusion",
    typicalLikelihood: 3,
    typicalImpact: 4,
    asisCode: "PSC.1-2012-INT-001",
  },
  {
    id: "tailgating",
    name: "Unauthorized Entry - Tailgating",
    category: "Physical Intrusion",
    typicalLikelihood: 4,
    typicalImpact: 3,
    asisCode: "PSC.1-2012-INT-002",
  },
  {
    id: "piggybacking",
    name: "Unauthorized Entry - Piggybacking",
    category: "Physical Intrusion",
    typicalLikelihood: 4,
    typicalImpact: 3,
    asisCode: "PSC.1-2012-INT-003",
  },
  {
    id: "theft_property",
    name: "Theft - Property/Equipment",
    category: "Theft",
    typicalLikelihood: 3,
    typicalImpact: 3,
    asisCode: "PSC.1-2012-THF-001",
  },
  {
    id: "theft_intellectual_property",
    name: "Theft - Intellectual Property",
    category: "Theft",
    typicalLikelihood: 2,
    typicalImpact: 5,
    asisCode: "PSC.1-2012-THF-002",
  },
  {
    id: "vandalism",
    name: "Vandalism - Property Damage",
    category: "Vandalism",
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: "PSC.1-2012-VAN-001",
  },
  {
    id: "sabotage",
    name: "Sabotage - Operational Disruption",
    category: "Sabotage",
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: "PSC.1-2012-SAB-001",
  },
  {
    id: "workplace_violence_active_threat",
    name: "Workplace Violence - Active Threat",
    category: "Workplace Violence",
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: "PSC.1-2012-WPV-001",
  },
  {
    id: "workplace_violence_employee",
    name: "Workplace Violence - Employee Conflict",
    category: "Workplace Violence",
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: "PSC.1-2012-WPV-002",
  },
  {
    id: "workplace_violence_domestic",
    name: "Workplace Violence - Domestic Violence Spillover",
    category: "Workplace Violence",
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: "PSC.1-2012-WPV-003",
  },
  {
    id: "cyber_physical_access_hack",
    name: "Cyber-Physical - Access Control Hack",
    category: "Cyber-Physical",
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: "PSC.1-2012-CYB-001",
  },
  {
    id: "cyber_physical_cctv",
    name: "Cyber-Physical - CCTV System Compromise",
    category: "Cyber-Physical",
    typicalLikelihood: 2,
    typicalImpact: 3,
    asisCode: "PSC.1-2012-CYB-002",
  },
  {
    id: "espionage_surveillance",
    name: "Espionage - Technical Surveillance",
    category: "Espionage",
    typicalLikelihood: 1,
    typicalImpact: 4,
    asisCode: "PSC.1-2012-ESP-001",
  },
  {
    id: "natural_disaster_earthquake",
    name: "Natural Disaster - Earthquake",
    category: "Natural Disaster",
    typicalLikelihood: 1,
    typicalImpact: 5,
    asisCode: "PSC.1-2012-NAT-001",
  },
  {
    id: "natural_disaster_flood",
    name: "Natural Disaster - Flood",
    category: "Natural Disaster",
    typicalLikelihood: 2,
    typicalImpact: 4,
    asisCode: "PSC.1-2012-NAT-002",
  },
];

// ============================================================================
// THREAT-TO-CONTROL MAPPING
// ============================================================================

export const THREAT_CONTROL_MAPPING: Record<string, string[]> = {
  forced_entry: [
    "perimeter_fence",
    "perimeter_fence_anti_climb",
    "reinforced_doors",
    "intrusion_alarm_door_window",
    "glass_break_sensors",
    "monitored_alarm_system",
    "exterior_lighting",
    "cctv_outdoor",
  ],
  tailgating: [
    "turnstiles_speed_gates",
    "man_trap",
    "security_guard_reception",
    "visitor_management_system",
    "badge_display_policy",
    "cctv_fixed_indoor",
    "security_awareness_training",
  ],
  piggybacking: [
    "turnstiles_speed_gates",
    "man_trap",
    "security_guard_reception",
    "badge_display_policy",
    "security_awareness_training",
  ],
  theft_property: [
    "access_control_electronic",
    "cctv_fixed_indoor",
    "cctv_outdoor",
    "cctv_monitoring_24_7",
    "roving_security_patrol",
    "intrusion_alarm_door_window",
    "motion_detectors_pir",
    "exterior_lighting",
  ],
  theft_intellectual_property: [
    "access_control_electronic",
    "biometric_access_control",
    "visitor_management_system",
    "clean_desk_policy",
    "background_checks",
    "access_control_audit",
    "cctv_fixed_indoor",
    "visitor_access_policy",
  ],
  vandalism: [
    "perimeter_fence",
    "exterior_lighting",
    "cctv_outdoor",
    "roving_security_patrol",
    "signage_security_warnings",
  ],
  sabotage: [
    "access_control_electronic",
    "biometric_access_control",
    "background_checks",
    "visitor_management_system",
    "cctv_fixed_indoor",
    "access_control_audit",
  ],
  workplace_violence_active_threat: [
    "emergency_response_plan",
    "active_threat_response_training",
    "cctv_monitoring_24_7",
    "access_control_electronic",
    "visitor_management_system",
    "security_guard_reception",
    "roving_security_patrol",
  ],
  workplace_violence_employee: [
    "background_checks",
    "security_awareness_training",
    "emergency_response_plan",
    "cctv_fixed_indoor",
  ],
  workplace_violence_domestic: [
    "visitor_management_system",
    "security_guard_reception",
    "access_control_electronic",
    "cctv_outdoor",
  ],
  cyber_physical_access_hack: [
    "network_segmentation",
    "multi_factor_authentication",
    "security_system_patching",
    "access_control_audit",
  ],
  cyber_physical_cctv: [
    "network_segmentation",
    "multi_factor_authentication",
    "security_system_patching",
  ],
  espionage_surveillance: [
    "visitor_management_system",
    "clean_desk_policy",
    "access_control_electronic",
    "biometric_access_control",
    "cctv_fixed_indoor",
    "background_checks",
  ],
  natural_disaster_earthquake: [
    "emergency_response_plan",
    "emergency_evacuation_plan",
  ],
  natural_disaster_flood: [
    "emergency_response_plan",
    "emergency_evacuation_plan",
  ],
};

// ============================================================================
// INCIDENT-TO-THREAT MAPPING
// ============================================================================

const INCIDENT_THREAT_MAP: Record<string, string[]> = {
  "Unauthorized entry/intrusion": [
    "forced_entry",
    "tailgating",
    "piggybacking",
  ],
  "Theft of company property": ["theft_property"],
  "Theft of personal property": ["theft_property"],
  Vandalism: ["vandalism"],
  "Workplace violence (threat or actual)": [
    "workplace_violence_employee",
    "workplace_violence_active_threat",
  ],
  "Active threat/active shooter": ["workplace_violence_active_threat"],
  "Domestic violence spillover": ["workplace_violence_domestic"],
  "Cyber incident with physical component": [
    "cyber_physical_access_hack",
    "cyber_physical_cctv",
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a response string matches a risk indicator (case-insensitive partial match)
 */
function responseMatchesIndicator(response: any, indicator: string): boolean {
  if (typeof response === "string") {
    return response.toLowerCase().includes(indicator.toLowerCase());
  }
  if (Array.isArray(response)) {
    return response.some(
      (r) =>
        typeof r === "string" &&
        r.toLowerCase().includes(indicator.toLowerCase()),
    );
  }
  return false;
}

/**
 * Classify risk level based on inherent risk score
 * CORRECTED: Uses 2-factor model (1-25 scale) instead of 3-factor (1-125)
 */
function classifyRiskLevel(
  inherentRisk: number,
): "critical" | "high" | "medium" | "low" {
  // 2-factor scale: 1-25 mapped to risk levels
  if (inherentRisk >= 20) return "critical"; // 80-100% of max
  if (inherentRisk >= 12) return "high"; // 48-79% of max
  if (inherentRisk >= 6) return "medium"; // 24-47% of max
  return "low"; // 0-23% of max
}

/**
 * Get the threat definition by ID
 */
function getThreatById(threatId: string) {
  return OFFICE_BUILDING_THREATS.find((t) => t.id === threatId);
}

// ============================================================================
// INTERVIEW DATA RETRIEVAL - CORRECTED FOR ACTUAL SCHEMA
// ============================================================================

/**
 * Fetch interview responses from facility_survey_questions table
 * CORRECTED: Queries facility_survey_questions.response (jsonb) instead of facilitySurveys
 */
export async function getInterviewResponsesForAssessment(
  assessmentId: string,
): Promise<InterviewResponses> {
  try {
    // Query all survey questions for this assessment using standard select
    const surveyQuestions = await db
      .select()
      .from(facilitySurveyQuestions)
      .where(eq(facilitySurveyQuestions.assessmentId, assessmentId));

    if (!surveyQuestions || surveyQuestions.length === 0) {
      console.warn(`No survey questions found for assessment ${assessmentId}`);
      return {};
    }

    // Aggregate responses from all questions into a single object
    const aggregatedResponses: InterviewResponses = {};

    for (const question of surveyQuestions) {
      if (question.response) {
        // response is jsonb, parse if string
        const responseData =
          typeof question.response === "string"
            ? JSON.parse(question.response)
            : question.response;

        // Use templateQuestionId as key, store the response value
        if (question.templateQuestionId) {
          aggregatedResponses[question.templateQuestionId] = responseData;
        }
      }
    }

    return aggregatedResponses;
  } catch (error) {
    console.error("Error fetching interview responses:", error);
    throw error;
  }
}

// ============================================================================
// VULNERABILITY CALCULATION
// ============================================================================

/**
 * Calculate vulnerability score (1-5) based on interview responses
 * Higher score = more vulnerable
 */
export function calculateVulnerabilityFromInterview(
  responses: InterviewResponses,
  threatId: string,
): number {
  let vulnerabilityScore = 3; // Start at baseline (moderate)
  let riskFactorCount = 0;

  // -------------------------------------------------------------------------
  // PERIMETER SECURITY ANALYSIS
  // -------------------------------------------------------------------------

  // No defined perimeter = critical vulnerability
  if (
    responseMatchesIndicator(responses.perimeter_1, "no - building is directly")
  ) {
    riskFactorCount += 2;
  }

  // Poor perimeter lighting
  if (typeof responses.perimeter_2 === "number" && responses.perimeter_2 <= 2) {
    riskFactorCount += 1;
  }

  // Concealment opportunities exist
  if (responses.perimeter_3 === "yes") {
    riskFactorCount += 1;
  }

  // No perimeter cameras
  if (responses.perimeter_4 === "no") {
    riskFactorCount += 1;
  }

  // Poor camera coverage
  if (
    responseMatchesIndicator(responses.perimeter_4a, "less than 25%") ||
    responseMatchesIndicator(responses.perimeter_4a, "25-49%")
  ) {
    riskFactorCount += 1;
  }

  // Vulnerable entry points with inadequate protection
  if (responses.perimeter_5 === "yes") {
    if (
      responseMatchesIndicator(
        responses.perimeter_5a,
        "no additional security",
      ) ||
      responseMatchesIndicator(responses.perimeter_5a, "physical locks only")
    ) {
      riskFactorCount += 2;
    }
  }

  // No intrusion detection
  if (responses.perimeter_6 === "no") {
    riskFactorCount += 1;
  }

  // Poor alarm response
  if (
    responseMatchesIndicator(responses.perimeter_7, "notification via email") ||
    responseMatchesIndicator(responses.perimeter_7, "no intrusion detection")
  ) {
    riskFactorCount += 1;
  }

  // History of perimeter breaches
  if (responses.perimeter_8 === "yes") {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // PARKING SECURITY ANALYSIS
  // -------------------------------------------------------------------------

  // Unsecured parking
  if (
    responseMatchesIndicator(responses.parking_1, "street parking") ||
    responseMatchesIndicator(responses.parking_1, "unsecured surface lot")
  ) {
    riskFactorCount += 1;
  }

  // No parking access control
  if (
    responseMatchesIndicator(responses.parking_2, "parking permit") ||
    responseMatchesIndicator(responses.parking_2, "no access control")
  ) {
    riskFactorCount += 1;
  }

  // No parking cameras
  if (responses.parking_3 === "no") {
    riskFactorCount += 1;
  }

  // Poor parking lighting
  if (typeof responses.parking_4 === "number" && responses.parking_4 <= 2) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // ENTRY POINT ANALYSIS
  // -------------------------------------------------------------------------

  // Open access during business hours = critical for tailgating/piggybacking
  if (responseMatchesIndicator(responses.entry_3, "open access")) {
    riskFactorCount += 2;
  }

  // No anti-tailgating measures
  if (
    responses.entry_4 === "no" ||
    !responseMatchesIndicator(responses.entry_4, "physical barriers")
  ) {
    riskFactorCount += 1;
  }

  // No visitor management
  if (responses.entry_5 === "no") {
    riskFactorCount += 1;
  }

  // Weak door hardware
  if (
    responseMatchesIndicator(responses.entry_7, "partial") ||
    responseMatchesIndicator(responses.entry_7, "no - residential")
  ) {
    riskFactorCount += 1;
  }

  // Building remains open after hours
  if (responseMatchesIndicator(responses.entry_9, "remains open")) {
    riskFactorCount += 2;
  }

  // -------------------------------------------------------------------------
  // INTERIOR ACCESS CONTROL ANALYSIS
  // -------------------------------------------------------------------------

  // No internal segmentation
  if (responses.interior_access_1 === "no") {
    riskFactorCount += 1;
  }

  // Access rights rarely reviewed
  if (
    responseMatchesIndicator(responses.interior_access_2, "rarely or never")
  ) {
    riskFactorCount += 1;
  }

  // Badges not required
  if (
    responseMatchesIndicator(responses.interior_access_3, "no - not required")
  ) {
    riskFactorCount += 1;
  }

  // Server room with weak access control
  if (
    responseMatchesIndicator(responses.interior_access_4, "key/lock only") ||
    responseMatchesIndicator(responses.interior_access_4, "no dedicated")
  ) {
    riskFactorCount += 2;
  }

  // Server room access not monitored
  if (responses.interior_access_5 === "no") {
    riskFactorCount += 1;
  }

  // No executive protection measures
  if (responses.interior_access_6 === "no") {
    riskFactorCount += 1;
  }

  // Slow badge deactivation on termination
  if (
    responseMatchesIndicator(
      responses.interior_access_7,
      "eventually deactivated",
    )
  ) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // SURVEILLANCE ANALYSIS
  // -------------------------------------------------------------------------

  // No internal cameras
  if (responses.surveillance_1 === "no") {
    riskFactorCount += 1;
  }

  // Cameras not monitored
  if (
    responseMatchesIndicator(responses.surveillance_3, "recording only") ||
    responseMatchesIndicator(responses.surveillance_3, "rarely")
  ) {
    riskFactorCount += 1;
  }

  // Short retention period
  if (
    responseMatchesIndicator(responses.surveillance_4, "less than") ||
    responseMatchesIndicator(responses.surveillance_4, "7 days")
  ) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // INTRUSION DETECTION ANALYSIS
  // -------------------------------------------------------------------------

  // No intrusion alarm system
  if (responses.intrusion_1 === "no") {
    riskFactorCount += 2;
  }

  // Alarm not monitored 24/7
  if (responses.intrusion_2 === "no") {
    riskFactorCount += 1;
  }

  // Poor alarm testing
  if (
    responseMatchesIndicator(responses.intrusion_4, "annually") ||
    responseMatchesIndicator(responses.intrusion_4, "rarely") ||
    responseMatchesIndicator(responses.intrusion_4, "never")
  ) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // SECURITY PERSONNEL ANALYSIS
  // -------------------------------------------------------------------------

  // No on-site security
  if (responses.personnel_1 === "no") {
    riskFactorCount += 1;
  }

  // No security patrols
  if (responses.personnel_4 === "no") {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // EMERGENCY PREPAREDNESS ANALYSIS
  // -------------------------------------------------------------------------

  // No emergency response plan
  if (responses.emergency_1 === "no") {
    riskFactorCount += 1;
  }

  // No active threat training
  if (responses.emergency_2 === "no") {
    riskFactorCount += 1;
  }

  // No recent drill
  if (responses.emergency_3 === "no") {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // CYBER-PHYSICAL ANALYSIS
  // -------------------------------------------------------------------------

  // Security systems on main network
  if (responseMatchesIndicator(responses.cyber_1, "no - same network")) {
    riskFactorCount += 2;
  }

  // Default credentials
  if (responses.cyber_2 === "no") {
    riskFactorCount += 2;
  }

  // No patching
  if (
    responseMatchesIndicator(responses.cyber_3, "rarely") ||
    responseMatchesIndicator(responses.cyber_3, "never")
  ) {
    riskFactorCount += 1;
  }

  // -------------------------------------------------------------------------
  // CALCULATE FINAL SCORE
  // -------------------------------------------------------------------------

  // Each 2 risk factors increases vulnerability by 1 point
  vulnerabilityScore = Math.min(
    5,
    vulnerabilityScore + Math.floor(riskFactorCount / 2),
  );

  return vulnerabilityScore;
}

// ============================================================================
// THREAT LIKELIHOOD CALCULATION
// ============================================================================

/**
 * Calculate threat likelihood (1-5) based on interview responses
 * Higher score = more likely to occur
 */
export function calculateThreatLikelihoodFromInterview(
  responses: InterviewResponses,
  threatId: string,
): number {
  let likelihood = 2; // Start at baseline (unlikely)

  // -------------------------------------------------------------------------
  // FACTOR 1: INCIDENT HISTORY (most important)
  // -------------------------------------------------------------------------

  if (responses.incident_history_1 === "yes") {
    const incidentTypes = responses.incident_history_1a || [];

    // Check if past incidents match this threat type
    for (const incidentType of incidentTypes) {
      const mappedThreats = INCIDENT_THREAT_MAP[incidentType] || [];
      if (mappedThreats.includes(threatId)) {
        likelihood += 2; // Historical incident = significantly higher likelihood
        break;
      }
    }

    // Check frequency - pattern of incidents
    const incidentCount = responses.incident_history_1b;
    if (
      incidentCount === "6-10 incidents" ||
      incidentCount === "10+ incidents"
    ) {
      likelihood += 1;
    }
  }

  // -------------------------------------------------------------------------
  // FACTOR 2: THREAT-SPECIFIC PATTERNS
  // -------------------------------------------------------------------------

  // Workplace Violence - Active Threat
  if (threatId === "workplace_violence_active_threat") {
    if (responses.incident_history_3 === "yes") {
      likelihood += 1; // Prior threats increase likelihood
    }
  }

  // Workplace Violence - Employee Conflict
  if (threatId === "workplace_violence_employee") {
    if (responses.incident_history_3 === "yes") {
      likelihood += 1;
    }
  }

  // Parking-related Theft/Vandalism
  if (threatId === "theft_property" || threatId === "vandalism") {
    if (responses.parking_5 === "yes") {
      const parkingIncidents = responses.parking_5a || [];
      if (
        parkingIncidents.includes("Vehicle break-ins/theft from vehicles") ||
        parkingIncidents.includes("Vandalism to vehicles")
      ) {
        likelihood += 1;
      }
    }
  }

  // Tailgating/Piggybacking
  if (threatId === "tailgating" || threatId === "piggybacking") {
    const visitorVolume = responses.entry_6;
    if (
      visitorVolume === "High volume (51-100)" ||
      visitorVolume === "Very high volume (100+)"
    ) {
      likelihood += 1; // High traffic = more tailgating opportunities
    }
  }

  // IP Theft/Espionage - High-value targets
  if (
    threatId === "theft_intellectual_property" ||
    threatId === "espionage_surveillance"
  ) {
    const dataClass = responses.facility_overview_4;
    if (
      dataClass === "Handles classified government information" ||
      dataClass ===
        "Processes highly confidential corporate data (trade secrets, M&A)"
    ) {
      likelihood += 1; // High-value targets attract sophisticated adversaries
    }

    const businessOps = responses.facility_overview_3 || [];
    if (
      businessOps.includes("Research & Development") ||
      businessOps.includes("Technology/Software development")
    ) {
      likelihood += 1; // R&D targets
    }
  }

  // Cyber-Physical attacks
  if (
    threatId === "cyber_physical_access_hack" ||
    threatId === "cyber_physical_cctv"
  ) {
    // If security systems on main network, higher likelihood
    if (responseMatchesIndicator(responses.cyber_1, "no - same network")) {
      likelihood += 1;
    }
    // Default credentials = high likelihood
    if (responses.cyber_2 === "no") {
      likelihood += 1;
    }
  }

  // Natural disasters - location-based (baseline unless modified)
  if (threatId === "natural_disaster_flood") {
    // Check if facility has flood history
    if (
      responseMatchesIndicator(responses.incident_history_1a, "flood") ||
      responseMatchesIndicator(responses.incident_history_1a, "water damage")
    ) {
      likelihood += 1;
    }
  }

  // Cap at 5
  return Math.min(5, likelihood);
}

// ============================================================================
// IMPACT CALCULATION
// ============================================================================

/**
 * Calculate impact score (1-5) based on interview responses
 * Higher score = more severe consequences
 */
export function calculateImpactFromInterview(
  responses: InterviewResponses,
  threatId: string,
): number {
  let impact = 3; // Baseline moderate impact

  // -------------------------------------------------------------------------
  // FACTOR 1: FACILITY SIZE & POPULATION
  // -------------------------------------------------------------------------

  const employeeCount = responses.facility_overview_2;
  const employeeImpactMap: Record<string, number> = {
    "1-25 employees": 0,
    "26-100 employees": 0,
    "101-250 employees": 1,
    "251-500 employees": 1,
    "500+ employees": 2,
  };
  impact += employeeImpactMap[employeeCount] || 0;

  // -------------------------------------------------------------------------
  // FACTOR 2: BUSINESS CRITICALITY
  // -------------------------------------------------------------------------

  const businessType = responses.facility_overview_3 || [];
  const criticalOperations = [
    "Financial services/Banking",
    "Healthcare/Medical",
    "Data center operations",
  ];

  if (criticalOperations.some((op) => businessType.includes(op))) {
    impact += 1; // Critical infrastructure
  }

  // -------------------------------------------------------------------------
  // FACTOR 3: DATA SENSITIVITY
  // -------------------------------------------------------------------------

  const dataClass = responses.facility_overview_4;
  if (dataClass === "Handles classified government information") {
    impact += 2; // National security implications
  } else if (
    dataClass ===
    "Processes highly confidential corporate data (trade secrets, M&A)"
  ) {
    impact += 1; // Significant business impact
  }

  // -------------------------------------------------------------------------
  // FACTOR 4: ASSET VALUE
  // -------------------------------------------------------------------------

  if (responses.facility_overview_7 === "yes") {
    const assetValue = responses.facility_overview_7b;
    const assetImpactMap: Record<string, number> = {
      "Less than $50,000": 0,
      "$50,000 - $250,000": 0,
      "$250,000 - $1 million": 1,
      "$1 million - $5 million": 1,
      "Over $5 million": 2,
    };
    impact += assetImpactMap[assetValue] || 0;
  }

  // -------------------------------------------------------------------------
  // THREAT-SPECIFIC IMPACT OVERRIDES
  // -------------------------------------------------------------------------

  // Workplace Violence - Active Threat: Always Catastrophic (life safety)
  if (threatId === "workplace_violence_active_threat") {
    impact = 5;
  }

  // Sabotage - Operational Disruption
  if (threatId === "sabotage") {
    const businessOps = responses.facility_overview_3 || [];
    if (
      businessOps.includes("Manufacturing/Production") ||
      businessOps.includes("Data center operations")
    ) {
      impact = Math.max(impact, 4); // Severe operational impact
    }
  }

  // IP Theft - Based on Data Classification
  if (threatId === "theft_intellectual_property") {
    if (
      dataClass === "Handles classified government information" ||
      dataClass ===
        "Processes highly confidential corporate data (trade secrets, M&A)"
    ) {
      impact = 5; // Catastrophic competitive/national security impact
    }
  }

  // Cap at 5
  return Math.min(5, impact);
}

// ============================================================================
// COMBINED LIKELIHOOD CALCULATION (T × V → likelihoodScore)
// ============================================================================

/**
 * Combine threat likelihood and vulnerability into a single likelihoodScore
 * SCHEMA ADAPTATION: Database uses likelihoodScore instead of separate T and V columns
 *
 * Method: Geometric mean normalized to 1-5 scale
 * This preserves the relationship between T and V while fitting the schema
 */
export function calculateCombinedLikelihoodScore(
  threatLikelihood: number,
  vulnerability: number,
): number {
  // Geometric mean: √(T × V) - maintains 1-5 scale
  const geometricMean = Math.sqrt(threatLikelihood * vulnerability);

  // Round to 2 decimal places for database storage
  return Math.round(geometricMean * 100) / 100;
}

// ============================================================================
// CONTROL RECOMMENDATION ENGINE
// ============================================================================

/**
 * Generate control recommendations based on interview responses
 */
export function generateControlRecommendations(
  responses: InterviewResponses,
  threatId?: string,
): string[] {
  const recommendations = new Set<string>();

  // -------------------------------------------------------------------------
  // RESPONSE-BASED RECOMMENDATIONS
  // -------------------------------------------------------------------------

  // Perimeter controls
  if (responses.perimeter_4 === "no") {
    recommendations.add("cctv_outdoor");
  }
  if (responses.perimeter_6 === "no") {
    recommendations.add("intrusion_alarm_door_window");
    recommendations.add("monitored_alarm_system");
  }

  // Entry controls
  if (
    responses.entry_4 === "no" ||
    !responseMatchesIndicator(responses.entry_4, "physical barriers")
  ) {
    recommendations.add("turnstiles_speed_gates");
  }
  if (responses.entry_5 === "no") {
    recommendations.add("visitor_management_system");
  }
  if (
    responseMatchesIndicator(responses.entry_7, "partial") ||
    responseMatchesIndicator(responses.entry_7, "no - residential")
  ) {
    recommendations.add("reinforced_doors");
  }

  // Interior controls
  if (responses.interior_access_1 === "no") {
    recommendations.add("access_control_electronic");
  }
  if (
    responseMatchesIndicator(responses.interior_access_3, "no - not required")
  ) {
    recommendations.add("badge_display_policy");
  }
  if (
    responseMatchesIndicator(responses.interior_access_4, "key/lock only") ||
    responseMatchesIndicator(responses.interior_access_4, "no dedicated")
  ) {
    recommendations.add("biometric_access_control");
    recommendations.add("man_trap");
  }

  // Surveillance controls
  if (responses.surveillance_1 === "no") {
    recommendations.add("cctv_fixed_indoor");
  }
  if (
    responseMatchesIndicator(responses.surveillance_3, "recording only") ||
    responseMatchesIndicator(responses.surveillance_3, "rarely")
  ) {
    recommendations.add("cctv_monitoring_24_7");
  }

  // Intrusion controls
  if (responses.intrusion_1 === "no") {
    recommendations.add("intrusion_alarm_door_window");
    recommendations.add("motion_detectors_pir");
    recommendations.add("monitored_alarm_system");
  }

  // Personnel controls
  if (responses.personnel_1 === "no") {
    recommendations.add("security_guard_reception");
  }

  // Emergency controls
  if (responses.emergency_1 === "no") {
    recommendations.add("emergency_response_plan");
  }
  if (responses.emergency_2 === "no") {
    recommendations.add("active_threat_response_training");
  }

  // Cyber-physical controls
  if (responseMatchesIndicator(responses.cyber_1, "no - same network")) {
    recommendations.add("network_segmentation");
  }
  if (responses.cyber_2 === "no") {
    recommendations.add("multi_factor_authentication");
  }
  if (
    responseMatchesIndicator(responses.cyber_3, "rarely") ||
    responseMatchesIndicator(responses.cyber_3, "never")
  ) {
    recommendations.add("security_system_patching");
  }

  // -------------------------------------------------------------------------
  // THREAT-SPECIFIC RECOMMENDATIONS
  // -------------------------------------------------------------------------

  if (threatId && THREAT_CONTROL_MAPPING[threatId]) {
    THREAT_CONTROL_MAPPING[threatId].forEach((c) => recommendations.add(c));
  }

  return Array.from(recommendations);
}

// ============================================================================
// DESCRIPTION GENERATORS - ADAPTED FOR EXISTING TEXT COLUMNS
// ============================================================================

/**
 * Generate the main scenario description
 * Stored in `scenario` column
 */
function generateScenarioDescription(
  threat: (typeof OFFICE_BUILDING_THREATS)[0],
  responses: InterviewResponses,
  likelihoodScore: number,
  impactScore: number,
  inherentRisk: number,
): string {
  const riskLevel = classifyRiskLevel(inherentRisk);

  const riskTerms: Record<string, string> = {
    critical: "CRITICAL priority requiring immediate attention",
    high: "HIGH priority requiring near-term remediation",
    medium: "MODERATE priority for planned improvement",
    low: "LOW priority for ongoing monitoring",
  };

  return (
    `${threat.name} (ASIS ${threat.asisCode}) assessed as ${riskTerms[riskLevel]}. ` +
    `Combined likelihood score: ${likelihoodScore.toFixed(1)}/5, ` +
    `Impact score: ${impactScore}/5, ` +
    `Inherent risk: ${inherentRisk.toFixed(1)}/25.`
  );
}

/**
 * Generate threat-specific description
 * Stored in `threatDescription` column
 */
function generateThreatDescription(
  threat: (typeof OFFICE_BUILDING_THREATS)[0],
  responses: InterviewResponses,
  threatLikelihood: number,
): string {
  const likelihoodTerms: Record<number, string> = {
    1: "rare occurrence expected",
    2: "unlikely but possible",
    3: "moderately likely to occur",
    4: "likely to occur",
    5: "highly likely or imminent",
  };

  let description = `${threat.category}: ${likelihoodTerms[threatLikelihood]}. `;

  // Add threat-specific context
  if (responses.incident_history_1 === "yes") {
    const incidentTypes = responses.incident_history_1a || [];
    const relevantIncidents = incidentTypes.filter((type: string) => {
      const mapped = INCIDENT_THREAT_MAP[type] || [];
      return mapped.includes(threat.id);
    });

    if (relevantIncidents.length > 0) {
      description += `Historical incidents of this type have been reported at this facility. `;
    }
  }

  return description;
}

/**
 * Generate vulnerability-specific description
 * Stored in `vulnerabilityDescription` column
 */
function generateVulnerabilityDescription(
  threat: (typeof OFFICE_BUILDING_THREATS)[0],
  responses: InterviewResponses,
  vulnerability: number,
): string {
  const vulnerabilityTerms: Record<number, string> = {
    1: "well-protected with robust controls",
    2: "adequately protected with minor gaps",
    3: "moderately vulnerable with notable control gaps",
    4: "significantly vulnerable with major control deficiencies",
    5: "highly vulnerable with critical security failures",
  };

  let description = `Facility is ${vulnerabilityTerms[vulnerability]} against ${threat.name}. `;

  // Build list of specific findings
  const findings: string[] = [];

  if (threat.category === "Physical Intrusion") {
    if (responses.perimeter_6 === "no") findings.push("no intrusion detection");
    if (responseMatchesIndicator(responses.entry_3, "open access")) {
      findings.push("open access during business hours");
    }
    if (responses.entry_4 === "no")
      findings.push("no anti-tailgating measures");
  }

  if (threat.category === "Theft") {
    if (responses.surveillance_1 === "no") findings.push("no internal CCTV");
    if (responses.interior_access_1 === "no")
      findings.push("no internal access segmentation");
  }

  if (threat.category === "Workplace Violence") {
    if (responses.emergency_2 === "no")
      findings.push("no active threat training");
    if (responses.interior_access_6 === "no")
      findings.push("no executive protection measures");
  }

  if (findings.length > 0) {
    description += `Key gaps: ${findings.join("; ")}.`;
  }

  return description;
}

// ============================================================================
// MAIN RISK SCENARIO GENERATION FUNCTION - SCHEMA CORRECTED
// ============================================================================

/**
 * Initialize risk scenarios from completed interview
 * CORRECTED: Uses actual database column names
 */
export async function initializeRiskScenariosFromInterview(
  assessmentId: string,
  interviewResponses: InterviewResponses,
): Promise<GeneratedScenarioResult> {
  const generatedScenarios: NewRiskScenario[] = [];
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  // Process each threat in the Office Building threat library
  for (const threat of OFFICE_BUILDING_THREATS) {
    // Calculate individual T, V, I scores
    const threatLikelihood = calculateThreatLikelihoodFromInterview(
      interviewResponses,
      threat.id,
    );

    const vulnerability = calculateVulnerabilityFromInterview(
      interviewResponses,
      threat.id,
    );

    const impactScore = calculateImpactFromInterview(
      interviewResponses,
      threat.id,
    );

    // CORRECTED: Combine T × V into likelihoodScore for database
    const likelihoodScore = calculateCombinedLikelihoodScore(
      threatLikelihood,
      vulnerability,
    );

    // CORRECTED: Calculate inherent risk using 2-factor model
    // inherentRisk = likelihoodScore × impactScore (1-25 scale)
    const inherentRisk = likelihoodScore * impactScore;

    // Classify risk level
    const riskLevel = classifyRiskLevel(inherentRisk);

    // Update counters
    switch (riskLevel) {
      case "critical":
        criticalCount++;
        break;
      case "high":
        highCount++;
        break;
      case "medium":
        mediumCount++;
        break;
      case "low":
        lowCount++;
        break;
    }

    // Generate descriptions for existing text columns
    const scenario = generateScenarioDescription(
      threat,
      interviewResponses,
      likelihoodScore,
      impactScore,
      inherentRisk,
    );

    const threatDescription = generateThreatDescription(
      threat,
      interviewResponses,
      threatLikelihood,
    );

    const vulnerabilityDescription = generateVulnerabilityDescription(
      threat,
      interviewResponses,
      vulnerability,
    );

    // Map risk level to likelihood/impact text
    const likelihoodText = likelihoodScore >= 4 ? "High" : likelihoodScore >= 3 ? "Medium" : "Low";
    const impactText = impactScore >= 4 ? "High" : impactScore >= 3 ? "Medium" : "Low";

    // CORRECTED: Create risk scenario using actual column names
    generatedScenarios.push({
      assessmentId,
      threatLibraryId: null, // Will be resolved during insert
      likelihoodScore,
      impactScore,
      inherentRisk,
      residualRisk: inherentRisk, // Initially same as inherent
      controlEffectiveness: 0,
      riskLevel,
      scenario,
      asset: threat.category, // Use threat category as asset
      likelihood: likelihoodText,
      impact: impactText,
      threatDescription,
      vulnerabilityDescription,
    });
  }

  // Insert scenarios into database
  const insertedIds: string[] = [];

  try {
    for (let i = 0; i < generatedScenarios.length; i++) {
      const scenarioData = generatedScenarios[i];
      const threat = OFFICE_BUILDING_THREATS[i];

      // Look up threat in threat_library
      const [existingThreat] = await db
        .select()
        .from(threatLibrary)
        .where(eq(threatLibrary.name, threat.name))
        .limit(1);

      let threatDbId: string | null = null;
      if (existingThreat) {
        threatDbId = existingThreat.id;
      } else {
        // Create the threat if it doesn't exist
        const [newThreat] = await db
          .insert(threatLibrary)
          .values({
            name: threat.name,
            category: threat.category,
            description: `${threat.name} - ASIS Code: ${threat.asisCode}`,
          })
          .returning();
        threatDbId = newThreat.id;
      }

      // CORRECTED: Insert using actual column names from schema
      const [inserted] = await db
        .insert(riskScenarios)
        .values({
          assessmentId: scenarioData.assessmentId,
          threatLibraryId: threatDbId,
          likelihoodScore: scenarioData.likelihoodScore,
          impactScore: scenarioData.impactScore,
          inherentRisk: scenarioData.inherentRisk,
          residualRisk: scenarioData.residualRisk,
          controlEffectiveness: scenarioData.controlEffectiveness,
          riskLevel: scenarioData.riskLevel,
          scenario: scenarioData.scenario,
          asset: scenarioData.asset,
          likelihood: scenarioData.likelihood,
          impact: scenarioData.impact,
          threatDescription: scenarioData.threatDescription,
          vulnerabilityDescription: scenarioData.vulnerabilityDescription,
        })
        .returning();

      insertedIds.push(inserted.id);
    }
  } catch (error) {
    console.error("Error inserting risk scenarios:", error);
    throw error;
  }

  return {
    success: true,
    generatedScenarios: generatedScenarios.length,
    criticalRisks: criticalCount,
    highRisks: highCount,
    mediumRisks: mediumCount,
    lowRisks: lowCount,
    riskScenarioIds: insertedIds,
  };
}

// ============================================================================
// ALTERNATIVE ENTRY POINT - Fetches interview data automatically
// ============================================================================

/**
 * Generate risk scenarios by fetching interview data from database
 * Convenience method that handles the data retrieval
 */
export async function generateRiskScenariosForAssessment(
  assessmentId: string,
): Promise<GeneratedScenarioResult> {
  // Fetch interview responses from facility_survey_questions
  const interviewResponses =
    await getInterviewResponsesForAssessment(assessmentId);

  if (Object.keys(interviewResponses).length === 0) {
    return {
      success: false,
      generatedScenarios: 0,
      criticalRisks: 0,
      highRisks: 0,
      mediumRisks: 0,
      lowRisks: 0,
      riskScenarioIds: [],
    };
  }

  return initializeRiskScenariosFromInterview(assessmentId, interviewResponses);
}

// ============================================================================
// EXPORT FOR ROUTE INTEGRATION
// ============================================================================

export default {
  // Core calculation functions
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  calculateCombinedLikelihoodScore,

  // Data retrieval
  getInterviewResponsesForAssessment,

  // Recommendation engine
  generateControlRecommendations,

  // Main entry points
  initializeRiskScenariosFromInterview,
  generateRiskScenariosForAssessment,

  // Reference data
  OFFICE_BUILDING_THREATS,
  THREAT_CONTROL_MAPPING,
};
