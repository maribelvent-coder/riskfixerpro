/**
 * Office Building Security Assessment Interview Questionnaire
 * 
 * Comprehensive 80+ question framework covering physical security, access control,
 * workplace violence prevention, cyber-physical security, and espionage prevention.
 * 
 * Each question includes threat/control mappings for automated risk analysis.
 */

export interface InterviewQuestion {
  id: string;
  section: number;
  category: string;
  subcategory?: string;
  question: string;
  type: 'yes-no' | 'rating' | 'text' | 'photo-text' | 'multiple-choice';
  helpText?: string;
  riskIndicators?: {
    highRisk?: string; // What indicates high risk
    lowRisk?: string;  // What indicates low risk
  };
  threatMappings: string[]; // Threat names from threat_library
  controlMappings: string[]; // Control names from control_library
  conditionalOnQuestionId?: string; // Show only if prerequisite answered
  showWhenAnswer?: string; // Show when prerequisite has this answer
}

export const OFFICE_BUILDING_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // ============================================================================
  // SECTION 1: Perimeter Security & CPTED (Questions 1.1-1.10)
  // ============================================================================
  {
    id: '1.1',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Physical Barriers',
    question: 'Does the facility have perimeter fencing or barriers?',
    type: 'yes-no',
    helpText: 'Perimeter barriers deter unauthorized access and define property boundaries',
    riskIndicators: {
      highRisk: 'No perimeter barriers present',
      lowRisk: 'Complete perimeter protection with anti-climb features'
    },
    threatMappings: ['Forced Entry', 'Unauthorized Entry', 'Tailgating'],
    controlMappings: ['Perimeter Fencing - Chain Link', 'Perimeter Fencing - Anti-Climb']
  },
  {
    id: '1.2',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Physical Barriers',
    question: 'Rate the condition and effectiveness of perimeter fencing (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider height, integrity, anti-climb features, and maintenance',
    threatMappings: ['Forced Entry', 'Unauthorized Entry'],
    controlMappings: ['Perimeter Fencing - Anti-Climb'],
    conditionalOnQuestionId: '1.1',
    showWhenAnswer: 'yes'
  },
  {
    id: '1.3',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Lighting',
    question: 'Is perimeter lighting installed along property boundaries?',
    type: 'yes-no',
    helpText: 'Perimeter lighting deters intruders and aids surveillance',
    riskIndicators: {
      highRisk: 'No perimeter lighting - dark zones around property',
      lowRisk: 'Comprehensive LED lighting with no dark spots'
    },
    threatMappings: ['Forced Entry', 'Unauthorized Entry', 'Graffiti', 'Property Damage'],
    controlMappings: ['Perimeter Lighting']
  },
  {
    id: '1.4',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Lighting',
    question: 'Rate the quality and coverage of perimeter lighting (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Assess illumination levels, dark spots, and operational status',
    threatMappings: ['Forced Entry', 'Unauthorized Entry'],
    controlMappings: ['Perimeter Lighting'],
    conditionalOnQuestionId: '1.3',
    showWhenAnswer: 'yes'
  },
  {
    id: '1.5',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'CPTED',
    question: 'Are clear zones maintained around the building (15-25 feet free of concealment)?',
    type: 'yes-no',
    helpText: 'Clear zones eliminate hiding spots and improve natural surveillance',
    riskIndicators: {
      highRisk: 'Dense vegetation and concealment opportunities near building',
      lowRisk: 'Well-maintained clear zones with low vegetation'
    },
    threatMappings: ['Forced Entry', 'Unauthorized Entry', 'Surveillance & Pattern-of-Life Analysis'],
    controlMappings: ['CPTED Principles - Clear Zones']
  },
  {
    id: '1.6',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Surveillance',
    question: 'Is CCTV coverage provided for the building perimeter?',
    type: 'yes-no',
    helpText: 'Perimeter cameras deter threats and provide evidence',
    threatMappings: ['Forced Entry', 'Unauthorized Entry', 'Graffiti', 'Property Damage'],
    controlMappings: ['CCTV System - Outdoor']
  },
  {
    id: '1.7',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Surveillance',
    question: 'Rate the quality and coverage of perimeter CCTV (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider camera resolution, coverage gaps, night vision, and recording',
    threatMappings: ['Forced Entry', 'Unauthorized Entry'],
    controlMappings: ['CCTV System - Outdoor', 'Video Analytics'],
    conditionalOnQuestionId: '1.6',
    showWhenAnswer: 'yes'
  },
  {
    id: '1.8',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Signage',
    question: 'Is security signage posted at perimeter and entry points?',
    type: 'yes-no',
    helpText: 'Signage warns of surveillance and security measures, deterring intruders',
    threatMappings: ['Unauthorized Entry', 'Tailgating'],
    controlMappings: ['Security Signage']
  },
  {
    id: '1.9',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Vehicle Control',
    question: 'Are vehicle barriers (bollards, gates) installed at critical approach points?',
    type: 'yes-no',
    helpText: 'Vehicle barriers prevent ramming attacks and unauthorized vehicle access',
    threatMappings: ['Forced Entry', 'Vehicle Theft'],
    controlMappings: ['Anti-Ram Bollards', 'Vehicle Gates - Automated']
  },
  {
    id: '1.10',
    section: 1,
    category: 'Perimeter Security',
    subcategory: 'Maintenance',
    question: 'Describe the current maintenance status of perimeter security features',
    type: 'text',
    helpText: 'Note any damaged fencing, non-functional lights, or maintenance issues',
    threatMappings: ['Forced Entry', 'Unauthorized Entry'],
    controlMappings: ['Perimeter Fencing - Chain Link', 'Perimeter Lighting']
  },

  // ============================================================================
  // SECTION 2: Building Entry Points (Questions 2.1-2.10)
  // ============================================================================
  {
    id: '2.1',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Door Security',
    question: 'Rate the physical security of main entrance doors (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider door material, frame strength, hinge protection, and lock quality',
    riskIndicators: {
      highRisk: 'Hollow core doors with weak frames and basic locks',
      lowRisk: 'Solid core/metal doors with reinforced frames and commercial locks'
    },
    threatMappings: ['Forced Entry'],
    controlMappings: ['Reinforced Doors/Frames']
  },
  {
    id: '2.2',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Door Security',
    question: 'Are doors reinforced with commercial-grade locks and strike plates?',
    type: 'yes-no',
    helpText: 'Reinforced doors resist forced entry attempts',
    threatMappings: ['Forced Entry'],
    controlMappings: ['Reinforced Doors/Frames']
  },
  {
    id: '2.3',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Lighting',
    question: 'Is adequate lighting provided at all building entry points?',
    type: 'yes-no',
    helpText: 'Entry lighting deters crime and aids identification',
    riskIndicators: {
      highRisk: 'Dark or poorly lit entry points',
      lowRisk: 'Bright, even lighting at all entrances'
    },
    threatMappings: ['Forced Entry', 'Assault', 'Tailgating'],
    controlMappings: ['Building Entry Lighting']
  },
  {
    id: '2.4',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Lighting',
    question: 'Rate the quality of entry point lighting (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Assess brightness, coverage, and operational status',
    threatMappings: ['Forced Entry', 'Assault'],
    controlMappings: ['Building Entry Lighting'],
    conditionalOnQuestionId: '2.3',
    showWhenAnswer: 'yes'
  },
  {
    id: '2.5',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Surveillance',
    question: 'Are all entry points covered by CCTV cameras?',
    type: 'yes-no',
    helpText: 'Entry point cameras capture all persons entering/exiting',
    threatMappings: ['Forced Entry', 'Tailgating', 'Piggybacking', 'Assault'],
    controlMappings: ['CCTV System - IP/Network']
  },
  {
    id: '2.6',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Surveillance',
    question: 'Rate the quality of entry point CCTV coverage (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider camera angles, resolution, and ability to identify faces',
    threatMappings: ['Tailgating', 'Piggybacking'],
    controlMappings: ['CCTV System - IP/Network'],
    conditionalOnQuestionId: '2.5',
    showWhenAnswer: 'yes'
  },
  {
    id: '2.7',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Emergency Exits',
    question: 'Are emergency exits properly secured with panic hardware and alarms?',
    type: 'yes-no',
    helpText: 'Emergency exits must balance life safety with security',
    threatMappings: ['Forced Entry', 'Unauthorized Entry'],
    controlMappings: ['Emergency Exits/Signage', 'Alarm Monitoring Service']
  },
  {
    id: '2.8',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Loading Dock',
    question: 'Is the loading dock/service entrance secured with access controls?',
    type: 'yes-no',
    helpText: 'Service entrances are high-risk entry points requiring strict controls',
    riskIndicators: {
      highRisk: 'Unsecured loading dock accessible during business hours',
      lowRisk: 'Controlled access with surveillance and vehicle inspection'
    },
    threatMappings: ['Forced Entry', 'Unauthorized Entry', 'Equipment Theft'],
    controlMappings: ['Card Access System', 'CCTV System - IP/Network']
  },
  {
    id: '2.9',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Window Security',
    question: 'Rate the security of ground-floor windows (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider window film, bars, locks, and breakage resistance',
    riskIndicators: {
      highRisk: 'Standard glass windows with no security features',
      lowRisk: 'Security film, reinforced glass, or protective bars'
    },
    threatMappings: ['Forced Entry', 'Graffiti'],
    controlMappings: ['Security Window Film', 'Bullet-Resistant Glass']
  },
  {
    id: '2.10',
    section: 2,
    category: 'Building Entry Points',
    subcategory: 'Roof Access',
    question: 'Is roof access secured and alarmed?',
    type: 'yes-no',
    helpText: 'Roof hatches and access points must be secured to prevent intrusion',
    threatMappings: ['Roof Access', 'Unauthorized Entry'],
    controlMappings: ['Door/Window Sensors', 'Alarm Monitoring Service']
  },

  // ============================================================================
  // SECTION 3: Parking Facilities (Questions 3.1-3.8)
  // ============================================================================
  {
    id: '3.1',
    section: 3,
    category: 'Parking Facilities',
    subcategory: 'Lighting',
    question: 'Is adequate lighting provided throughout parking areas?',
    type: 'yes-no',
    helpText: 'Parking lot lighting improves safety and deters vehicle crime',
    riskIndicators: {
      highRisk: 'Dark parking areas with frequent blind spots',
      lowRisk: 'Well-lit parking with minimum 1.0 footcandles'
    },
    threatMappings: ['Vehicle Theft', 'Assault', 'Domestic Violence Spillover'],
    controlMappings: ['Parking Lot Lighting']
  },
  {
    id: '3.2',
    section: 3,
    category: 'Parking Facilities',
    subcategory: 'Lighting',
    question: 'Rate the quality of parking lot lighting (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Assess illumination levels, dark zones, and maintenance',
    threatMappings: ['Vehicle Theft', 'Assault'],
    controlMappings: ['Parking Lot Lighting'],
    conditionalOnQuestionId: '3.1',
    showWhenAnswer: 'yes'
  },
  {
    id: '3.3',
    section: 3,
    category: 'Parking Facilities',
    subcategory: 'Surveillance',
    question: 'Is CCTV coverage provided for parking areas?',
    type: 'yes-no',
    helpText: 'Parking surveillance deters theft and provides evidence',
    threatMappings: ['Vehicle Theft', 'Equipment Theft', 'Assault'],
    controlMappings: ['CCTV System - Outdoor', 'License Plate Recognition (LPR)']
  },
  {
    id: '3.4',
    section: 3,
    category: 'Parking Facilities',
    subcategory: 'Surveillance',
    question: 'Rate the coverage and quality of parking CCTV (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider camera placement, license plate readability, and coverage gaps',
    threatMappings: ['Vehicle Theft'],
    controlMappings: ['CCTV System - Outdoor', 'License Plate Recognition (LPR)'],
    conditionalOnQuestionId: '3.3',
    showWhenAnswer: 'yes'
  },
  {
    id: '3.5',
    section: 3,
    category: 'Parking Facilities',
    subcategory: 'Access Control',
    question: 'Is vehicle access to parking controlled (gates, barriers, attendants)?',
    type: 'yes-no',
    helpText: 'Controlled parking access prevents unauthorized vehicles',
    threatMappings: ['Vehicle Theft', 'Unauthorized Entry'],
    controlMappings: ['Vehicle Gates - Automated', 'License Plate Recognition (LPR)']
  },
  {
    id: '3.6',
    section: 3,
    category: 'Parking Facilities',
    subcategory: 'CPTED',
    question: 'Are parking areas designed with clear sightlines and natural surveillance?',
    type: 'yes-no',
    helpText: 'Good visibility deters crime in parking facilities',
    threatMappings: ['Vehicle Theft', 'Assault'],
    controlMappings: ['CPTED Principles - Clear Zones']
  },
  {
    id: '3.7',
    section: 3,
    category: 'Parking Facilities',
    subcategory: 'Patrols',
    question: 'Are parking areas included in security patrol routes?',
    type: 'yes-no',
    helpText: 'Regular patrols deter criminal activity',
    threatMappings: ['Vehicle Theft', 'Assault'],
    controlMappings: ['Mobile Patrol', 'Security Officers - Unarmed']
  },
  {
    id: '3.8',
    section: 3,
    category: 'Parking Facilities',
    subcategory: 'Emergency Response',
    question: 'Are emergency call boxes or panic buttons installed in parking areas?',
    type: 'yes-no',
    helpText: 'Emergency communication improves response to incidents',
    threatMappings: ['Assault', 'Domestic Violence Spillover'],
    controlMappings: ['Panic Button / Duress Alarm']
  },

  // ============================================================================
  // SECTION 4: Access Control Systems (Questions 4.1-4.12)
  // ============================================================================
  {
    id: '4.1',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Card Access',
    question: 'Is an electronic card access system installed?',
    type: 'yes-no',
    helpText: 'Card access systems control and log entry to the facility',
    riskIndicators: {
      highRisk: 'No electronic access control - mechanical keys only',
      lowRisk: 'Comprehensive card access with audit logs'
    },
    threatMappings: ['Unauthorized Entry', 'Tailgating', 'Piggybacking'],
    controlMappings: ['Card Access System']
  },
  {
    id: '4.2',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Card Access',
    question: 'Rate the effectiveness of the card access system (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider coverage, reliability, credential management, and audit capabilities',
    threatMappings: ['Unauthorized Entry', 'Tailgating'],
    controlMappings: ['Card Access System'],
    conditionalOnQuestionId: '4.1',
    showWhenAnswer: 'yes'
  },
  {
    id: '4.3',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Anti-Tailgating',
    question: 'Are turnstiles or speed gates installed at main entrances?',
    type: 'yes-no',
    helpText: 'Physical barriers prevent tailgating and piggybacking',
    riskIndicators: {
      highRisk: 'Open entry points with no anti-tailgating measures',
      lowRisk: 'Full-height turnstiles or optical gates with alarms'
    },
    threatMappings: ['Tailgating', 'Piggybacking'],
    controlMappings: ['Security Turnstiles', 'Turnstiles/Speed Gates']
  },
  {
    id: '4.4',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Biometrics',
    question: 'Is biometric access control used for high-security areas?',
    type: 'yes-no',
    helpText: 'Biometrics prevent credential sharing and ensure identity verification',
    threatMappings: ['Unauthorized Entry', 'Insider Threat', 'Intellectual Property Theft'],
    controlMappings: ['Biometric Access Control', 'Man Trap/Vestibule']
  },
  {
    id: '4.5',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Multi-Factor',
    question: 'Is multi-factor authentication required for sensitive areas?',
    type: 'yes-no',
    helpText: 'MFA combines multiple credentials (card + PIN, biometric + card)',
    riskIndicators: {
      highRisk: 'Single-factor authentication only',
      lowRisk: 'Multi-factor required for all restricted areas'
    },
    threatMappings: ['Unauthorized Entry', 'Insider Threat', 'Access Control System Hack'],
    controlMappings: ['Multi-Factor Authentication', 'Biometric Access Control']
  },
  {
    id: '4.6',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Key Management',
    question: 'Is a formal key control system in place for mechanical locks?',
    type: 'yes-no',
    helpText: 'Key control prevents unauthorized key duplication and tracks usage',
    threatMappings: ['Unauthorized Entry', 'Insider Threat'],
    controlMappings: ['Key Control System']
  },
  {
    id: '4.7',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Man Trap',
    question: 'Are man traps or security vestibules used for critical areas (server room, R&D)?',
    type: 'yes-no',
    helpText: 'Man traps ensure only one authorized person enters at a time',
    threatMappings: ['Tailgating', 'Piggybacking', 'Unauthorized Entry'],
    controlMappings: ['Man Trap/Vestibule']
  },
  {
    id: '4.8',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Credential Management',
    question: 'Are access credentials immediately revoked upon employee termination?',
    type: 'yes-no',
    helpText: 'Prompt deprovisioning prevents unauthorized access by former employees',
    riskIndicators: {
      highRisk: 'No formal termination process - delayed credential revocation',
      lowRisk: 'Automated deprovisioning within hours of termination'
    },
    threatMappings: ['Unauthorized Entry', 'Insider Threat', 'Intellectual Property Theft'],
    controlMappings: ['Access Authorization Process', 'Access Control Policy & Audit']
  },
  {
    id: '4.9',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Audit',
    question: 'Are access rights audited quarterly to remove unnecessary permissions?',
    type: 'yes-no',
    helpText: 'Regular audits prevent privilege creep and unauthorized access',
    threatMappings: ['Insider Threat', 'Unauthorized Entry'],
    controlMappings: ['Access Control Policy & Audit']
  },
  {
    id: '4.10',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'After-Hours',
    question: 'Is after-hours access controlled and monitored separately?',
    type: 'yes-no',
    helpText: 'After-hours controls reduce risk when fewer staff are present',
    threatMappings: ['Unauthorized Entry', 'Insider Threat', 'Equipment Theft'],
    controlMappings: ['Card Access System', 'Alarm Monitoring Service']
  },
  {
    id: '4.11',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Logging',
    question: 'Are access logs reviewed regularly for suspicious activity?',
    type: 'yes-no',
    helpText: 'Log review identifies anomalous access patterns',
    threatMappings: ['Insider Threat', 'Unauthorized Entry'],
    controlMappings: ['Access Control Policy & Audit']
  },
  {
    id: '4.12',
    section: 4,
    category: 'Access Control Systems',
    subcategory: 'Integration',
    question: 'Is the access control system integrated with CCTV for visual verification?',
    type: 'yes-no',
    helpText: 'Integration enables verification of access events',
    threatMappings: ['Tailgating', 'Piggybacking', 'Unauthorized Entry'],
    controlMappings: ['Physical Security Information Management (PSIM)']
  },

  // ============================================================================
  // SECTION 5: Visitor Management (Questions 5.1-5.7)
  // ============================================================================
  {
    id: '5.1',
    section: 5,
    category: 'Visitor Management',
    subcategory: 'Registration',
    question: 'Is a formal visitor management system in place?',
    type: 'yes-no',
    helpText: 'Visitor systems log entry, print badges, and track visitor location',
    riskIndicators: {
      highRisk: 'Paper logbook or no visitor tracking',
      lowRisk: 'Digital system with ID scanning and photo capture'
    },
    threatMappings: ['Unauthorized Entry', 'Tailgating', 'Corporate Espionage', 'Social Engineering'],
    controlMappings: ['Visitor Management System']
  },
  {
    id: '5.2',
    section: 5,
    category: 'Visitor Management',
    subcategory: 'Badge Display',
    question: 'Are visible visitor badges required and enforced?',
    type: 'yes-no',
    helpText: 'Visitor badges allow staff to identify non-employees',
    riskIndicators: {
      highRisk: 'No badge requirement or enforcement',
      lowRisk: 'Distinct visitor badges with expiration dates'
    },
    threatMappings: ['Unauthorized Entry', 'Tailgating', 'Social Engineering'],
    controlMappings: ['Visitor Management System', 'Badge Display Policy']
  },
  {
    id: '5.3',
    section: 5,
    category: 'Visitor Management',
    subcategory: 'Escort Policy',
    question: 'Are visitors required to be escorted in non-public areas?',
    type: 'yes-no',
    helpText: 'Escort policies prevent unauthorized access to sensitive areas',
    riskIndicators: {
      highRisk: 'Visitors roam freely without escorts',
      lowRisk: 'Strict escort policy enforced by security and staff'
    },
    threatMappings: ['Corporate Espionage', 'Intellectual Property Theft', 'Social Engineering'],
    controlMappings: ['Visitor Escort Policy']
  },
  {
    id: '5.4',
    section: 5,
    category: 'Visitor Management',
    subcategory: 'Reception',
    question: 'Is reception staffed during business hours to greet and screen visitors?',
    type: 'yes-no',
    helpText: 'Reception staff provide first line of defense against unauthorized entry',
    threatMappings: ['Unauthorized Entry', 'Tailgating', 'Social Engineering'],
    controlMappings: ['Reception/Concierge Staff']
  },
  {
    id: '5.5',
    section: 5,
    category: 'Visitor Management',
    subcategory: 'ID Verification',
    question: 'Is government-issued ID required and verified for all visitors?',
    type: 'yes-no',
    helpText: 'ID verification deters malicious visitors and creates accountability',
    threatMappings: ['Social Engineering', 'Corporate Espionage'],
    controlMappings: ['Visitor Management System']
  },
  {
    id: '5.6',
    section: 5,
    category: 'Visitor Management',
    subcategory: 'Contractor Management',
    question: 'Are contractors and vendors subject to the same access controls as visitors?',
    type: 'yes-no',
    helpText: 'Contractors require similar controls due to regular facility access',
    threatMappings: ['Insider Threat', 'Social Engineering', 'Intellectual Property Theft'],
    controlMappings: ['Visitor Management System', 'Background Checks']
  },
  {
    id: '5.7',
    section: 5,
    category: 'Visitor Management',
    subcategory: 'Deliveries',
    question: 'Are package deliveries screened and logged before entering the facility?',
    type: 'yes-no',
    helpText: 'Package screening prevents introduction of contraband or threats',
    threatMappings: ['Bomb Threat', 'Forced Entry'],
    controlMappings: ['Package Inspection Procedures', 'Reception/Concierge Staff']
  },

  // ============================================================================
  // SECTION 6: Video Surveillance (Questions 6.1-6.9)
  // ============================================================================
  {
    id: '6.1',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Coverage',
    question: 'Is CCTV coverage provided for interior common areas?',
    type: 'yes-no',
    helpText: 'Interior cameras cover lobbies, hallways, and common spaces',
    riskIndicators: {
      highRisk: 'No interior surveillance coverage',
      lowRisk: 'Comprehensive coverage of all common areas'
    },
    threatMappings: ['Assault', 'Equipment Theft', 'Intellectual Property Theft', 'Insider Threat'],
    controlMappings: ['CCTV System - IP/Network']
  },
  {
    id: '6.2',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Coverage',
    question: 'Rate the overall CCTV coverage of the facility (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider interior, exterior, entry points, and critical areas',
    threatMappings: ['Equipment Theft', 'Assault', 'Insider Threat'],
    controlMappings: ['CCTV System - IP/Network', 'CCTV System - Outdoor'],
    conditionalOnQuestionId: '6.1',
    showWhenAnswer: 'yes'
  },
  {
    id: '6.3',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Recording',
    question: 'Are cameras recording 24/7 with minimum 30-day retention?',
    type: 'yes-no',
    helpText: 'Continuous recording and retention enables investigation',
    threatMappings: ['Equipment Theft', 'Assault', 'Insider Threat'],
    controlMappings: ['CCTV System - IP/Network']
  },
  {
    id: '6.4',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Quality',
    question: 'Is camera resolution sufficient for facial identification (minimum 1080p)?',
    type: 'yes-no',
    helpText: 'High resolution enables identification of individuals',
    threatMappings: ['Tailgating', 'Piggybacking', 'Assault'],
    controlMappings: ['CCTV System - IP/Network']
  },
  {
    id: '6.5',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Analytics',
    question: 'Are video analytics deployed (motion detection, loitering, line crossing)?',
    type: 'yes-no',
    helpText: 'Analytics provide automated alerts for suspicious activity',
    threatMappings: ['Unauthorized Entry', 'Insider Threat', 'Equipment Theft'],
    controlMappings: ['Video Analytics']
  },
  {
    id: '6.6',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Monitoring',
    question: 'Is live video monitored by security personnel?',
    type: 'yes-no',
    helpText: 'Live monitoring enables real-time response to incidents',
    threatMappings: ['Active Shooter', 'Assault', 'Equipment Theft'],
    controlMappings: ['Video Monitoring Station', 'Security Officers - Unarmed']
  },
  {
    id: '6.7',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Cyber Security',
    question: 'Are surveillance systems on a separate network from corporate IT?',
    type: 'yes-no',
    helpText: 'Network segmentation protects cameras from cyber attacks',
    riskIndicators: {
      highRisk: 'CCTV on corporate network - vulnerable to compromise',
      lowRisk: 'Dedicated VLAN or physical network for surveillance'
    },
    threatMappings: ['Surveillance System Compromise', 'Access Control System Hack'],
    controlMappings: ['Network Segmentation']
  },
  {
    id: '6.8',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Maintenance',
    question: 'Are cameras regularly maintained and non-functional units promptly repaired?',
    type: 'yes-no',
    helpText: 'Maintenance ensures continuous surveillance capability',
    threatMappings: ['Equipment Theft', 'Assault', 'Insider Threat'],
    controlMappings: ['CCTV System - IP/Network']
  },
  {
    id: '6.9',
    section: 6,
    category: 'Video Surveillance',
    subcategory: 'Backup',
    question: 'Is video footage backed up to prevent loss from system failure?',
    type: 'yes-no',
    helpText: 'Backup protects evidence from hardware failure or tampering',
    threatMappings: ['Surveillance System Compromise'],
    controlMappings: ['CCTV System - IP/Network']
  },

  // ============================================================================
  // SECTION 7: Asset Protection (Questions 7.1-7.6)
  // ============================================================================
  {
    id: '7.1',
    section: 7,
    category: 'Asset Protection',
    subcategory: 'Tracking',
    question: 'Is an asset tracking system in place for IT equipment and valuables?',
    type: 'yes-no',
    helpText: 'Asset tracking deters theft and aids recovery',
    riskIndicators: {
      highRisk: 'No asset inventory or tracking',
      lowRisk: 'RFID tags or barcodes with regular audits'
    },
    threatMappings: ['Equipment Theft', 'Insider Threat'],
    controlMappings: ['Key Control System']
  },
  {
    id: '7.2',
    section: 7,
    category: 'Asset Protection',
    subcategory: 'Physical Security',
    question: 'Are high-value assets secured with cable locks or locked enclosures?',
    type: 'yes-no',
    helpText: 'Physical security measures deter opportunistic theft',
    threatMappings: ['Equipment Theft'],
    controlMappings: ['Key Control System']
  },
  {
    id: '7.3',
    section: 7,
    category: 'Asset Protection',
    subcategory: 'Server Room',
    question: 'Is the server room/IT closet secured with restricted access controls?',
    type: 'yes-no',
    helpText: 'Server room access should be limited to authorized IT staff',
    riskIndicators: {
      highRisk: 'Server room accessible to all employees',
      lowRisk: 'Biometric or multi-factor access with audit logs'
    },
    threatMappings: ['Physical Destruction of IT Infrastructure', 'Intellectual Property Theft', 'Insider Threat'],
    controlMappings: ['Biometric Access Control', 'Man Trap/Vestibule']
  },
  {
    id: '7.4',
    section: 7,
    category: 'Asset Protection',
    subcategory: 'Server Room',
    question: 'Rate the physical security of the server room (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider access controls, environmental monitoring, and fire suppression',
    threatMappings: ['Physical Destruction of IT Infrastructure'],
    controlMappings: ['Biometric Access Control', 'Fire Suppression System'],
    conditionalOnQuestionId: '7.3',
    showWhenAnswer: 'yes'
  },
  {
    id: '7.5',
    section: 7,
    category: 'Asset Protection',
    subcategory: 'Inventory',
    question: 'Are regular asset audits conducted to identify missing equipment?',
    type: 'yes-no',
    helpText: 'Audits detect theft and ensure inventory accuracy',
    threatMappings: ['Equipment Theft', 'Insider Threat'],
    controlMappings: ['Access Control Policy & Audit']
  },
  {
    id: '7.6',
    section: 7,
    category: 'Asset Protection',
    subcategory: 'Disposal',
    question: 'Is a secure disposal process used for sensitive equipment and documents?',
    type: 'yes-no',
    helpText: 'Secure disposal prevents data breaches from discarded materials',
    threatMappings: ['Intellectual Property Theft', 'Corporate Espionage'],
    controlMappings: ['Clear Desk/Screen Policy']
  },

  // ============================================================================
  // SECTION 8: Information Security (Questions 8.1-8.6)
  // ============================================================================
  {
    id: '8.1',
    section: 8,
    category: 'Information Security',
    subcategory: 'Clear Desk',
    question: 'Is a clear desk/screen policy enforced for sensitive information?',
    type: 'yes-no',
    helpText: 'Clear desk policy prevents visual hacking and document theft',
    riskIndicators: {
      highRisk: 'Confidential documents left on desks overnight',
      lowRisk: 'Policy enforced with spot checks and lockable storage'
    },
    threatMappings: ['Intellectual Property Theft', 'Corporate Espionage', 'Social Engineering'],
    controlMappings: ['Clear Desk/Screen Policy']
  },
  {
    id: '8.2',
    section: 8,
    category: 'Information Security',
    subcategory: 'Data Protection',
    question: 'Rate the protection of confidential information and documents (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider access controls, storage, classification, and disposal',
    riskIndicators: {
      highRisk: 'No data classification or protection measures',
      lowRisk: 'Classified data with need-to-know access and DLP'
    },
    threatMappings: ['Intellectual Property Theft', 'Corporate Espionage', 'Insider Threat'],
    controlMappings: ['Clear Desk/Screen Policy', 'Access Authorization Process']
  },
  {
    id: '8.3',
    section: 8,
    category: 'Information Security',
    subcategory: 'Meetings',
    question: 'Are conference rooms secured to prevent eavesdropping on sensitive discussions?',
    type: 'yes-no',
    helpText: 'Secure meeting rooms prevent corporate espionage',
    threatMappings: ['Corporate Espionage', 'Listening Device Placement'],
    controlMappings: ['Access Authorization Process']
  },
  {
    id: '8.4',
    section: 8,
    category: 'Information Security',
    subcategory: 'Meetings',
    question: 'Rate the security of conference/meeting rooms (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider soundproofing, access controls, and TSCM sweeps',
    threatMappings: ['Corporate Espionage', 'Listening Device Placement'],
    controlMappings: ['Access Authorization Process'],
    conditionalOnQuestionId: '8.3',
    showWhenAnswer: 'yes'
  },
  {
    id: '8.5',
    section: 8,
    category: 'Information Security',
    subcategory: 'Document Control',
    question: 'Are sensitive documents marked, tracked, and stored securely?',
    type: 'yes-no',
    helpText: 'Document control prevents unauthorized disclosure',
    threatMappings: ['Intellectual Property Theft', 'Corporate Espionage'],
    controlMappings: ['Clear Desk/Screen Policy', 'Access Authorization Process']
  },
  {
    id: '8.6',
    section: 8,
    category: 'Information Security',
    subcategory: 'Document Control',
    question: 'Rate document control procedures (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider classification, labeling, tracking, and destruction',
    threatMappings: ['Intellectual Property Theft', 'Corporate Espionage'],
    controlMappings: ['Clear Desk/Screen Policy'],
    conditionalOnQuestionId: '8.5',
    showWhenAnswer: 'yes'
  },

  // ============================================================================
  // SECTION 9: Personnel Security (Questions 9.1-9.5)
  // ============================================================================
  {
    id: '9.1',
    section: 9,
    category: 'Personnel Security',
    subcategory: 'Training',
    question: 'Is security awareness training provided to all employees?',
    type: 'yes-no',
    helpText: 'Training educates staff on tailgating, social engineering, and reporting',
    riskIndicators: {
      highRisk: 'No security training program',
      lowRisk: 'Annual training with testing and accountability'
    },
    threatMappings: ['Tailgating', 'Piggybacking', 'Social Engineering', 'Phishing'],
    controlMappings: ['Security Awareness Training']
  },
  {
    id: '9.2',
    section: 9,
    category: 'Personnel Security',
    subcategory: 'Screening',
    question: 'Are background checks conducted on all employees prior to hire?',
    type: 'yes-no',
    helpText: 'Background checks identify criminal history and credential verification',
    riskIndicators: {
      highRisk: 'No pre-employment screening',
      lowRisk: '7-year criminal history and employment verification'
    },
    threatMappings: ['Insider Threat', 'Intellectual Property Theft', 'Corporate Espionage'],
    controlMappings: ['Background Checks']
  },
  {
    id: '9.3',
    section: 9,
    category: 'Personnel Security',
    subcategory: 'Badge Policy',
    question: 'Are employees required to visibly display ID badges at all times?',
    type: 'yes-no',
    helpText: 'Badge display enables staff to identify unauthorized persons',
    riskIndicators: {
      highRisk: 'No badge display requirement',
      lowRisk: 'Enforced policy with different colors for staff/visitors'
    },
    threatMappings: ['Tailgating', 'Social Engineering', 'Unauthorized Entry'],
    controlMappings: ['Badge Display Policy']
  },
  {
    id: '9.4',
    section: 9,
    category: 'Personnel Security',
    subcategory: 'Reporting',
    question: 'Is there a clear process for employees to report security incidents?',
    type: 'yes-no',
    helpText: 'Reporting mechanisms enable rapid response to threats',
    threatMappings: ['Insider Threat', 'Workplace Harassment', 'Social Engineering'],
    controlMappings: ['Incident Response Plan']
  },
  {
    id: '9.5',
    section: 9,
    category: 'Personnel Security',
    subcategory: 'Termination',
    question: 'Is a formal off-boarding process used for terminated employees?',
    type: 'yes-no',
    helpText: 'Off-boarding ensures credential revocation and property return',
    riskIndicators: {
      highRisk: 'Informal termination process - delayed revocations',
      lowRisk: 'Checklist-driven process with immediate deprovisioning'
    },
    threatMappings: ['Insider Threat', 'Intellectual Property Theft'],
    controlMappings: ['Access Authorization Process', 'Access Control Policy & Audit']
  },

  // ============================================================================
  // SECTION 10: Workplace Violence Prevention (Questions 10.1-10.6)
  // ============================================================================
  {
    id: '10.1',
    section: 10,
    category: 'Workplace Violence Prevention',
    subcategory: 'Training',
    question: 'Has active threat response training (Run-Hide-Fight, ALICE) been provided?',
    type: 'yes-no',
    helpText: 'Active threat training prepares employees to respond to violence',
    riskIndicators: {
      highRisk: 'No active threat training conducted',
      lowRisk: 'Annual training with drills and law enforcement coordination'
    },
    threatMappings: ['Active Shooter', 'Assault', 'Bomb Threat'],
    controlMappings: ['Active Threat Response Training']
  },
  {
    id: '10.2',
    section: 10,
    category: 'Workplace Violence Prevention',
    subcategory: 'Emergency Response',
    question: 'Are panic buttons or duress alarms installed in key locations?',
    type: 'yes-no',
    helpText: 'Panic buttons enable rapid notification of security and law enforcement',
    threatMappings: ['Active Shooter', 'Assault', 'Bomb Threat', 'Domestic Violence Spillover'],
    controlMappings: ['Panic Button / Duress Alarm']
  },
  {
    id: '10.3',
    section: 10,
    category: 'Workplace Violence Prevention',
    subcategory: 'Planning',
    question: 'Is a documented incident response plan in place for workplace violence?',
    type: 'yes-no',
    helpText: 'Response plans coordinate actions during violent incidents',
    riskIndicators: {
      highRisk: 'No documented violence response plan',
      lowRisk: 'Tested plan with law enforcement coordination'
    },
    threatMappings: ['Active Shooter', 'Assault', 'Bomb Threat'],
    controlMappings: ['Incident Response Plan']
  },
  {
    id: '10.4',
    section: 10,
    category: 'Workplace Violence Prevention',
    subcategory: 'Policy',
    question: 'Is a workplace violence policy communicated to all employees?',
    type: 'yes-no',
    helpText: 'Policy sets expectations and provides reporting procedures',
    threatMappings: ['Assault', 'Workplace Harassment', 'Domestic Violence Spillover'],
    controlMappings: ['Incident Response Plan']
  },
  {
    id: '10.5',
    section: 10,
    category: 'Workplace Violence Prevention',
    subcategory: 'Lockdown',
    question: 'Are lockdown procedures established and regularly tested?',
    type: 'yes-no',
    helpText: 'Lockdown procedures secure the facility during active threats',
    riskIndicators: {
      highRisk: 'No lockdown capability or procedures',
      lowRisk: 'Tested procedures with remote door locking capability'
    },
    threatMappings: ['Active Shooter', 'Bomb Threat'],
    controlMappings: ['Active Threat Response Training', 'Card Access System']
  },
  {
    id: '10.6',
    section: 10,
    category: 'Workplace Violence Prevention',
    subcategory: 'Threat Assessment',
    question: 'Is a threat assessment process in place for concerning behaviors?',
    type: 'yes-no',
    helpText: 'Threat assessment identifies and mitigates risks before violence occurs',
    threatMappings: ['Active Shooter', 'Assault', 'Workplace Harassment'],
    controlMappings: ['Incident Response Plan', 'Background Checks']
  },

  // ============================================================================
  // SECTION 11: Cyber-Physical Security (Questions 11.1-11.5)
  // ============================================================================
  {
    id: '11.1',
    section: 11,
    category: 'Cyber-Physical Security',
    subcategory: 'Network Segmentation',
    question: 'Are security systems on a separate network from corporate IT?',
    type: 'yes-no',
    helpText: 'Segmentation protects security systems from cyber attacks',
    riskIndicators: {
      highRisk: 'All systems on flat corporate network',
      lowRisk: 'VLAN segregation with firewall rules'
    },
    threatMappings: ['Access Control System Hack', 'Surveillance System Compromise', 'HVAC System Compromise'],
    controlMappings: ['Network Segmentation']
  },
  {
    id: '11.2',
    section: 11,
    category: 'Cyber-Physical Security',
    subcategory: 'Authentication',
    question: 'Is multi-factor authentication used for security system access?',
    type: 'yes-no',
    helpText: 'MFA prevents unauthorized access to security system management',
    riskIndicators: {
      highRisk: 'Default passwords or single-factor authentication',
      lowRisk: 'MFA required for all administrative access'
    },
    threatMappings: ['Access Control System Hack', 'Surveillance System Compromise'],
    controlMappings: ['Multi-Factor Authentication', 'Encrypted Credentials']
  },
  {
    id: '11.3',
    section: 11,
    category: 'Cyber-Physical Security',
    subcategory: 'Patch Management',
    question: 'Is a regular patch management schedule maintained for security systems?',
    type: 'yes-no',
    helpText: 'Patching closes vulnerabilities in security system firmware',
    riskIndicators: {
      highRisk: 'No patching schedule - systems running outdated firmware',
      lowRisk: 'Quarterly patching with testing procedures'
    },
    threatMappings: ['Access Control System Hack', 'Surveillance System Compromise', 'ICS/SCADA Attack'],
    controlMappings: ['Security System Patch Management']
  },
  {
    id: '11.4',
    section: 11,
    category: 'Cyber-Physical Security',
    subcategory: 'CCTV Security',
    question: 'Rate the cyber security of the CCTV system (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider encryption, password strength, network isolation, and firmware updates',
    threatMappings: ['Surveillance System Compromise'],
    controlMappings: ['Network Segmentation', 'Encrypted Credentials', 'Security System Patch Management']
  },
  {
    id: '11.5',
    section: 11,
    category: 'Cyber-Physical Security',
    subcategory: 'Physical Access',
    question: 'Is physical access to security system equipment (servers, panels) restricted?',
    type: 'yes-no',
    helpText: 'Physical access controls prevent tampering with security infrastructure',
    threatMappings: ['Physical Destruction of IT Infrastructure', 'Surveillance System Compromise'],
    controlMappings: ['Biometric Access Control', 'Card Access System']
  },

  // ============================================================================
  // SECTION 12: Espionage Prevention (Questions 12.1-12.4)
  // ============================================================================
  {
    id: '12.1',
    section: 12,
    category: 'Espionage Prevention',
    subcategory: 'Visitor Escort',
    question: 'Are visitors escorted at all times in non-public areas?',
    type: 'yes-no',
    helpText: 'Escorts prevent unauthorized information gathering',
    riskIndicators: {
      highRisk: 'Visitors roam freely in sensitive areas',
      lowRisk: 'Mandatory escort policy with trained staff'
    },
    threatMappings: ['Corporate Espionage', 'Listening Device Placement', 'Social Engineering'],
    controlMappings: ['Visitor Escort Policy']
  },
  {
    id: '12.2',
    section: 12,
    category: 'Espionage Prevention',
    subcategory: 'Meeting Security',
    question: 'Rate the security of confidential meeting spaces (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider soundproofing, white noise, and TSCM sweep frequency',
    threatMappings: ['Corporate Espionage', 'Listening Device Placement'],
    controlMappings: ['Access Authorization Process']
  },
  {
    id: '12.3',
    section: 12,
    category: 'Espionage Prevention',
    subcategory: 'Document Control',
    question: 'Rate the security of confidential document handling (1=Poor, 5=Excellent)',
    type: 'rating',
    helpText: 'Consider classification, storage, distribution, and destruction procedures',
    riskIndicators: {
      highRisk: 'No document classification or control procedures',
      lowRisk: 'Classified documents with tracking and secure disposal'
    },
    threatMappings: ['Intellectual Property Theft', 'Corporate Espionage', 'Insider Threat'],
    controlMappings: ['Clear Desk/Screen Policy', 'Access Authorization Process']
  },
  {
    id: '12.4',
    section: 12,
    category: 'Espionage Prevention',
    subcategory: 'Insider Threat',
    question: 'Are insider threat indicators monitored and investigated?',
    type: 'yes-no',
    helpText: 'Monitoring detects suspicious employee behaviors',
    threatMappings: ['Insider Threat', 'Intellectual Property Theft', 'Corporate Espionage'],
    controlMappings: ['Background Checks', 'Access Control Policy & Audit']
  },

  // ============================================================================
  // SECTION 13: General Observations (Questions 13.1-13.3)
  // ============================================================================
  {
    id: '13.1',
    section: 13,
    category: 'General Observations',
    subcategory: 'Access Audits',
    question: 'Are access rights audited and updated quarterly?',
    type: 'yes-no',
    helpText: 'Regular audits prevent privilege creep and unauthorized access',
    riskIndicators: {
      highRisk: 'No audit process - stale permissions accumulate',
      lowRisk: 'Quarterly audits with management approval'
    },
    threatMappings: ['Insider Threat', 'Unauthorized Entry'],
    controlMappings: ['Access Control Policy & Audit']
  },
  {
    id: '13.2',
    section: 13,
    category: 'General Observations',
    subcategory: 'Overall Assessment',
    question: 'Describe the overall security posture and any notable strengths',
    type: 'text',
    helpText: 'Provide qualitative assessment of security program maturity',
    threatMappings: [],
    controlMappings: []
  },
  {
    id: '13.3',
    section: 13,
    category: 'General Observations',
    subcategory: 'Overall Assessment',
    question: 'Describe the most critical security gaps requiring immediate attention',
    type: 'text',
    helpText: 'Identify top vulnerabilities and recommend priority improvements',
    threatMappings: [],
    controlMappings: []
  }
];

// Export section metadata for UI navigation
export const QUESTIONNAIRE_SECTIONS = [
  { section: 1, name: 'Perimeter Security & CPTED', questionCount: 10 },
  { section: 2, name: 'Building Entry Points', questionCount: 10 },
  { section: 3, name: 'Parking Facilities', questionCount: 8 },
  { section: 4, name: 'Access Control Systems', questionCount: 12 },
  { section: 5, name: 'Visitor Management', questionCount: 7 },
  { section: 6, name: 'Video Surveillance', questionCount: 9 },
  { section: 7, name: 'Asset Protection', questionCount: 6 },
  { section: 8, name: 'Information Security', questionCount: 6 },
  { section: 9, name: 'Personnel Security', questionCount: 5 },
  { section: 10, name: 'Workplace Violence Prevention', questionCount: 6 },
  { section: 11, name: 'Cyber-Physical Security', questionCount: 5 },
  { section: 12, name: 'Espionage Prevention', questionCount: 4 },
  { section: 13, name: 'General Observations', questionCount: 3 }
];

// Total: 91 questions across 13 sections
