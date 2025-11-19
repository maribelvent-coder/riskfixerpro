import { db } from "./db";
import * as schema from "@shared/schema";

interface ControlData {
  name: string;
  category: string;
  controlType: string;
  description: string;
  baseWeight?: number;
  reductionPercentage?: number;
  implementationNotes?: string;
  estimatedCost?: string;
  maintenanceLevel?: string;
  trainingRequired?: boolean;
  maintenanceRequired?: boolean;
}

const controls: ControlData[] = [
  // Access Control
  {
    name: "Card Access System",
    category: "Access Control",
    controlType: "Preventive",
    description: "Electronic badge/card reader system for controlled entry points",
    baseWeight: 4,
    reductionPercentage: 60,
    implementationNotes: "Install readers at all controlled doors, implement proper credential management, integrate with visitor management system",
    estimatedCost: "$5,000-$25,000 per door",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Biometric Access Control",
    category: "Access Control",
    controlType: "Preventive",
    description: "Fingerprint, iris, or facial recognition for high-security access points",
    baseWeight: 5,
    reductionPercentage: 85,
    implementationNotes: "Best for server rooms, R&D labs, executive areas. Ensure backup authentication method available",
    estimatedCost: "$3,000-$10,000 per reader",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Visitor Management System",
    category: "Access Control",
    controlType: "Preventive",
    description: "Digital system for visitor registration, badge printing, and tracking",
    baseWeight: 3,
    reductionPercentage: 40,
    implementationNotes: "Require government ID, photograph visitors, print temporary badges, log entry/exit times",
    estimatedCost: "$2,000-$8,000 annually",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Security Turnstiles",
    category: "Access Control",
    controlType: "Preventive",
    description: "Full-height or waist-high turnstiles preventing tailgating",
    baseWeight: 4,
    reductionPercentage: 75,
    implementationNotes: "Install at main entrances, integrate with badge system, ensure ADA compliance, include emergency release",
    estimatedCost: "$5,000-$20,000 per lane",
    maintenanceLevel: "Medium",
    trainingRequired: false,
    maintenanceRequired: true
  },
  {
    name: "Man Trap/Vestibule",
    category: "Access Control",
    controlType: "Preventive",
    description: "Dual-door access control preventing piggybacking, one door must close before other opens",
    baseWeight: 5,
    reductionPercentage: 90,
    implementationNotes: "Ideal for data centers, R&D facilities. Include weight sensors, door position sensors, and override controls",
    estimatedCost: "$15,000-$50,000",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "PIN Keypad Entry",
    category: "Access Control",
    controlType: "Preventive",
    description: "Numeric keypad requiring code entry for access",
    baseWeight: 2,
    reductionPercentage: 30,
    implementationNotes: "Change codes quarterly, limit code sharing, use unique codes when possible",
    estimatedCost: "$200-$800 per door",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: false
  },
  {
    name: "Key Control System",
    category: "Access Control",
    controlType: "Preventive",
    description: "Automated key dispensing and tracking system",
    baseWeight: 3,
    reductionPercentage: 45,
    implementationNotes: "Audit key usage, require badge authentication for checkout, track key holder history",
    estimatedCost: "$10,000-$30,000",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },

  // Surveillance
  {
    name: "CCTV System - Analog",
    category: "Surveillance",
    controlType: "Detective",
    description: "Traditional analog camera system with DVR recording",
    baseWeight: 3,
    reductionPercentage: 50,
    implementationNotes: "Cover all entry/exit points, cash handling areas, and vulnerable assets. 30-day retention minimum",
    estimatedCost: "$1,000-$3,000 per camera installed",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "CCTV System - IP/Network",
    category: "Surveillance",
    controlType: "Detective",
    description: "High-definition IP cameras with network video recording",
    baseWeight: 4,
    reductionPercentage: 65,
    implementationNotes: "Use PoE for power, implement VLANs for security, enable motion detection and analytics",
    estimatedCost: "$800-$2,500 per camera installed",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Video Analytics",
    category: "Surveillance",
    controlType: "Detective",
    description: "AI-powered video analysis for behavior detection and alerts",
    baseWeight: 4,
    reductionPercentage: 70,
    implementationNotes: "Configure for loitering detection, perimeter breach, object left behind, people counting",
    estimatedCost: "$500-$2,000 per camera license",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "License Plate Recognition (LPR)",
    category: "Surveillance",
    controlType: "Detective",
    description: "Automated license plate capture and database matching",
    baseWeight: 3,
    reductionPercentage: 55,
    implementationNotes: "Install at vehicle entry/exit points, maintain whitelist/blacklist databases, integrate with gate controls",
    estimatedCost: "$5,000-$15,000 per camera",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Body-Worn Cameras",
    category: "Surveillance",
    controlType: "Detective",
    description: "Cameras worn by security officers for evidence documentation",
    baseWeight: 2,
    reductionPercentage: 35,
    implementationNotes: "Establish clear usage policies, ensure adequate battery life, implement secure evidence management",
    estimatedCost: "$300-$800 per camera + storage",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Video Monitoring Station",
    category: "Surveillance",
    controlType: "Detective",
    description: "Centralized security operations center with live video monitoring",
    baseWeight: 4,
    reductionPercentage: 75,
    implementationNotes: "Staff 24/7, limit video wall cameras to prevent operator fatigue, implement standard operating procedures",
    estimatedCost: "$50,000-$200,000",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true
  },

  // Physical Barriers
  {
    name: "Perimeter Fencing - Chain Link",
    category: "Physical Barriers",
    controlType: "Deterrent",
    description: "Chain-link fence surrounding facility perimeter",
    baseWeight: 2,
    reductionPercentage: 30,
    implementationNotes: "Minimum 7 feet high, top guard optional, regular inspections for damage or tunneling",
    estimatedCost: "$15-$40 per linear foot",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: true
  },
  {
    name: "Perimeter Fencing - Ornamental",
    category: "Physical Barriers",
    controlType: "Deterrent",
    description: "Aesthetic wrought iron or aluminum fencing",
    baseWeight: 2,
    reductionPercentage: 25,
    implementationNotes: "6-8 feet high, spear-top design, suitable for corporate campuses",
    estimatedCost: "$30-$100 per linear foot",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: true
  },
  {
    name: "Anti-Ram Bollards",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Fixed or retractable posts preventing vehicle intrusion",
    baseWeight: 5,
    reductionPercentage: 95,
    implementationNotes: "Install at building entrances, loading docks, and pedestrian areas. K-rated for specific threat levels",
    estimatedCost: "$2,000-$8,000 per bollard installed",
    maintenanceLevel: "Medium",
    trainingRequired: false,
    maintenanceRequired: true
  },
  {
    name: "Vehicle Gates - Manual",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Manual swing or slide gates for vehicle access control",
    baseWeight: 2,
    reductionPercentage: 35,
    implementationNotes: "Lock when closed, post signage, ensure adequate gate operator training",
    estimatedCost: "$1,500-$5,000",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Vehicle Gates - Automated",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Motorized gates with access control integration",
    baseWeight: 3,
    reductionPercentage: 55,
    implementationNotes: "Integrate with card readers or LPR, include safety loops and emergency manual operation",
    estimatedCost: "$5,000-$20,000",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Reinforced Doors/Frames",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Commercial-grade doors with reinforced frames and hinges",
    baseWeight: 3,
    reductionPercentage: 60,
    implementationNotes: "Use solid core or metal doors, reinforce strike plates, install properly into frame",
    estimatedCost: "$800-$3,000 per door",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: false
  },
  {
    name: "Security Window Film",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Adhesive film holding shattered glass in place",
    baseWeight: 2,
    reductionPercentage: 40,
    implementationNotes: "8-mil minimum thickness, professionally installed, anchor to frame for blast resistance",
    estimatedCost: "$8-$15 per square foot",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: false
  },
  {
    name: "Bullet-Resistant Glass",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Laminated glass resistant to ballistic threats",
    baseWeight: 5,
    reductionPercentage: 90,
    implementationNotes: "Specify UL 752 level based on threat, ensure proper frame anchoring, consider weight requirements",
    estimatedCost: "$75-$200 per square foot",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: false
  },
  {
    name: "Roll-Down Security Shutters",
    category: "Physical Barriers",
    controlType: "Preventive",
    description: "Metal shutters protecting windows and doors after hours",
    baseWeight: 3,
    reductionPercentage: 70,
    implementationNotes: "Motor recommended for large openings, include manual override, regular lubrication needed",
    estimatedCost: "$1,500-$5,000 per opening",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },

  // Security Personnel
  {
    name: "Security Officers - Unarmed",
    category: "Security Personnel",
    controlType: "Deterrent",
    description: "Professional security officers providing physical presence and deterrence",
    baseWeight: 4,
    reductionPercentage: 65,
    implementationNotes: "Ensure proper licensing, background checks, ongoing training, clear post orders",
    estimatedCost: "$25-$45 per hour",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Security Officers - Armed",
    category: "Security Personnel",
    controlType: "Deterrent",
    description: "Armed security officers for high-risk environments",
    baseWeight: 5,
    reductionPercentage: 80,
    implementationNotes: "Verify firearms training and licensing, liability insurance required, clear use-of-force policy",
    estimatedCost: "$40-$70 per hour",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Reception/Concierge Staff",
    category: "Security Personnel",
    controlType: "Detective",
    description: "Front desk personnel managing visitor access and providing customer service",
    baseWeight: 2,
    reductionPercentage: 30,
    implementationNotes: "Train on visitor management procedures, emergency response, suspicious activity recognition",
    estimatedCost: "$15-$25 per hour",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Mobile Patrol",
    category: "Security Personnel",
    controlType: "Deterrent",
    description: "Vehicle-based security patrols of property perimeter and parking areas",
    baseWeight: 3,
    reductionPercentage: 45,
    implementationNotes: "Use random patrol patterns, include exterior lighting checks, document observations",
    estimatedCost: "$30-$50 per hour",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "K-9 Patrol Teams",
    category: "Security Personnel",
    controlType: "Deterrent",
    description: "Handler and trained dog for patrols and explosive/drug detection",
    baseWeight: 4,
    reductionPercentage: 70,
    implementationNotes: "Regular training and certification required, suitable for large facilities or special events",
    estimatedCost: "$60-$100 per hour",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: false
  },

  // Procedural Controls
  {
    name: "Access Authorization Process",
    category: "Procedural Controls",
    controlType: "Preventive",
    description: "Formal process for requesting, approving, and provisioning access",
    baseWeight: 3,
    reductionPercentage: 50,
    implementationNotes: "Require manager approval, document business justification, periodic access reviews",
    estimatedCost: "Negligible",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Visitor Escort Policy",
    category: "Procedural Controls",
    controlType: "Preventive",
    description: "Requirement that visitors be accompanied by authorized employee",
    baseWeight: 2,
    reductionPercentage: 40,
    implementationNotes: "Enforce in sensitive areas, train employees on escort responsibilities, visible visitor badges required",
    estimatedCost: "Negligible",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Clear Desk/Screen Policy",
    category: "Procedural Controls",
    controlType: "Preventive",
    description: "Policy requiring documents and screens be secured when unattended",
    baseWeight: 2,
    reductionPercentage: 35,
    implementationNotes: "Provide lockable storage, enable automatic screen locks, conduct periodic audits",
    estimatedCost: "Negligible",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Badge Display Policy",
    category: "Procedural Controls",
    controlType: "Preventive",
    description: "Requirement that access badges be visibly worn at all times",
    baseWeight: 2,
    reductionPercentage: 30,
    implementationNotes: "Provide lanyards, enforce through security patrols and employee awareness",
    estimatedCost: "Negligible",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Package Inspection Procedures",
    category: "Procedural Controls",
    controlType: "Detective",
    description: "Process for inspecting bags, packages, and deliveries entering facility",
    baseWeight: 3,
    reductionPercentage: 45,
    implementationNotes: "X-ray scanners for high-security, random inspections elsewhere, clear signage about inspections",
    estimatedCost: "Negligible to $50,000 for X-ray",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Incident Response Plan",
    category: "Procedural Controls",
    controlType: "Corrective",
    description: "Documented procedures for responding to security incidents",
    baseWeight: 4,
    reductionPercentage: 60,
    implementationNotes: "Cover all likely scenarios, train all staff, conduct annual drills, maintain emergency contact lists",
    estimatedCost: "Negligible",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Background Checks",
    category: "Procedural Controls",
    controlType: "Preventive",
    description: "Pre-employment screening of criminal history and credentials",
    baseWeight: 3,
    reductionPercentage: 50,
    implementationNotes: "7-year criminal history minimum, verify employment and education, drug screening for safety-sensitive roles",
    estimatedCost: "$30-$150 per check",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: false
  },

  // Intrusion Detection
  {
    name: "Door/Window Sensors",
    category: "Intrusion Detection",
    controlType: "Detective",
    description: "Magnetic contacts detecting door/window opening",
    baseWeight: 3,
    reductionPercentage: 55,
    implementationNotes: "Install on all perimeter doors/windows, ground floor, and sensitive areas. Test monthly",
    estimatedCost: "$50-$200 per sensor installed",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Motion Detectors - PIR",
    category: "Intrusion Detection",
    controlType: "Detective",
    description: "Passive infrared sensors detecting body heat movement",
    baseWeight: 3,
    reductionPercentage: 60,
    implementationNotes: "Install in corners with 360° coverage, adjust sensitivity to avoid false alarms from HVAC",
    estimatedCost: "$100-$300 per sensor installed",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Glass Break Detectors",
    category: "Intrusion Detection",
    controlType: "Detective",
    description: "Acoustic sensors detecting sound of breaking glass",
    baseWeight: 2,
    reductionPercentage: 40,
    implementationNotes: "One detector can cover 15-20 feet radius, position away from loud HVAC or machinery",
    estimatedCost: "$80-$200 per sensor installed",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Vibration Sensors",
    category: "Intrusion Detection",
    controlType: "Detective",
    description: "Sensors detecting physical attack on walls, fences, or structures",
    baseWeight: 3,
    reductionPercentage: 50,
    implementationNotes: "Use on safes, ATMs, perimeter fencing. Adjust sensitivity to avoid environmental false alarms",
    estimatedCost: "$150-$400 per sensor installed",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Alarm Monitoring Service",
    category: "Intrusion Detection",
    controlType: "Detective",
    description: "24/7 central station monitoring of alarm signals with dispatch",
    baseWeight: 4,
    reductionPercentage: 70,
    implementationNotes: "Maintain current contact lists, test system quarterly, verify guard/police response procedures",
    estimatedCost: "$30-$100 per month",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },

  // Lighting
  {
    name: "Perimeter Lighting",
    category: "Environmental Design",
    controlType: "Deterrent",
    description: "Exterior lighting illuminating facility perimeter and fence line",
    baseWeight: 3,
    reductionPercentage: 45,
    implementationNotes: "Minimum 0.5 footcandles, LED for efficiency, dusk-to-dawn photocells, eliminate dark spots",
    estimatedCost: "$200-$800 per fixture",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: true
  },
  {
    name: "Parking Lot Lighting",
    category: "Environmental Design",
    controlType: "Deterrent",
    description: "Lighting in parking areas to improve visibility and safety",
    baseWeight: 3,
    reductionPercentage: 50,
    implementationNotes: "Minimum 1.0 footcandles, higher near building entrances, consider motion-activated areas",
    estimatedCost: "$500-$2,000 per pole",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: true
  },
  {
    name: "Building Entry Lighting",
    category: "Environmental Design",
    controlType: "Deterrent",
    description: "Enhanced lighting at building entrances and loading docks",
    baseWeight: 2,
    reductionPercentage: 35,
    implementationNotes: "Minimum 5.0 footcandles at doors, ensure even coverage without glare, backup power recommended",
    estimatedCost: "$150-$600 per fixture",
    maintenanceLevel: "Low",
    trainingRequired: false,
    maintenanceRequired: true
  },
  {
    name: "Emergency Lighting",
    category: "Environmental Design",
    controlType: "Corrective",
    description: "Battery-backed lighting for safe egress during power outages",
    baseWeight: 4,
    reductionPercentage: 80,
    implementationNotes: "Test monthly, replace batteries every 3-5 years, ensure code compliance",
    estimatedCost: "$100-$400 per fixture",
    maintenanceLevel: "Medium",
    trainingRequired: false,
    maintenanceRequired: true
  },

  // Cyber-Physical
  {
    name: "Network Segmentation",
    category: "Cyber-Physical Security",
    controlType: "Preventive",
    description: "Separation of security systems from corporate IT network",
    baseWeight: 4,
    reductionPercentage: 70,
    implementationNotes: "Use VLANs or separate switches, implement firewall rules, limit cross-network communication",
    estimatedCost: "$2,000-$10,000",
    maintenanceLevel: "Medium",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Encrypted Credentials",
    category: "Cyber-Physical Security",
    controlType: "Preventive",
    description: "Encryption of access control credentials to prevent cloning",
    baseWeight: 4,
    reductionPercentage: 75,
    implementationNotes: "Use 128-bit or higher encryption, implement multi-factor where possible, regular re-keying",
    estimatedCost: "Included in modern systems",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: false
  },
  {
    name: "Physical Security Information Management (PSIM)",
    category: "Cyber-Physical Security",
    controlType: "Detective",
    description: "Integration platform connecting security systems with automated response",
    baseWeight: 5,
    reductionPercentage: 80,
    implementationNotes: "Integrate access control, video, intrusion, fire. Create correlation rules and automated workflows",
    estimatedCost: "$50,000-$500,000",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true
  },

  // Fire/Life Safety
  {
    name: "Fire Alarm System",
    category: "Fire/Life Safety",
    controlType: "Detective",
    description: "Smoke and heat detection with audible/visual alarms",
    baseWeight: 5,
    reductionPercentage: 90,
    implementationNotes: "Code-required, monthly testing, annual inspections, monitoring station notification",
    estimatedCost: "$3-$10 per square foot",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Fire Suppression System",
    category: "Fire/Life Safety",
    controlType: "Corrective",
    description: "Automatic sprinkler system for fire suppression",
    baseWeight: 5,
    reductionPercentage: 95,
    implementationNotes: "Code-required in most facilities, quarterly inspections, water flow test annually",
    estimatedCost: "$2-$10 per square foot",
    maintenanceLevel: "High",
    trainingRequired: true,
    maintenanceRequired: true
  },
  {
    name: "Emergency Exits/Signage",
    category: "Fire/Life Safety",
    controlType: "Preventive",
    description: "Clearly marked emergency exits with panic hardware",
    baseWeight: 4,
    reductionPercentage: 85,
    implementationNotes: "Code-required, ensure paths clear, panic bars on all emergency exits, illuminated exit signs",
    estimatedCost: "$100-$500 per door",
    maintenanceLevel: "Low",
    trainingRequired: true,
    maintenanceRequired: true
  },
];

async function seedControlLibrary() {
  console.log('🛡️  Seeding Control Library...');
  
  try {
    // Check if controls already exist
    const existing = await db.select().from(schema.controlLibrary).limit(1);
    if (existing.length > 0) {
      console.log('⚠️  Control library already seeded. Skipping...');
      return;
    }

    // Insert all controls with active flag (using defaults from schema for training/maintenanceRequired)
    await db.insert(schema.controlLibrary).values(controls.map(c => ({ ...c, active: true })));
    
    console.log(`✅ Successfully seeded ${controls.length} controls`);
    console.log('\nControl categories:');
    const categories = Array.from(new Set(controls.map(c => c.category)));
    categories.forEach(cat => {
      const count = controls.filter(c => c.category === cat).length;
      console.log(`   - ${cat}: ${count} controls`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding control library:', error);
    throw error;
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedControlLibrary()
    .then(() => {
      console.log('\n✅ Control library seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error during seeding:', error);
      process.exit(1);
    });
}

export { seedControlLibrary };
