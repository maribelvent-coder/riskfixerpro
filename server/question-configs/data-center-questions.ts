import { QuestionConfig } from './retail-store-questions';

export const DATA_CENTER_QUESTIONS: QuestionConfig[] = [
  {
    questionText: "Is biometric access control (fingerprint, retina, facial) implemented at data center entry?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate biometric system reliability and coverage (1-5)",
    followUpType: "rating",
    controlLibraryName: "Biometric Access Control",
    evidenceType: "Photo of biometric reader",
    orderIndex: 1
  },
  {
    questionText: "Is a man-trap or security vestibule installed at main data center entrance?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate man-trap effectiveness in preventing tailgating (1-5)",
    followUpType: "rating",
    controlLibraryName: "Man Trap/Vestibule",
    evidenceType: "Photo of vestibule",
    orderIndex: 2
  },
  {
    questionText: "Are motion detectors installed in server halls and restricted areas?",
    category: "Intrusion Detection",
    questionType: "yes-no",
    followUpText: "Rate motion detection coverage (1-5)",
    followUpType: "rating",
    controlLibraryName: "Motion Detectors - PIR",
    evidenceType: "Security zone map",
    orderIndex: 3
  },
  {
    questionText: "Is access to server racks restricted to authorized personnel only?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate rack-level access control effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Card Access System",
    evidenceType: "Photo of locked server cages",
    orderIndex: 4
  },
  {
    questionText: "Is CCTV monitored continuously at a security operations center?",
    category: "Surveillance",
    questionType: "yes-no",
    followUpText: "Rate video monitoring responsiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Video Monitoring Station",
    evidenceType: "SOC monitoring logs",
    orderIndex: 5
  },
  {
    questionText: "Are all visitors and vendors escorted 100% of the time in data center areas?",
    category: "Procedural Controls",
    questionType: "yes-no",
    followUpText: "Rate visitor escort policy enforcement (1-5)",
    followUpType: "rating",
    controlLibraryName: "Visitor Escort Policy",
    evidenceType: "Visitor escort log",
    orderIndex: 6
  },
  {
    questionText: "Are background checks and security clearances required for data center staff?",
    category: "Personnel Security",
    questionType: "yes-no",
    followUpText: "Rate screening thoroughness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Background Checks",
    evidenceType: "Security clearance policy",
    orderIndex: 7
  },
  {
    questionText: "Are employee activities in server areas continuously monitored via CCTV?",
    category: "Surveillance",
    questionType: "yes-no",
    followUpText: "Rate monitoring effectiveness in detecting anomalies (1-5)",
    followUpType: "rating",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Camera coverage map",
    orderIndex: 8
  },
  {
    questionText: "Are temperature, humidity, and water leak sensors installed throughout the data center?",
    category: "Environmental Controls",
    questionType: "yes-no",
    followUpText: "Rate environmental monitoring coverage and alerting (1-5)",
    followUpType: "rating",
    controlLibraryName: "Environmental Monitoring System",
    evidenceType: "Sensor layout map",
    orderIndex: 9
  },
  {
    questionText: "Are redundant HVAC and cooling systems in place with automatic failover?",
    category: "Environmental Controls",
    questionType: "yes-no",
    followUpText: "Rate HVAC redundancy and reliability (1-5)",
    followUpType: "rating",
    controlLibraryName: "Environmental Monitoring System",
    evidenceType: "HVAC system diagram",
    orderIndex: 10
  },
  {
    questionText: "Is early smoke detection (VESDA or similar) installed in server areas?",
    category: "Fire Safety",
    questionType: "yes-no",
    followUpText: "Rate fire detection sensitivity and coverage (1-5)",
    followUpType: "rating",
    controlLibraryName: "Fire Alarm System",
    evidenceType: "Fire detection system specs",
    orderIndex: 11
  },
  {
    questionText: "Is gas-based fire suppression (FM-200, Inergen) installed instead of water sprinklers?",
    category: "Fire Safety",
    questionType: "yes-no",
    followUpText: "Rate suppression system adequacy (1-5)",
    followUpType: "rating",
    controlLibraryName: "Fire Suppression System",
    evidenceType: "Suppression system certificate",
    orderIndex: 12
  },
  {
    questionText: "Are water leak detection sensors installed under raised floors and near cooling equipment?",
    category: "Environmental Controls",
    questionType: "yes-no",
    followUpText: "Rate water leak detection coverage (1-5)",
    followUpType: "rating",
    controlLibraryName: "Environmental Monitoring System",
    evidenceType: "Leak sensor map",
    orderIndex: 13
  },
  {
    questionText: "Are server racks bolted to the floor and equipped with seismic bracing?",
    category: "Physical Security",
    questionType: "yes-no",
    followUpText: "Rate seismic hardening measures (1-5)",
    followUpType: "rating",
    controlLibraryName: "Reinforced Doors/Frames",
    evidenceType: "Photo of rack anchoring",
    orderIndex: 14
  },
  {
    questionText: "Does the man-trap or turnstile prevent more than one person entry per credential?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate anti-tailgating effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Man Trap/Vestibule",
    evidenceType: "Man-trap specifications",
    orderIndex: 15
  },
  {
    questionText: "Are server cabinets equipped with tamper alerts or cabinet intrusion detection?",
    category: "Surveillance",
    questionType: "yes-no",
    followUpText: "Rate tamper detection effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Cabinet alarm logs",
    orderIndex: 16
  },
  {
    questionText: "Are building management systems (BMS/SCADA) network-segmented from corporate and internet access?",
    category: "Cyber-Physical Security",
    questionType: "yes-no",
    followUpText: "Rate network segmentation effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Network Segmentation",
    evidenceType: "Network diagram",
    orderIndex: 17
  },
  {
    questionText: "Is physical access to BMS control panels restricted and logged?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate BMS physical access control (1-5)",
    followUpType: "rating",
    controlLibraryName: "Card Access System",
    evidenceType: "BMS access logs",
    orderIndex: 18
  },
  {
    questionText: "Are Uninterruptible Power Supply (UPS) systems installed with sufficient capacity for critical load?",
    category: "Power Systems",
    questionType: "yes-no",
    followUpText: "Rate UPS capacity and reliability (1-5)",
    followUpType: "rating",
    controlLibraryName: "Redundant Power Systems (UPS/Generator)",
    evidenceType: "UPS load test reports",
    orderIndex: 19
  },
  {
    questionText: "Is backup generator installed and tested regularly to support extended outages?",
    category: "Power Systems",
    questionType: "yes-no",
    followUpText: "Rate generator reliability and testing frequency (1-5)",
    followUpType: "rating",
    controlLibraryName: "Redundant Power Systems (UPS/Generator)",
    evidenceType: "Generator test logs",
    orderIndex: 20
  },
  {
    questionText: "Have you experienced unplanned downtime or outages in the past 12 months?",
    category: "Reliability & Incident History",
    questionType: "yes-no",
    controlLibraryName: "Redundant Power Systems (UPS/Generator)",
    evidenceType: "Incident reports",
    orderIndex: 21,
    riskDirection: "negative"
  },
  {
    questionText: "Have you had security breaches or unauthorized physical access incidents in the past 3 years?",
    category: "Security Incident History",
    questionType: "yes-no",
    controlLibraryName: "Card Access System",
    evidenceType: "Security incident logs",
    orderIndex: 22,
    riskDirection: "negative"
  },
  {
    questionText: "Have you experienced data theft or attempted data exfiltration incidents?",
    category: "Security Incident History",
    questionType: "yes-no",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Investigation reports",
    orderIndex: 23,
    riskDirection: "negative"
  }
];
