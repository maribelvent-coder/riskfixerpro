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
  },
  {
    id: "office-building",
    name: "Office Building",
    description: "Physical security assessment for commercial office buildings including perimeter security, access control, employee safety, and business continuity",
    category: "Commercial",
    surveyParadigm: "facility",
    assetTypes: [
      "Personnel & Staff",
      "Confidential Information",
      "IT Infrastructure",
      "Office Equipment",
      "Building Structure",
      "Parking Facilities",
      "Reception & Lobby",
      "Server Rooms"
    ],
    commonRisks: [
      "Unauthorized Access",
      "Tailgating & Piggybacking",
      "Theft of Equipment/Data",
      "Workplace Violence",
      "Social Engineering",
      "After-Hours Intrusion",
      "Vandalism",
      "Parking Lot Crime",
      "Fire & Life Safety Hazards",
      "Slip, Trip & Fall Incidents"
    ],
    typicalControls: [
      "Badge Access Control Systems",
      "CCTV Surveillance (Entry/Exit Points)",
      "Security Guard/Reception Desk",
      "Visitor Management System",
      "After-Hours Alarm System",
      "Perimeter Lighting (CPTED)",
      "Parking Access Control",
      "Emergency Egress Signage",
      "Fire Detection & Suppression",
      "Duress Alarms",
      "Key Control & Management",
      "Security Awareness Training"
    ]
  },
  {
    id: "retail-store",
    name: "Retail Store",
    description: "Security assessment for retail environments focusing on loss prevention, customer safety, cash handling, and inventory protection",
    category: "Retail",
    surveyParadigm: "facility",
    assetTypes: [
      "Merchandise Inventory",
      "Cash & Payment Systems",
      "Employees & Customers",
      "POS Systems",
      "Stockroom Assets",
      "Building Structure",
      "Parking Lot",
      "Loading Dock"
    ],
    commonRisks: [
      "Shoplifting & Organized Retail Crime",
      "Employee Theft (Internal Loss)",
      "Armed Robbery",
      "Credit Card Fraud",
      "Smash-and-Grab Burglary",
      "Cargo Theft (Loading Dock)",
      "Vendor Fraud",
      "Customer Slip & Fall",
      "Active Shooter/Workplace Violence",
      "After-Hours Burglary"
    ],
    typicalControls: [
      "Electronic Article Surveillance (EAS)",
      "CCTV with DVR/NVR",
      "Point-of-Sale (POS) Monitoring",
      "Cash Management Procedures",
      "Employee Background Checks",
      "Inventory Audits & Shrink Analysis",
      "Security Tags & Anti-Theft Devices",
      "Security Guards (Uniformed)",
      "Panic Buttons at Registers",
      "Perimeter Alarm System",
      "Loading Dock Access Control",
      "Customer Service Training (Awareness)"
    ]
  },
  {
    id: "warehouse-distribution",
    name: "Warehouse & Distribution Center",
    description: "Security assessment for warehouse and logistics facilities covering inventory protection, cargo security, employee safety, and operational continuity",
    category: "Logistics",
    surveyParadigm: "facility",
    assetTypes: [
      "Inventory & Goods",
      "Warehouse Equipment (Forklifts, etc.)",
      "IT & WMS Systems",
      "Loading Docks",
      "Personnel",
      "Vehicles & Fleet",
      "Building Infrastructure",
      "Hazardous Materials (if applicable)"
    ],
    commonRisks: [
      "Cargo Theft",
      "Employee Theft & Collusion",
      "Unauthorized Access",
      "Forklift/Equipment Accidents",
      "Loading Dock Intrusion",
      "Inventory Shrinkage",
      "Vendor/Driver Fraud",
      "Slip, Trip & Fall Hazards",
      "Fire & Explosion (if flammables stored)",
      "Workplace Violence"
    ],
    typicalControls: [
      "Perimeter Fencing & Gates",
      "Access Control (Badge/Keycard)",
      "CCTV Coverage (Dock, Yard, Interior)",
      "Security Guards/Patrols",
      "Inventory Management System (WMS)",
      "Visitor & Vendor Log System",
      "Dock Door Locks & Seals",
      "Vehicle Inspection Procedures",
      "Employee Background Screening",
      "Intrusion Detection System",
      "Fire Detection & Suppression",
      "Lighting (Perimeter & Parking)"
    ]
  },
  {
    id: "data-center",
    name: "Data Center",
    description: "High-security assessment for data centers focusing on physical security, environmental controls, access control, and business continuity",
    category: "Technology",
    surveyParadigm: "facility",
    assetTypes: [
      "Server & Network Equipment",
      "Critical Data",
      "Power Infrastructure (UPS, Generators)",
      "Cooling Systems (HVAC)",
      "Cabling & Fiber Optics",
      "Backup Systems",
      "Personnel",
      "Building Structure"
    ],
    commonRisks: [
      "Unauthorized Physical Access",
      "Data Theft or Tampering",
      "Insider Threats",
      "Power Outages",
      "Environmental Failures (Cooling, Fire)",
      "Natural Disasters (Flood, Earthquake)",
      "Social Engineering (Tailgating)",
      "Sabotage",
      "Equipment Failure",
      "Supply Chain Attacks (Malicious Hardware)"
    ],
    typicalControls: [
      "Multi-Factor Access Control (Biometric + Badge)",
      "Man-Trap/Vestibule Entry",
      "24/7 CCTV & Security Monitoring",
      "Intrusion Detection System",
      "Environmental Monitoring (Temp, Humidity, Water)",
      "Fire Detection & Suppression (Gas-based)",
      "Redundant Power (UPS, Generators)",
      "Cable Management & Labeling",
      "Background Checks & Security Clearances",
      "Visitor Escort Policy",
      "Physical Security Audits (Regular)",
      "Disaster Recovery Plan (DRP)"
    ]
  },
  {
    id: "manufacturing-facility",
    name: "Manufacturing Facility",
    description: "Security assessment for manufacturing plants covering employee safety, equipment protection, supply chain security, and operational continuity",
    category: "Industrial",
    surveyParadigm: "facility",
    assetTypes: [
      "Production Equipment & Machinery",
      "Raw Materials & Inventory",
      "Finished Goods",
      "Personnel & Workforce",
      "Intellectual Property (Designs, Processes)",
      "IT/OT Systems",
      "Loading Docks & Shipping",
      "Hazardous Materials (if applicable)"
    ],
    commonRisks: [
      "Equipment Sabotage",
      "Theft of Materials/Finished Goods",
      "Workplace Injuries & Accidents",
      "Intellectual Property Theft",
      "Unauthorized Access",
      "Supply Chain Disruption",
      "Fire & Explosion Hazards",
      "Environmental Contamination",
      "Insider Threats",
      "Cyberattacks on OT Systems"
    ],
    typicalControls: [
      "Perimeter Security (Fencing, Gates)",
      "Access Control (Badge System)",
      "CCTV Surveillance (Production Floor, Docks)",
      "Security Guards/Patrols",
      "Machine Guarding & Safety Interlocks",
      "Hazmat Storage & Handling Procedures",
      "Fire Detection & Suppression",
      "Inventory Tracking System",
      "Employee Safety Training",
      "Visitor Management & Escort Policy",
      "Background Checks for Critical Roles",
      "Emergency Response Plan (ERP)"
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
