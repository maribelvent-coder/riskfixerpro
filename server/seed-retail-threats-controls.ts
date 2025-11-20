import { db } from './db';
import { threatLibrary, controlLibrary } from '../shared/schema';

// Additional threats for retail, commercial, and facility assessments
const RETAIL_COMMERCIAL_THREATS = [
  {
    name: "Armed Robbery",
    category: "Theft",
    subcategory: "Violent Theft",
    description: "Theft of cash or property using weapons or threat of violence, typically at retail locations or cash-handling businesses",
    typicalLikelihood: "Low",
    typicalImpact: "Critical",
    asisCode: null,
    mitigation: "Panic buttons, cash management procedures, security guards, CCTV surveillance, robbery prevention training",
    examples: ["Register robbery at retail store", "Bank robbery", "Armored car heist"],
    active: true
  },
  {
    name: "Credit Card Fraud",
    category: "Theft",
    subcategory: "Financial Fraud",
    description: "Fraudulent use of credit card information for unauthorized purchases or transactions",
    typicalLikelihood: "Medium",
    typicalImpact: "Medium",
    asisCode: null,
    mitigation: "EMV chip readers, POS security, transaction monitoring, employee training on fraud detection",
    examples: ["Stolen card usage", "Card skimming at POS", "Chargebacks from fraud"],
    active: true
  },
  {
    name: "Vendor Fraud",
    category: "Theft",
    subcategory: "Supply Chain Fraud",
    description: "Fraudulent activities by vendors including invoice fraud, kickbacks, or delivery of inferior goods",
    typicalLikelihood: "Low",
    typicalImpact: "Medium",
    asisCode: null,
    mitigation: "Vendor background checks, invoice auditing, receiving inspection procedures, dual authorization for payments",
    examples: ["Inflated invoices", "Short deliveries", "Kickback schemes"],
    active: true
  },
  {
    name: "Organized Retail Crime",
    category: "Theft",
    subcategory: "Organized Crime",
    description: "Professional theft rings targeting retail merchandise for resale, often involving multiple perpetrators and coordination",
    typicalLikelihood: "Medium",
    typicalImpact: "High",
    asisCode: null,
    mitigation: "Loss prevention teams, CCTV with facial recognition, EAS systems, coordination with law enforcement",
    examples: ["Flash mob theft", "Booster operations", "Return fraud rings"],
    active: true
  },
  {
    name: "Slip, Trip & Fall",
    category: "Workplace Violence",
    subcategory: "Safety Hazards",
    description: "Injuries to employees or customers from slipping, tripping, or falling due to environmental hazards",
    typicalLikelihood: "High",
    typicalImpact: "Medium",
    asisCode: null,
    mitigation: "Regular inspections, proper signage, maintenance procedures, non-slip surfaces, adequate lighting",
    examples: ["Wet floor slip", "Trip over merchandise", "Fall from elevated surface"],
    active: true
  },
  {
    name: "Cargo Theft",
    category: "Theft",
    subcategory: "Transportation Security",
    description: "Theft of goods during transport, loading/unloading, or from storage yards and distribution centers",
    typicalLikelihood: "Medium",
    typicalImpact: "High",
    asisCode: null,
    mitigation: "GPS tracking, dock security, driver vetting, seal verification, yard lighting and fencing",
    examples: ["Trailer theft from yard", "Hijacking in transit", "Dock pilferage"],
    active: true
  },
  {
    name: "Forklift/Equipment Accident",
    category: "Workplace Violence",
    subcategory: "Safety Hazards",
    description: "Injuries or property damage from forklift or warehouse equipment operation",
    typicalLikelihood: "Medium",
    typicalImpact: "High",
    asisCode: null,
    mitigation: "Operator certification, safety training, equipment maintenance, pedestrian separation, warning systems",
    examples: ["Forklift tip-over", "Pedestrian strike", "Rack collision"],
    active: true
  },
  {
    name: "Fire Hazard",
    category: "Natural Disaster",
    subcategory: "Fire",
    description: "Risk of fire from electrical, chemical, or operational sources in facilities",
    typicalLikelihood: "Low",
    typicalImpact: "Critical",
    asisCode: null,
    mitigation: "Fire detection systems, sprinklers, fire extinguishers, egress planning, hot work permits",
    examples: ["Electrical fire", "Chemical fire", "Kitchen fire"],
    active: true
  },
  {
    name: "Equipment Sabotage",
    category: "Vandalism",
    subcategory: "Operational Disruption",
    description: "Intentional damage to production equipment, machinery, or critical infrastructure to disrupt operations",
    typicalLikelihood: "Low",
    typicalImpact: "High",
    asisCode: null,
    mitigation: "Access control to production areas, CCTV monitoring, employee screening, tamper-evident seals",
    examples: ["Disabled production line", "Chemical contamination", "Computer system damage"],
    active: true
  },
  {
    name: "Data Breach - Physical Access",
    category: "Cyber-Physical",
    subcategory: "Data Security",
    description: "Unauthorized physical access to servers, storage media, or data centers leading to data theft or compromise",
    typicalLikelihood: "Low",
    typicalImpact: "Critical",
    asisCode: null,
    mitigation: "Biometric access, man-traps, data center cages, media destruction procedures, visitor escort policies",
    examples: ["Server room intrusion", "Backup tape theft", "USB device insertion"],
    active: true
  },
  {
    name: "Environmental System Failure",
    category: "Natural Disaster",
    subcategory: "Infrastructure Failure",
    description: "Failure of critical environmental systems such as HVAC, cooling, or humidity control in sensitive facilities",
    typicalLikelihood: "Medium",
    typicalImpact: "High",
    asisCode: null,
    mitigation: "Redundant HVAC systems, environmental monitoring, preventive maintenance, backup cooling",
    examples: ["Data center overheating", "Server room flooding", "Chemical storage temperature failure"],
    active: true
  }
];

// Additional controls for retail, commercial, and facility assessments
const RETAIL_COMMERCIAL_CONTROLS = [
  {
    name: "Electronic Article Surveillance (EAS)",
    category: "Surveillance",
    controlType: "Detective",
    description: "Electronic anti-theft system using tags on merchandise that trigger alarms at exits if not deactivated",
    baseWeight: 3,
    reductionPercentage: 45,
    implementationNotes: "Requires tag application to merchandise, sensor gates at exits, and staff trained to respond to alarms",
    estimatedCost: "$5,000-$25,000 for system, ongoing tag costs",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true,
    active: true
  },
  {
    name: "Point-of-Sale (POS) Security System",
    category: "Surveillance",
    controlType: "Detective",
    description: "Security monitoring of cash registers and POS terminals including exception reporting and transaction analysis",
    baseWeight: 4,
    reductionPercentage: 55,
    implementationNotes: "Integrate with POS software, set up exception alerts, train managers on report analysis",
    estimatedCost: "$2,000-$10,000 depending on integration",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false,
    active: true
  },
  {
    name: "Panic Button / Duress Alarm",
    category: "Intrusion Detection",
    controlType: "Detective",
    description: "Emergency button that silently alerts authorities or security during robbery or violent incident",
    baseWeight: 2,
    reductionPercentage: 20,
    implementationNotes: "Install at strategic locations (registers, offices), connect to monitoring service, test regularly",
    estimatedCost: "$500-$2,000 per location",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: true,
    active: true
  },
  {
    name: "Security Tags & Anti-Theft Devices",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Hard tags, cables, and anti-theft devices attached to high-value merchandise to deter theft",
    baseWeight: 3,
    reductionPercentage: 40,
    implementationNotes: "Apply to high-value items, train staff on attachment/removal, audit tag inventory",
    estimatedCost: "$0.10-$10 per tag depending on type",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false,
    active: true
  },
  {
    name: "Cash Management Procedures",
    category: "Procedural Controls",
    controlType: "Preventive",
    description: "Policies for handling, storing, and transporting cash including drop safes, till limits, and counting procedures",
    baseWeight: 4,
    reductionPercentage: 60,
    implementationNotes: "Document procedures, train all cash handlers, enforce till limits, conduct surprise audits",
    estimatedCost: "$1,000-$5,000 for safes and training",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false,
    active: true
  },
  {
    name: "Inventory Audit & Shrink Analysis",
    category: "Procedural Controls",
    controlType: "Detective",
    description: "Regular physical inventory counts and analysis to detect shrinkage from theft, damage, or administrative errors",
    baseWeight: 3,
    reductionPercentage: 35,
    implementationNotes: "Schedule regular cycle counts, analyze shrink by category, investigate anomalies",
    estimatedCost: "Labor cost for counting",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: false,
    active: true
  },
  {
    name: "Security Awareness Training",
    category: "Procedural Controls",
    controlType: "Preventive",
    description: "Training programs for employees on security policies, threat recognition, and incident response",
    baseWeight: 3,
    reductionPercentage: 30,
    implementationNotes: "Include in onboarding, conduct annual refreshers, customize to facility-specific threats",
    estimatedCost: "$50-$200 per employee",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: false,
    active: true
  },
  {
    name: "Warehouse Management System (WMS)",
    category: "Cyber-Physical Security",
    controlType: "Detective",
    description: "Software system tracking inventory movement, location, and status throughout warehouse operations",
    baseWeight: 4,
    reductionPercentage: 50,
    implementationNotes: "Integrate with RF scanners, train operators, configure exception alerts, audit regularly",
    estimatedCost: "$10,000-$100,000+ depending on scale",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true,
    active: true
  },
  {
    name: "Loading Dock Security Seals",
    category: "Physical Barriers",
    controlType: "Detective",
    description: "Tamper-evident seals on trailers and containers to detect unauthorized access during transport or storage",
    baseWeight: 2,
    reductionPercentage: 25,
    implementationNotes: "Train staff on seal inspection, log seal numbers, investigate broken seals immediately",
    estimatedCost: "$0.50-$5 per seal",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false,
    active: true
  },
  {
    name: "Vehicle Inspection Procedures",
    category: "Procedural Controls",
    controlType: "Detective",
    description: "Inspection protocols for incoming and outgoing vehicles at loading docks and gates",
    baseWeight: 3,
    reductionPercentage: 35,
    implementationNotes: "Create inspection checklist, train security/dock staff, document all inspections",
    estimatedCost: "Minimal - labor only",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false,
    active: true
  },
  {
    name: "Environmental Monitoring System",
    category: "Intrusion Detection",
    controlType: "Detective",
    description: "Sensors monitoring temperature, humidity, water, smoke, and other environmental conditions in critical areas",
    baseWeight: 4,
    reductionPercentage: 70,
    implementationNotes: "Install sensors in server rooms, data centers, storage areas; configure alerts; test regularly",
    estimatedCost: "$2,000-$20,000 depending on coverage",
    maintenanceLevel: "Medium",
    trainingRequired: false,
    maintenanceRequired: true,
    active: true
  },
  {
    name: "Redundant Power Systems (UPS/Generator)",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Uninterruptible Power Supply and backup generators to maintain operations during power outages",
    baseWeight: 5,
    reductionPercentage: 85,
    implementationNotes: "Size for critical load, test monthly, maintain fuel supply, train staff on transfer procedures",
    estimatedCost: "$5,000-$500,000+ depending on capacity",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true,
    active: true
  },
  {
    name: "Machine Guarding & Safety Interlocks",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Physical guards and safety interlocks on machinery to prevent operator injury and equipment damage",
    baseWeight: 4,
    reductionPercentage: 75,
    implementationNotes: "Follow OSHA standards, inspect guards regularly, never bypass interlocks, train operators",
    estimatedCost: "$500-$10,000 per machine",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true,
    active: true
  },
  {
    name: "Hazmat Storage & Handling Procedures",
    category: "Procedural Controls",
    controlType: "Preventive",
    description: "Policies and controls for safe storage, handling, and disposal of hazardous materials",
    baseWeight: 5,
    reductionPercentage: 80,
    implementationNotes: "Follow EPA/OSHA regulations, maintain SDS library, provide PPE, train handlers, inspect storage areas",
    estimatedCost: "$5,000-$50,000 for compliant storage",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true,
    active: true
  }
];

async function seedRetailCommercialLibraries() {
  try {
    console.log('Starting retail/commercial threat and control library expansion...');
    
    // Insert new threats (will skip duplicates if name already exists)
    let threatsAdded = 0;
    for (const threat of RETAIL_COMMERCIAL_THREATS) {
      try {
        await db.insert(threatLibrary).values(threat);
        threatsAdded++;
      } catch (error: any) {
        if (error.code !== '23505') { // Not a duplicate key error
          console.error(`Error inserting threat "${threat.name}":`, error.message);
        }
      }
    }
    console.log(`✓ Added ${threatsAdded} new threats to threat_library`);
    
    // Insert new controls (will skip duplicates if name already exists)
    let controlsAdded = 0;
    for (const control of RETAIL_COMMERCIAL_CONTROLS) {
      try {
        await db.insert(controlLibrary).values(control);
        controlsAdded++;
      } catch (error: any) {
        if (error.code !== '23505') { // Not a duplicate key error
          console.error(`Error inserting control "${control.name}":`, error.message);
        }
      }
    }
    console.log(`✓ Added ${controlsAdded} new controls to control_library`);
    
    console.log('\n✓ Library expansion complete!');
    console.log(`Total new entries: ${threatsAdded} threats + ${controlsAdded} controls`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error expanding libraries:', error);
    process.exit(1);
  }
}

seedRetailCommercialLibraries();
