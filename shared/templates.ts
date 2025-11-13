export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  surveyParadigm: "facility" | "executive" | "custom";
  assetTypes: string[];
  commonRisks: string[];
  typicalControls: string[];
}

export const ASSESSMENT_TEMPLATES: TemplateDefinition[] = [
  {
    id: "executive-protection",
    name: "Executive Protection",
    description: "Comprehensive security assessment for high-profile executives covering digital footprint, travel security, residential protection, and corporate office security",
    category: "Executive",
    surveyParadigm: "executive",
    assetTypes: [
      "Executive Personnel",
      "Family Members",
      "Personal Information (PII)",
      "Residential Property",
      "Executive Office Suite",
      "Digital Assets & Credentials",
      "Travel & Transportation",
      "Confidential Communications"
    ],
    commonRisks: [
      "Doxxing & PII Exposure",
      "Social Engineering & Phishing",
      "Surveillance & Pattern-of-Life Analysis",
      "Kidnapping & Extortion",
      "Home Invasion",
      "Travel Ambush",
      "Cyber Compromise (BEC/Account Takeover)",
      "Corporate Espionage",
      "Insider Threats",
      "Active Threats & Violence"
    ],
    typicalControls: [
      "OSINT Assessment & Dark Web Monitoring",
      "Social Media Privacy Controls",
      "Secure Travel Risk Assessments",
      "Residential Perimeter Security (CPTED)",
      "Access Control Systems (Biometric/RBAC)",
      "24/7 CCTV & Intrusion Detection",
      "Safe Room / Panic Room",
      "Executive Protection Detail",
      "Secure Transportation (Vetted Drivers)",
      "TSCM Sweeps (Bug Detection)",
      "VPN & Multi-Factor Authentication",
      "Mail Screening Procedures",
      "Emergency Evacuation Plans",
      "Household Staff Vetting"
    ]
  }
];

export function getTemplateById(templateId: string): TemplateDefinition | undefined {
  return ASSESSMENT_TEMPLATES.find(t => t.id === templateId);
}

export function getSurveyParadigmFromTemplate(templateId: string | undefined): "facility" | "executive" | "custom" | undefined {
  if (!templateId) return undefined;
  const template = getTemplateById(templateId);
  return template?.surveyParadigm;
}
