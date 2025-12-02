import { db } from "./db";
import * as schema from "@shared/schema";

interface ThreatData {
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  typicalLikelihood?: string;
  typicalImpact?: string;
  asisCode?: string;
  mitigation?: string;
  examples?: string[];
}

const threats: ThreatData[] = [
  // Physical Intrusion
  {
    name: "Unauthorized Entry",
    category: "Physical Intrusion",
    subcategory: "Perimeter Breach",
    description: "Intruder gains access to facility by breaching perimeter controls such as fences, gates, or walls",
    typicalLikelihood: "medium",
    typicalImpact: "moderate",
    asisCode: "PI-001",
    mitigation: "Install proper fencing (minimum 7ft), CCTV coverage, motion detection, regular patrols",
    examples: ["Climbing over fence", "Cutting through chain-link", "Tailgating through vehicle gate"]
  },
  {
    name: "Forced Entry",
    category: "Physical Intrusion",
    subcategory: "Building Breach",
    description: "Forced entry through doors, windows, or other building openings using tools or physical force",
    typicalLikelihood: "low",
    typicalImpact: "major",
    asisCode: "PI-002",
    mitigation: "Reinforced doors/frames, security glass, door/window sensors, intrusion alarms",
    examples: ["Breaking window glass", "Kicking in door", "Prying open loading dock", "Cutting through wall"]
  },
  {
    name: "Tailgating",
    category: "Physical Intrusion",
    subcategory: "Access Control Bypass",
    description: "Unauthorized person follows authorized person through controlled access point without proper credentials",
    typicalLikelihood: "high",
    typicalImpact: "minor",
    asisCode: "PI-003",
    mitigation: "Anti-tailgating turnstiles, security awareness training, security officers at access points, badge display policy",
    examples: ["Following employee through door", "Pretending to be delivery person", "Social engineering reception"]
  },
  {
    name: "Piggybacking",
    category: "Physical Intrusion",
    subcategory: "Access Control Bypass",
    description: "Unauthorized entry with the knowledge and consent of an authorized person (friendly entry)",
    typicalLikelihood: "very-high",
    typicalImpact: "minor",
    asisCode: "PI-004",
    mitigation: "Strict badge usage policy, visitor management system, security awareness training",
    examples: ["Employee badging in guest", "Contractor sharing badge access"]
  },
  {
    name: "Roof Access",
    category: "Physical Intrusion",
    subcategory: "Elevated Entry",
    description: "Unauthorized access gained through roof via ladders, adjacent buildings, or climbing",
    typicalLikelihood: "low",
    typicalImpact: "moderate",
    asisCode: "PI-005",
    mitigation: "Roof access alarms, perimeter roof sensors, remove climbing aids, CCTV coverage of roof line",
    examples: ["Using adjacent building to access roof", "Ladder placement", "HVAC unit access"]
  },

  // Theft
  {
    name: "Cash Theft",
    category: "Theft",
    subcategory: "Financial Assets",
    description: "Theft of cash from registers, safes, or during transport",
    typicalLikelihood: "medium",
    typicalImpact: "moderate",
    asisCode: "TH-001",
    mitigation: "Cash handling procedures, dual control, time-delay safes, cash limits, armored transport",
    examples: ["Register skimming", "Safe burglary", "Cash-in-transit robbery"]
  },
  {
    name: "Equipment Theft",
    category: "Theft",
    subcategory: "Physical Assets",
    description: "Theft of computers, tools, machinery, or other valuable equipment",
    typicalLikelihood: "medium",
    typicalImpact: "moderate",
    asisCode: "TH-002",
    mitigation: "Asset tracking, cable locks, equipment inventory, CCTV, access controls",
    examples: ["Laptop theft", "Power tool theft", "Medical equipment theft", "IT infrastructure theft"]
  },
  {
    name: "Inventory Shrinkage",
    category: "Theft",
    subcategory: "Merchandise",
    description: "Loss of inventory through employee theft, shoplifting, or supplier fraud",
    typicalLikelihood: "high",
    typicalImpact: "moderate",
    asisCode: "TH-003",
    mitigation: "Inventory controls, CCTV, EAS tags, bag checks, audit procedures",
    examples: ["Employee theft", "Shoplifting", "Loading dock theft", "Vendor theft"]
  },
  {
    name: "Intellectual Property Theft",
    category: "Theft",
    subcategory: "Information Assets",
    description: "Unauthorized copying or theft of proprietary information, trade secrets, or confidential data",
    typicalLikelihood: "medium",
    typicalImpact: "catastrophic",
    asisCode: "TH-004",
    mitigation: "Data classification, access controls, DLP systems, NDAs, clean desk policy, secure disposal",
    examples: ["Document photography", "USB data exfiltration", "Cloud upload", "Insider trading"]
  },
  {
    name: "Vehicle Theft",
    category: "Theft",
    subcategory: "Transportation Assets",
    description: "Theft of company vehicles, executive vehicles, or cargo from vehicles",
    typicalLikelihood: "medium",
    typicalImpact: "moderate",
    asisCode: "TH-005",
    mitigation: "GPS tracking, immobilizers, secure parking, vehicle inspections, cargo locks",
    examples: ["Fleet vehicle theft", "Cargo theft from trucks", "Executive vehicle theft"]
  },

  // Vandalism
  {
    name: "Graffiti",
    category: "Vandalism",
    subcategory: "Property Defacement",
    description: "Spray painting or marking of building exteriors, vehicles, or other property",
    typicalLikelihood: "medium",
    typicalImpact: "minor",
    asisCode: "VA-001",
    mitigation: "Anti-graffiti coatings, lighting, CCTV, rapid removal, landscaping barriers",
    examples: ["Building exterior tagging", "Vehicle vandalism", "Signage defacement"]
  },
  {
    name: "Property Damage",
    category: "Vandalism",
    subcategory: "Physical Destruction",
    description: "Intentional damage to windows, doors, equipment, or other physical assets",
    typicalLikelihood: "low",
    typicalImpact: "moderate",
    asisCode: "VA-002",
    mitigation: "Impact-resistant materials, CCTV, security patrols, access controls",
    examples: ["Window breaking", "Equipment sabotage", "Vehicle damage", "Door damage"]
  },
  {
    name: "Arson",
    category: "Vandalism",
    subcategory: "Fire-Related",
    description: "Intentional fire-setting to damage or destroy property",
    typicalLikelihood: "very-low",
    typicalImpact: "catastrophic",
    asisCode: "VA-003",
    mitigation: "Fire detection systems, sprinklers, combustible material control, CCTV, perimeter security",
    examples: ["Exterior fire setting", "Dumpster fires", "Vehicle arson", "Building arson"]
  },

  // Workplace Violence
  {
    name: "Active Shooter",
    category: "Workplace Violence",
    subcategory: "Mass Casualty",
    description: "Individual actively engaged in killing or attempting to kill people in a confined space",
    typicalLikelihood: "very-low",
    typicalImpact: "catastrophic",
    asisCode: "WV-001",
    mitigation: "Run-Hide-Fight training, lockdown procedures, panic buttons, law enforcement coordination, threat assessment",
    examples: ["Disgruntled employee", "External attacker", "Domestic violence spillover"]
  },
  {
    name: "Assault",
    category: "Workplace Violence",
    subcategory: "Physical Violence",
    description: "Physical attack on employees, visitors, or security personnel",
    typicalLikelihood: "low",
    typicalImpact: "moderate",
    asisCode: "WV-002",
    mitigation: "De-escalation training, panic buttons, security response, workplace violence policy, threat assessment",
    examples: ["Customer attack on employee", "Employee-on-employee violence", "Domestic violence at work"]
  },
  {
    name: "Bomb Threat",
    category: "Workplace Violence",
    subcategory: "Threats",
    description: "Threat of explosive device placement, whether credible or hoax",
    typicalLikelihood: "low",
    typicalImpact: "major",
    asisCode: "WV-003",
    mitigation: "Bomb threat procedures, evacuation plans, search teams, law enforcement liaison, call documentation",
    examples: ["Phone threat", "Email threat", "Written note", "Suspicious package"]
  },
  {
    name: "Workplace Harassment",
    category: "Workplace Violence",
    subcategory: "Threatening Behavior",
    description: "Threatening or intimidating behavior creating hostile work environment",
    typicalLikelihood: "medium",
    typicalImpact: "minor",
    asisCode: "WV-004",
    mitigation: "Clear policies, reporting mechanisms, HR investigation, restraining orders, security awareness",
    examples: ["Verbal threats", "Stalking", "Intimidation", "Harassment"]
  },
  {
    name: "Domestic Violence Spillover",
    category: "Workplace Violence",
    subcategory: "External Threats",
    description: "Domestic violence situation that extends into the workplace",
    typicalLikelihood: "low",
    typicalImpact: "major",
    asisCode: "WV-005",
    mitigation: "Employee support programs, workplace violence policy, photo distribution, parking lot escorts, restraining orders",
    examples: ["Abusive partner at workplace", "Stalking at work", "Threats against employee"]
  },

  // Natural Disaster
  {
    name: "Earthquake",
    category: "Natural Disaster",
    subcategory: "Seismic",
    description: "Ground shaking causing structural damage and potential casualties",
    typicalLikelihood: "varies",
    typicalImpact: "catastrophic",
    asisCode: "ND-001",
    mitigation: "Seismic retrofitting, emergency supplies, evacuation drills, drop-cover-hold training, structural assessments",
    examples: ["Major earthquake", "Aftershock sequence", "Earthquake-triggered fires"]
  },
  {
    name: "Flood",
    category: "Natural Disaster",
    subcategory: "Weather",
    description: "Water inundation from heavy rain, storm surge, or infrastructure failure",
    typicalLikelihood: "varies",
    typicalImpact: "major",
    asisCode: "ND-002",
    mitigation: "Flood barriers, sump pumps, elevated storage, drainage systems, flood insurance, emergency procedures",
    examples: ["Flash flood", "River flooding", "Storm surge", "Pipe burst"]
  },
  {
    name: "Hurricane/Tornado",
    category: "Natural Disaster",
    subcategory: "Weather",
    description: "High-wind event causing structural damage and debris hazards",
    typicalLikelihood: "varies",
    typicalImpact: "catastrophic",
    asisCode: "ND-003",
    mitigation: "Storm shutters, safe rooms, emergency supplies, evacuation procedures, weather monitoring",
    examples: ["Category 4 hurricane", "EF4 tornado", "Tropical storm"]
  },
  {
    name: "Wildfire",
    category: "Natural Disaster",
    subcategory: "Fire",
    description: "Uncontrolled fire in wildland areas threatening facilities",
    typicalLikelihood: "varies",
    typicalImpact: "catastrophic",
    asisCode: "ND-004",
    mitigation: "Defensible space, fire-resistant materials, evacuation plans, air filtration, sprinkler systems",
    examples: ["Forest fire", "Brush fire", "Grassland fire"]
  },
  {
    name: "Pandemic",
    category: "Natural Disaster",
    subcategory: "Health Emergency",
    description: "Widespread infectious disease outbreak affecting operations and personnel",
    typicalLikelihood: "low",
    typicalImpact: "catastrophic",
    asisCode: "ND-005",
    mitigation: "Pandemic plan, remote work capability, hygiene protocols, PPE stockpile, visitor screening",
    examples: ["COVID-19", "Influenza pandemic", "Novel virus outbreak"]
  },

  // Cyber-Physical
  {
    name: "HVAC System Compromise",
    category: "Cyber-Physical",
    subcategory: "Building Systems",
    description: "Cyberattack on HVAC systems causing temperature control loss or system damage",
    typicalLikelihood: "medium",
    typicalImpact: "moderate",
    asisCode: "CP-001",
    mitigation: "Network segmentation, access controls, system monitoring, cybersecurity protocols, backup systems",
    examples: ["Ransomware on BMS", "Temperature manipulation", "HVAC shutdown"]
  },
  {
    name: "Access Control System Hack",
    category: "Cyber-Physical",
    subcategory: "Security Systems",
    description: "Compromise of electronic access control systems to gain unauthorized entry",
    typicalLikelihood: "low",
    typicalImpact: "major",
    asisCode: "CP-002",
    mitigation: "Network security, encrypted credentials, system monitoring, backup manual controls, regular updates",
    examples: ["Badge cloning", "System admin compromise", "Networkacess"]
  },
  {
    name: "Surveillance System Compromise",
    category: "Cyber-Physical",
    subcategory: "Security Systems",
    description: "Hacking or disabling of video surveillance systems",
    typicalLikelihood: "medium",
    typicalImpact: "moderate",
    asisCode: "CP-003",
    mitigation: "Secure network architecture, camera encryption, system redundancy, offline recording backup",
    examples: ["Camera feed manipulation", "DVR/NVR compromise", "Video deletion"]
  },
  {
    name: "ICS/SCADA Attack",
    category: "Cyber-Physical",
    subcategory: "Industrial Controls",
    description: "Cyberattack on industrial control systems or SCADA systems",
    typicalLikelihood: "low",
    typicalImpact: "catastrophic",
    asisCode: "CP-004",
    mitigation: "Air-gapped systems, network segmentation, anomaly detection, OT security, incident response",
    examples: ["Production line sabotage", "Utility system compromise", "Safety system manipulation"]
  },
  {
    name: "Physical Destruction of IT Infrastructure",
    category: "Cyber-Physical",
    subcategory: "Infrastructure",
    description: "Physical attack on servers, network equipment, or data centers",
    typicalLikelihood: "low",
    typicalImpact: "catastrophic",
    asisCode: "CP-005",
    mitigation: "Secure server rooms, access controls, environmental monitoring, backup sites, fire suppression",
    examples: ["Server room sabotage", "Network switch destruction", "Data center fire"]
  },

  // Espionage
  {
    name: "Corporate Espionage",
    category: "Espionage",
    subcategory: "Economic",
    description: "Competitors or foreign entities stealing trade secrets or proprietary information",
    typicalLikelihood: "medium",
    typicalImpact: "catastrophic",
    asisCode: "ES-001",
    mitigation: "Information classification, need-to-know access, background checks, NDA enforcement, TSCM sweeps",
    examples: ["Planted insider", "Social engineering", "Dumpster diving", "Technical surveillance"]
  },
  {
    name: "Listening Device Placement",
    category: "Espionage",
    subcategory: "Technical Surveillance",
    description: "Covert audio or video devices planted to capture confidential communications",
    typicalLikelihood: "low",
    typicalImpact: "catastrophic",
    asisCode: "ES-002",
    mitigation: "Regular TSCM sweeps, secure meeting rooms, phone security, visitor controls",
    examples: ["Conference room bugs", "Phone taps", "Hidden cameras", "Microphone implants"]
  },
  {
    name: "Insider Threat",
    category: "Espionage",
    subcategory: "Internal",
    description: "Trusted employee with access intentionally exfiltrating sensitive information",
    typicalLikelihood: "medium",
    typicalImpact: "catastrophic",
    asisCode: "ES-003",
    mitigation: "Background checks, access controls, behavior monitoring, exit interviews, data loss prevention",
    examples: ["Data theft", "Document copying", "Whistleblowing", "Sabotage"]
  },
  {
    name: "Social Engineering",
    category: "Espionage",
    subcategory: "Human Intelligence",
    description: "Manipulation of employees to divulge sensitive information or grant unauthorized access",
    typicalLikelihood: "high",
    typicalImpact: "moderate",
    asisCode: "ES-004",
    mitigation: "Security awareness training, verification procedures, reporting culture, incident response",
    examples: ["Pretexting", "Phishing", "Baiting", "Tailgating with conversation"]
  },

  // Executive Protection
  {
    name: "Kidnapping/Hostage Taking",
    category: "Executive Protection",
    subcategory: "Personal Safety",
    description: "Abduction of executive for ransom, political leverage, or harm",
    typicalLikelihood: "very-low",
    typicalImpact: "catastrophic",
    asisCode: "EP-001",
    mitigation: "Executive protection detail, travel security, route variation, situational awareness training, K&R insurance",
    examples: ["Express kidnapping", "Tiger kidnapping", "Ransom kidnapping"]
  },
  {
    name: "Assassination Attempt",
    category: "Executive Protection",
    subcategory: "Personal Safety",
    description: "Targeted attack to kill executive or other high-value person",
    typicalLikelihood: "very-low",
    typicalImpact: "catastrophic",
    asisCode: "EP-002",
    mitigation: "Threat assessment, executive protection, residential security, vehicle security, advance work",
    examples: ["Shooting", "Vehicle ramming", "IED", "Poisoning"]
  },
  {
    name: "Stalking",
    category: "Executive Protection",
    subcategory: "Threatening Behavior",
    description: "Persistent following, surveillance, or harassment of executive",
    typicalLikelihood: "low",
    typicalImpact: "moderate",
    asisCode: "EP-003",
    mitigation: "Threat management, restraining orders, residential security, protective intelligence, law enforcement liaison",
    examples: ["Obsessed individual", "Disgruntled former employee", "Activist targeting"]
  },
  {
    name: "Residential Intrusion",
    category: "Executive Protection",
    subcategory: "Home Security",
    description: "Break-in or intrusion at executive's residence",
    typicalLikelihood: "low",
    typicalImpact: "major",
    asisCode: "EP-004",
    mitigation: "Residential security systems, panic rooms, perimeter security, security monitoring, police response",
    examples: ["Home invasion", "Burglary", "Trespassing"]
  },
  {
    name: "Travel Ambush",
    category: "Executive Protection",
    subcategory: "Transportation Security",
    description: "Attack on executive during travel between locations",
    typicalLikelihood: "very-low",
    typicalImpact: "catastrophic",
    asisCode: "EP-005",
    mitigation: "Route variation, advance intelligence, protective drivers, armored vehicles, situational awareness",
    examples: ["Carjacking", "Roadblock ambush", "Follow-home attack"]
  },
  {
    name: "Doxxing/PII Exposure",
    category: "Executive Protection",
    subcategory: "Information Security",
    description: "Public release of executive's personal information creating safety risk",
    typicalLikelihood: "medium",
    typicalImpact: "moderate",
    asisCode: "EP-006",
    mitigation: "Digital footprint reduction, PII protection, family security training, residential address privacy, monitoring",
    examples: ["Address publication", "Family member exposure", "Social media targeting"]
  },
  {
    name: "Targeted Kidnapping - Ransom",
    category: "Executive Protection",
    subcategory: "Kidnapping",
    description: "Planned abduction of executive or family member for financial ransom",
    typicalLikelihood: "very-low",
    typicalImpact: "catastrophic",
    asisCode: "EP-007",
    mitigation: "Executive protection detail, route variation, residential security, travel security protocols, crisis response plan",
    examples: ["Planned abduction for ransom", "Family member kidnapping", "Express kidnapping at ATM"]
  },
  {
    name: "Express Kidnapping",
    category: "Executive Protection",
    subcategory: "Kidnapping",
    description: "Short-term abduction to force ATM withdrawals or immediate ransom",
    typicalLikelihood: "low",
    typicalImpact: "major",
    asisCode: "EP-008",
    mitigation: "Awareness training, route variation, secure transportation, avoid predictable patterns, emergency response protocols",
    examples: ["ATM forced withdrawal", "Short-term detention for cash", "Opportunistic abduction"]
  },
  {
    name: "Home Invasion - Targeted",
    category: "Executive Protection",
    subcategory: "Property Crime",
    description: "Planned invasion of residence targeting high-value assets or occupants",
    typicalLikelihood: "low",
    typicalImpact: "catastrophic",
    asisCode: "EP-009",
    mitigation: "Residential security team, panic room, alarm systems, CCTV monitoring, perimeter security, police liaison",
    examples: ["Planned home invasion", "Safe room breach attempt", "Coordinated residential attack"]
  },
  {
    name: "Stalking - Physical",
    category: "Executive Protection",
    subcategory: "Harassment",
    description: "Persistent following or surveillance of executive by obsessed individual",
    typicalLikelihood: "low",
    typicalImpact: "moderate",
    asisCode: "EP-010",
    mitigation: "Awareness training, surveillance detection, restraining orders, security detail, law enforcement coordination",
    examples: ["Persistent following", "Workplace surveillance", "Pattern observation", "Unwanted contact"]
  },
  {
    name: "Cyberstalking & Doxxing",
    category: "Executive Protection",
    subcategory: "Cyber Threats",
    description: "Online harassment and public disclosure of private information",
    typicalLikelihood: "medium",
    typicalImpact: "moderate",
    asisCode: "EP-011",
    mitigation: "Digital privacy services, social media management, online reputation monitoring, cyber threat intelligence",
    examples: ["Social media harassment", "Public information disclosure", "Online threats", "Location tracking"]
  },
  {
    name: "Assassination/Physical Assault",
    category: "Executive Protection",
    subcategory: "Physical Harm",
    description: "Targeted attack intending to cause death or serious injury",
    typicalLikelihood: "very-low",
    typicalImpact: "catastrophic",
    asisCode: "EP-012",
    mitigation: "Executive protection detail, threat intelligence, route variation, armored vehicles, advance security, crisis response",
    examples: ["Planned assassination", "Physical assault", "Targeted violence", "Ideological attack"]
  },
  {
    name: "Paparazzi/Media Harassment",
    category: "Executive Protection",
    subcategory: "Privacy Invasion",
    description: "Aggressive pursuit by media creating safety and privacy concerns",
    typicalLikelihood: "medium",
    typicalImpact: "minor",
    asisCode: "EP-013",
    mitigation: "Legal team coordination, privacy protocols, secure locations, family security training, public relations management",
    examples: ["Aggressive media pursuit", "Privacy invasion", "Family photography", "Residence surveillance"]
  },
  {
    name: "Protest/Demonstration at Residence",
    category: "Executive Protection",
    subcategory: "Activism",
    description: "Organized protest at executive residence creating security concerns",
    typicalLikelihood: "low",
    typicalImpact: "moderate",
    asisCode: "EP-014",
    mitigation: "Intelligence gathering, law enforcement coordination, perimeter security, family relocation protocols, public relations",
    examples: ["Organized protest", "Demonstration at home", "Activist targeting", "Public pressure campaign"]
  },
];

async function seedThreatLibrary() {
  console.log('🔒 Seeding Threat Library...');
  
  try {
    // Check if threats already exist
    const existing = await db.select().from(schema.threatLibrary).limit(1);
    if (existing.length > 0) {
      console.log('⚠️  Threat library already seeded. Skipping...');
      return;
    }

    // Insert all threats with active flag
    await db.insert(schema.threatLibrary).values(threats.map(t => ({ ...t, active: true })));
    
    console.log(`✅ Successfully seeded ${threats.length} threats`);
    console.log('\nThreat categories:');
    const categories = Array.from(new Set(threats.map(t => t.category)));
    categories.forEach(cat => {
      const count = threats.filter(t => t.category === cat).length;
      console.log(`   - ${cat}: ${count} threats`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding threat library:', error);
    throw error;
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedThreatLibrary()
    .then(() => {
      console.log('\n✅ Threat library seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error during seeding:', error);
      process.exit(1);
    });
}

export { seedThreatLibrary };
