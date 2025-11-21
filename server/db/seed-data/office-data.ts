/**
 * Office Building Template - Seed Data
 * 
 * Focus: Workplace Violence (Human Safety) & Data Security (IP Protection)
 * 
 * Threats: 15 office-specific threats
 * Controls: 60+ security controls for office environments
 */

export const officeThreats = [
  // Workplace Violence Threats (8)
  {
    name: 'Active Shooter',
    category: 'Workplace Violence',
    description: 'Armed individual targeting employees within office premises',
    likelihood: 1,
    impact: 5
  },
  {
    name: 'Domestic Violence Spillover',
    category: 'Workplace Violence',
    description: 'Personal disputes escalating into workplace violence',
    likelihood: 2,
    impact: 4
  },
  {
    name: 'Disgruntled Employee Violence',
    category: 'Workplace Violence',
    description: 'Current or former employee targeting workplace',
    likelihood: 2,
    impact: 4
  },
  {
    name: 'Workplace Harassment - Physical',
    category: 'Workplace Violence',
    description: 'Physical intimidation or assault between employees',
    likelihood: 3,
    impact: 3
  },
  {
    name: 'Stalking - Workplace',
    category: 'Workplace Violence',
    description: 'Unwanted pursuit of employee at work location',
    likelihood: 2,
    impact: 3
  },
  {
    name: 'Protest at Office Location',
    category: 'Workplace Violence',
    description: 'Organized demonstrations targeting company premises',
    likelihood: 2,
    impact: 2
  },
  {
    name: 'Medical Emergency - Cardiac Event',
    category: 'Workplace Violence',
    description: 'Life-threatening medical event requiring immediate response',
    likelihood: 3,
    impact: 4
  },
  {
    name: 'Bomb Threat',
    category: 'Workplace Violence',
    description: 'Threat of explosive device on premises',
    likelihood: 1,
    impact: 5
  },

  // Data Security Threats (7)
  {
    name: 'Social Engineering',
    category: 'Data Security',
    description: 'Manipulation to gain unauthorized access or information',
    likelihood: 4,
    impact: 3
  },
  {
    name: 'Insider Data Theft',
    category: 'Data Security',
    description: 'Employee exfiltrating confidential data',
    likelihood: 3,
    impact: 4
  },
  {
    name: 'Tailgating - Unauthorized Entry',
    category: 'Data Security',
    description: 'Unauthorized person following authorized user into secure area',
    likelihood: 3,
    impact: 3
  },
  {
    name: 'Unescorted Visitor Access',
    category: 'Data Security',
    description: 'Visitors gaining access to restricted areas without supervision',
    likelihood: 3,
    impact: 3
  },
  {
    name: 'Document Theft - Clean Desk Violation',
    category: 'Data Security',
    description: 'Theft of sensitive documents left unattended',
    likelihood: 4,
    impact: 3
  },
  {
    name: 'Device Theft - Laptop/Mobile',
    category: 'Data Security',
    description: 'Theft of company devices containing sensitive data',
    likelihood: 3,
    impact: 4
  },
  {
    name: 'Credential Theft - Phishing',
    category: 'Data Security',
    description: 'Deceptive emails to harvest employee credentials',
    likelihood: 5,
    impact: 3
  }
];

export const officeControls = [
  // Access Control (12 controls)
  {
    name: 'Biometric Access Control',
    category: 'Access Control',
    description: 'Fingerprint or facial recognition for entry',
    effectiveness: 9
  },
  {
    name: 'Badge Access System',
    category: 'Access Control',
    description: 'RFID/NFC card-based entry control',
    effectiveness: 7
  },
  {
    name: 'Visitor Management System',
    category: 'Access Control',
    description: 'Digital check-in with photo ID verification',
    effectiveness: 8
  },
  {
    name: 'Reception Desk - Staffed 24/7',
    category: 'Access Control',
    description: 'Continuous monitoring of building entry',
    effectiveness: 8
  },
  {
    name: 'Mantrap Entry Vestibule',
    category: 'Access Control',
    description: 'Two-door airlock preventing tailgating',
    effectiveness: 9
  },
  {
    name: 'Turnstile Gates',
    category: 'Access Control',
    description: 'Physical barriers ensuring one-person entry',
    effectiveness: 8
  },
  {
    name: 'Security Guard - Lobby',
    category: 'Access Control',
    description: 'Trained personnel managing building access',
    effectiveness: 7
  },
  {
    name: 'After-Hours Access Log',
    category: 'Access Control',
    description: 'Tracking of non-business hours entry',
    effectiveness: 6
  },
  {
    name: 'Visitor Escort Policy',
    category: 'Access Control',
    description: 'Mandatory accompaniment of non-employees',
    effectiveness: 8
  },
  {
    name: 'Access Badge Deactivation Process',
    category: 'Access Control',
    description: 'Immediate revocation upon termination',
    effectiveness: 7
  },
  {
    name: 'Temporary Access Badges',
    category: 'Access Control',
    description: 'Time-limited credentials for visitors/contractors',
    effectiveness: 7
  },
  {
    name: 'Server Room - Biometric Access',
    category: 'Access Control',
    description: 'Multi-factor authentication for critical infrastructure',
    effectiveness: 9
  },

  // Emergency Response (15 controls)
  {
    name: 'Panic Buttons - Desk Mounted',
    category: 'Emergency Response',
    description: 'Silent alarm activation at workstations',
    effectiveness: 8
  },
  {
    name: 'Mass Notification System',
    category: 'Emergency Response',
    description: 'SMS/email/PA alerts to all staff',
    effectiveness: 9
  },
  {
    name: 'Active Shooter Training - Annual',
    category: 'Emergency Response',
    description: 'Run-Hide-Fight protocol training',
    effectiveness: 8
  },
  {
    name: 'Evacuation Plan - Posted',
    category: 'Emergency Response',
    description: 'Visual exit routes on every floor',
    effectiveness: 7
  },
  {
    name: 'Emergency Rally Points',
    category: 'Emergency Response',
    description: 'Designated assembly areas outside building',
    effectiveness: 6
  },
  {
    name: 'AED - Automated External Defibrillator',
    category: 'Emergency Response',
    description: 'Life-saving cardiac response equipment',
    effectiveness: 9
  },
  {
    name: 'First Aid Kits - Every Floor',
    category: 'Emergency Response',
    description: 'Medical supplies accessible throughout facility',
    effectiveness: 7
  },
  {
    name: 'CPR Trained Staff',
    category: 'Emergency Response',
    description: 'Employees certified in emergency medical response',
    effectiveness: 8
  },
  {
    name: 'Lockdown Procedure',
    category: 'Emergency Response',
    description: 'Secure-in-place protocol for active threats',
    effectiveness: 8
  },
  {
    name: 'Emergency Communication Plan',
    category: 'Emergency Response',
    description: 'Chain of command and contact protocols',
    effectiveness: 7
  },
  {
    name: 'Quarterly Evacuation Drills',
    category: 'Emergency Response',
    description: 'Regular practice of emergency procedures',
    effectiveness: 7
  },
  {
    name: 'Severe Weather Shelter Areas',
    category: 'Emergency Response',
    description: 'Interior rooms for tornado/storm protection',
    effectiveness: 6
  },
  {
    name: 'Emergency Contact List',
    category: 'Emergency Response',
    description: 'Key personnel and external responder contacts',
    effectiveness: 6
  },
  {
    name: 'Backup Power - Emergency Lighting',
    category: 'Emergency Response',
    description: 'Battery backup for exit signs and corridors',
    effectiveness: 7
  },
  {
    name: 'Emergency Supply Kit',
    category: 'Emergency Response',
    description: 'Water, food, and first aid for shelter-in-place',
    effectiveness: 6
  },

  // Surveillance & Detection (10 controls)
  {
    name: 'CCTV - Lobby & Entrances',
    category: 'Surveillance & Detection',
    description: 'Video monitoring of all entry points',
    effectiveness: 8
  },
  {
    name: 'CCTV - Parking Areas',
    category: 'Surveillance & Detection',
    description: 'Surveillance of vehicle access zones',
    effectiveness: 7
  },
  {
    name: 'CCTV - Hallways & Common Areas',
    category: 'Surveillance & Detection',
    description: 'Interior monitoring of circulation spaces',
    effectiveness: 7
  },
  {
    name: 'Video Analytics - Intrusion Detection',
    category: 'Surveillance & Detection',
    description: 'AI-powered anomaly detection',
    effectiveness: 8
  },
  {
    name: 'Access Log Monitoring',
    category: 'Surveillance & Detection',
    description: 'Real-time review of entry/exit events',
    effectiveness: 7
  },
  {
    name: 'CCTV Retention - 90 Days',
    category: 'Surveillance & Detection',
    description: 'Video archive for investigation purposes',
    effectiveness: 6
  },
  {
    name: 'Security Operations Center (SOC)',
    category: 'Surveillance & Detection',
    description: 'Centralized monitoring station',
    effectiveness: 9
  },
  {
    name: 'Motion Sensors - After Hours',
    category: 'Surveillance & Detection',
    description: 'Detection of unauthorized presence',
    effectiveness: 7
  },
  {
    name: 'Glass Break Sensors',
    category: 'Surveillance & Detection',
    description: 'Alert on forced entry attempts',
    effectiveness: 7
  },
  {
    name: 'Door Position Sensors',
    category: 'Surveillance & Detection',
    description: 'Monitoring of secure door status',
    effectiveness: 6
  },

  // Data Security (18 controls)
  {
    name: 'Clean Desk Policy',
    category: 'Data Security',
    description: 'Mandatory document removal at end of day',
    effectiveness: 7
  },
  {
    name: 'Locked Filing Cabinets',
    category: 'Data Security',
    description: 'Secure storage for physical documents',
    effectiveness: 6
  },
  {
    name: 'Paper Shredders - Cross-Cut',
    category: 'Data Security',
    description: 'Destruction of sensitive documents',
    effectiveness: 8
  },
  {
    name: 'USB Port Locks',
    category: 'Data Security',
    description: 'Physical prevention of unauthorized data transfer',
    effectiveness: 7
  },
  {
    name: 'Screen Privacy Filters',
    category: 'Data Security',
    description: 'Visual protection from shoulder surfing',
    effectiveness: 6
  },
  {
    name: 'Full Disk Encryption',
    category: 'Data Security',
    description: 'Protection of data at rest on all devices',
    effectiveness: 9
  },
  {
    name: 'Data Loss Prevention (DLP)',
    category: 'Data Security',
    description: 'Monitoring and blocking of data exfiltration',
    effectiveness: 8
  },
  {
    name: 'Email Encryption',
    category: 'Data Security',
    description: 'Secure transmission of sensitive communications',
    effectiveness: 8
  },
  {
    name: 'Multi-Factor Authentication (MFA)',
    category: 'Data Security',
    description: 'Enhanced login security for all systems',
    effectiveness: 9
  },
  {
    name: 'Security Awareness Training',
    category: 'Data Security',
    description: 'Annual education on phishing and social engineering',
    effectiveness: 8
  },
  {
    name: 'Phishing Simulation Tests',
    category: 'Data Security',
    description: 'Regular testing of employee vigilance',
    effectiveness: 7
  },
  {
    name: 'Mobile Device Management (MDM)',
    category: 'Data Security',
    description: 'Remote wipe and encryption enforcement',
    effectiveness: 8
  },
  {
    name: 'Acceptable Use Policy',
    category: 'Data Security',
    description: 'Guidelines for appropriate system usage',
    effectiveness: 6
  },
  {
    name: 'Non-Disclosure Agreements (NDAs)',
    category: 'Data Security',
    description: 'Legal protection for confidential information',
    effectiveness: 7
  },
  {
    name: 'Background Checks - All Staff',
    category: 'Data Security',
    description: 'Pre-employment screening',
    effectiveness: 7
  },
  {
    name: 'Privileged Access Management (PAM)',
    category: 'Data Security',
    description: 'Control of administrative credentials',
    effectiveness: 9
  },
  {
    name: 'Network Segmentation',
    category: 'Data Security',
    description: 'Isolation of sensitive systems',
    effectiveness: 8
  },
  {
    name: 'Printer Security - Pull Printing',
    category: 'Data Security',
    description: 'Documents released only at physical presence',
    effectiveness: 7
  },

  // Workplace Safety (7 controls)
  {
    name: 'Threat Assessment Team',
    category: 'Workplace Safety',
    description: 'Multidisciplinary group evaluating concerning behaviors',
    effectiveness: 8
  },
  {
    name: 'Anonymous Reporting Hotline',
    category: 'Workplace Safety',
    description: 'Confidential channel for safety concerns',
    effectiveness: 7
  },
  {
    name: 'Workplace Violence Policy',
    category: 'Workplace Safety',
    description: 'Zero-tolerance guidelines and procedures',
    effectiveness: 7
  },
  {
    name: 'Termination Escort Protocol',
    category: 'Workplace Safety',
    description: 'Security presence during employee exit process',
    effectiveness: 8
  },
  {
    name: 'Restraining Order Registry',
    category: 'Workplace Safety',
    description: 'Tracking of legal protective orders affecting staff',
    effectiveness: 7
  },
  {
    name: 'De-Escalation Training',
    category: 'Workplace Safety',
    description: 'Conflict resolution skills for employees',
    effectiveness: 7
  },
  {
    name: 'Executive Protection - Selective',
    category: 'Workplace Safety',
    description: 'Enhanced security for high-profile executives',
    effectiveness: 8
  }
];
