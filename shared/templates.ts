export interface SuggestedZone {
  name: string;
  zoneType: string;
  securityLevel: string;
  description?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  surveyParadigm: "facility" | "executive" | "custom";
  assetTypes: string[];
  commonRisks: string[];
  typicalControls: string[];
  suggestedZones?: SuggestedZone[];
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
    ],
    suggestedZones: [
      { name: "Residence Perimeter", zoneType: "perimeter", securityLevel: "high_security", description: "Property boundary, gates, fencing" },
      { name: "Main Entry", zoneType: "entry", securityLevel: "high_security", description: "Primary access point with surveillance" },
      { name: "Safe Room", zoneType: "restricted", securityLevel: "high_security", description: "Secure panic room for emergencies" },
      { name: "Garage / Vehicle Storage", zoneType: "parking", securityLevel: "controlled", description: "Secure vehicle storage area" },
      { name: "Executive Office Suite", zoneType: "office", securityLevel: "controlled", description: "Private workspace within corporate office" }
    ]
  },
  {
    id: "office-building",
    name: "Office Building",
    description: "Comprehensive security assessment for commercial office buildings including perimeter security, access control, workplace violence prevention, cyber-physical protections, and business continuity",
    category: "Commercial",
    surveyParadigm: "facility",
    assetTypes: [
      "Personnel & Staff",
      "Confidential Information",
      "Intellectual Property",
      "IT Infrastructure",
      "Office Equipment",
      "Building Structure",
      "Parking Facilities",
      "Reception & Lobby",
      "Server Rooms",
      "Meeting Rooms",
      "Executive Areas"
    ],
    commonRisks: [
      "Forced Entry",
      "Tailgating",
      "Piggybacking",
      "Equipment Theft",
      "Intellectual Property Theft",
      "Active Shooter",
      "Assault",
      "Bomb Threat",
      "Workplace Harassment",
      "Domestic Violence Spillover",
      "Social Engineering",
      "Access Control System Hack",
      "Surveillance System Compromise",
      "Corporate Espionage",
      "Insider Threat"
    ],
    typicalControls: [
      "Card Access System",
      "Biometric Access Control",
      "Security Turnstiles",
      "Man Trap/Vestibule",
      "Multi-Factor Authentication",
      "CCTV System - IP/Network",
      "CCTV System - Outdoor",
      "Video Analytics",
      "Reception/Concierge Staff",
      "Visitor Management System",
      "Visitor Escort Policy",
      "Badge Display Policy",
      "Clear Desk/Screen Policy",
      "Security Awareness Training",
      "Active Threat Response Training",
      "Alarm Monitoring Service",
      "Network Segmentation",
      "Encrypted Credentials",
      "Security System Patch Management",
      "Access Control Policy & Audit",
      "Perimeter Lighting",
      "Parking Lot Lighting",
      "Building Entry Lighting",
      "CPTED Principles - Clear Zones",
      "Security Signage",
      "Emergency Exits/Signage",
      "Fire Alarm System",
      "Fire Suppression System",
      "Key Control System",
      "Incident Response Plan",
      "Background Checks"
    ],
    suggestedZones: [
      { name: "Building Perimeter", zoneType: "perimeter", securityLevel: "public", description: "Exterior property boundary and landscaping" },
      { name: "Parking Lot", zoneType: "parking", securityLevel: "public", description: "Employee and visitor parking areas" },
      { name: "Main Entrance / Lobby", zoneType: "entry", securityLevel: "controlled", description: "Primary building access with reception" },
      { name: "Reception / Waiting Area", zoneType: "lobby", securityLevel: "public", description: "Visitor reception and waiting area" },
      { name: "Office Areas (General)", zoneType: "office", securityLevel: "restricted", description: "General office workspace" },
      { name: "Executive Suite", zoneType: "office", securityLevel: "high_security", description: "Executive offices and conference rooms" },
      { name: "Server Room / IT Closets", zoneType: "server_room", securityLevel: "high_security", description: "IT infrastructure and network equipment" },
      { name: "Conference Rooms", zoneType: "office", securityLevel: "restricted", description: "Meeting and collaboration spaces" },
      { name: "Loading Dock / Service Entrance", zoneType: "loading_dock", securityLevel: "controlled", description: "Deliveries and service access" }
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
      "Organized Retail Crime",
      "Inventory Shrinkage",
      "Insider Threat",
      "Armed Robbery",
      "Credit Card Fraud",
      "Forced Entry",
      "Cargo Theft",
      "Vendor Fraud",
      "Slip, Trip & Fall",
      "Active Shooter",
      "Workplace Harassment"
    ],
    typicalControls: [
      "Electronic Article Surveillance (EAS)",
      "CCTV System - IP/Network",
      "Point-of-Sale (POS) Security System",
      "Cash Management Procedures",
      "Background Checks",
      "Inventory Audit & Shrink Analysis",
      "Security Tags & Anti-Theft Devices",
      "Security Officers - Unarmed",
      "Panic Button / Duress Alarm",
      "Alarm Monitoring Service",
      "Card Access System",
      "Security Awareness Training"
    ],
    suggestedZones: [
      { name: "Sales Floor", zoneType: "office", securityLevel: "public", description: "Customer shopping area" },
      { name: "Stockroom", zoneType: "storage", securityLevel: "restricted", description: "Inventory storage area" },
      { name: "Loading Dock", zoneType: "loading_dock", securityLevel: "controlled", description: "Receiving and shipping area" },
      { name: "Cash Handling Area", zoneType: "restricted", securityLevel: "high_security", description: "Safe room and cash office" },
      { name: "Parking Lot", zoneType: "parking", securityLevel: "public", description: "Customer parking area" }
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
      "Insider Threat",
      "Unauthorized Entry",
      "Forklift/Equipment Accident",
      "Forced Entry",
      "Inventory Shrinkage",
      "Vendor Fraud",
      "Slip, Trip & Fall",
      "Fire Hazard",
      "Active Shooter"
    ],
    typicalControls: [
      "Perimeter Fencing - Chain Link",
      "Vehicle Gates - Automated",
      "Card Access System",
      "CCTV System - IP/Network",
      "Mobile Patrol",
      "Warehouse Management System (WMS)",
      "Visitor Management System",
      "Loading Dock Security Seals",
      "Vehicle Inspection Procedures",
      "Background Checks",
      "Alarm Monitoring Service",
      "Fire Alarm System",
      "Fire Suppression System",
      "Perimeter Lighting"
    ],
    suggestedZones: [
      { name: "Perimeter Fence & Gate", zoneType: "perimeter", securityLevel: "controlled", description: "Property boundary with vehicle access" },
      { name: "Loading Docks", zoneType: "loading_dock", securityLevel: "controlled", description: "Cargo receiving and shipping area" },
      { name: "Storage / Warehouse Floor", zoneType: "storage", securityLevel: "restricted", description: "Main inventory storage area" },
      { name: "Administrative Office", zoneType: "office", securityLevel: "restricted", description: "Office workspace and management" },
      { name: "Yard / Trailer Parking", zoneType: "parking", securityLevel: "controlled", description: "Vehicle and trailer staging area" }
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
      "Unauthorized Entry",
      "Data Breach - Physical Access",
      "Intellectual Property Theft",
      "Insider Threat",
      "Environmental System Failure",
      "Fire Hazard",
      "Flood",
      "Earthquake",
      "Tailgating",
      "Equipment Sabotage",
      "ICS/SCADA Attack"
    ],
    typicalControls: [
      "Biometric Access Control",
      "Card Access System",
      "Man Trap/Vestibule",
      "CCTV System - IP/Network",
      "Video Monitoring Station",
      "Alarm Monitoring Service",
      "Motion Detectors - PIR",
      "Environmental Monitoring System",
      "Fire Alarm System",
      "Fire Suppression System",
      "Redundant Power Systems (UPS/Generator)",
      "Background Checks",
      "Visitor Escort Policy",
      "Network Segmentation"
    ],
    suggestedZones: [
      { name: "Main Entry / Security Vestibule", zoneType: "entry", securityLevel: "high_security", description: "Man-trap entry with biometric access" },
      { name: "Server Hall / Hot Aisle", zoneType: "server_room", securityLevel: "high_security", description: "Primary server equipment area" },
      { name: "Power Systems Room", zoneType: "restricted", securityLevel: "high_security", description: "UPS, generators, and electrical distribution" },
      { name: "Cooling Systems", zoneType: "restricted", securityLevel: "controlled", description: "HVAC and environmental control equipment" },
      { name: "Administrative / NOC", zoneType: "office", securityLevel: "restricted", description: "Network operations center and office space" }
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
      "Equipment Theft",
      "Cash Theft",
      "Forklift/Equipment Accident",
      "Intellectual Property Theft",
      "Unauthorized Entry",
      "Vendor Fraud",
      "Fire Hazard",
      "Insider Threat",
      "ICS/SCADA Attack",
      "Slip, Trip & Fall"
    ],
    typicalControls: [
      "Perimeter Fencing - Chain Link",
      "Vehicle Gates - Automated",
      "Card Access System",
      "CCTV System - IP/Network",
      "Mobile Patrol",
      "Machine Guarding & Safety Interlocks",
      "Hazmat Storage & Handling Procedures",
      "Fire Alarm System",
      "Fire Suppression System",
      "Warehouse Management System (WMS)",
      "Security Awareness Training",
      "Visitor Management System",
      "Visitor Escort Policy",
      "Background Checks",
      "Incident Response Plan"
    ],
    suggestedZones: [
      { name: "Perimeter Fence & Gates", zoneType: "perimeter", securityLevel: "controlled", description: "Exterior property boundary with vehicle gates" },
      { name: "Production Floor", zoneType: "office", securityLevel: "restricted", description: "Main manufacturing and assembly area" },
      { name: "Loading Dock", zoneType: "loading_dock", securityLevel: "controlled", description: "Shipping and receiving area" },
      { name: "Hazmat Storage", zoneType: "storage", securityLevel: "high_security", description: "Controlled storage for hazardous materials" },
      { name: "Administrative Office", zoneType: "office", securityLevel: "restricted", description: "Office space and management area" }
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
