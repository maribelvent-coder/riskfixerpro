import { QuestionConfig } from './retail-store-questions';

export const MANUFACTURING_QUESTIONS: QuestionConfig[] = [
  {
    questionText: "Is access to production floor and critical equipment restricted to authorized personnel?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate access control effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Card Access System",
    evidenceType: "Photo of access readers",
    orderIndex: 1
  },
  {
    questionText: "Is CCTV installed covering all production equipment and critical areas?",
    category: "Surveillance",
    questionType: "yes-no",
    followUpText: "Rate CCTV coverage of production floor (1-5)",
    followUpType: "rating",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Camera layout map",
    orderIndex: 2
  },
  {
    questionText: "Are safety interlocks and guards installed on machinery to prevent tampering?",
    category: "Equipment Safety",
    questionType: "yes-no",
    followUpText: "Rate effectiveness of interlock systems (1-5)",
    followUpType: "rating",
    controlLibraryName: "Machine Guarding & Safety Interlocks",
    evidenceType: "Photo of machine guarding",
    orderIndex: 3
  },
  {
    questionText: "Are tools and equipment tracked via inventory management system?",
    category: "Inventory Control",
    questionType: "yes-no",
    followUpText: "Rate equipment tracking effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Warehouse Management System (WMS)",
    evidenceType: "Equipment inventory report",
    orderIndex: 4
  },
  {
    questionText: "Are security patrols or guards present during non-production hours?",
    category: "Security Personnel",
    questionType: "yes-no",
    followUpText: "Rate patrol coverage and frequency (1-5)",
    followUpType: "rating",
    controlLibraryName: "Mobile Patrol",
    evidenceType: "Patrol logs",
    orderIndex: 5
  },
  {
    questionText: "Is access to payroll/cash handling areas restricted and monitored?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate cash area access controls (1-5)",
    followUpType: "rating",
    controlLibraryName: "Card Access System",
    evidenceType: "Photo of secured cash office",
    orderIndex: 6
  },
  {
    questionText: "Are all equipment operators certified and trained on safe operation?",
    category: "Training",
    questionType: "yes-no",
    followUpText: "Rate operator training program quality (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "Training certificates",
    orderIndex: 7
  },
  {
    questionText: "Are all machines equipped with proper guards, light curtains, and emergency stops?",
    category: "Equipment Safety",
    questionType: "yes-no",
    followUpText: "Rate machine guarding adequacy (1-5)",
    followUpType: "rating",
    controlLibraryName: "Machine Guarding & Safety Interlocks",
    evidenceType: "Safety inspection records",
    orderIndex: 8
  },
  {
    questionText: "Is adequate lighting maintained on production floor and traffic aisles?",
    category: "Environmental Design",
    questionType: "yes-no",
    followUpText: "Rate lighting adequacy for safe operations (1-5)",
    followUpType: "rating",
    controlLibraryName: "Perimeter Lighting",
    evidenceType: "Lighting survey results",
    orderIndex: 9
  },
  {
    questionText: "Is access to R&D, design, or proprietary production areas strictly controlled?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate IP area access restrictions (1-5)",
    followUpType: "rating",
    controlLibraryName: "Card Access System",
    evidenceType: "Restricted zone map",
    orderIndex: 10
  },
  {
    questionText: "Are background checks conducted on employees with access to proprietary information?",
    category: "Personnel Security",
    questionType: "yes-no",
    followUpText: "Rate screening thoroughness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Background Checks",
    evidenceType: "Background check policy",
    orderIndex: 11
  },
  {
    questionText: "Are all visitors to production areas escorted and restricted from sensitive zones?",
    category: "Procedural Controls",
    questionType: "yes-no",
    followUpText: "Rate visitor escort policy enforcement (1-5)",
    followUpType: "rating",
    controlLibraryName: "Visitor Escort Policy",
    evidenceType: "Visitor log",
    orderIndex: 12
  },
  {
    questionText: "Is facility perimeter protected by fencing or other physical barriers?",
    category: "Perimeter Security",
    questionType: "yes-no",
    followUpText: "Rate perimeter barrier condition and height (1-5)",
    followUpType: "rating",
    controlLibraryName: "Perimeter Fencing - Chain Link",
    evidenceType: "Photo of perimeter fence",
    orderIndex: 13
  },
  {
    questionText: "Is intrusion alarm system installed and monitored 24/7?",
    category: "Intrusion Detection",
    questionType: "yes-no",
    followUpText: "Rate alarm coverage and responsiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Alarm Monitoring Service",
    evidenceType: "Alarm monitoring agreement",
    orderIndex: 14
  },
  {
    questionText: "Are vendors and contractors screened before granting facility access?",
    category: "Vendor Management",
    questionType: "yes-no",
    followUpText: "Rate vendor screening process (1-5)",
    followUpType: "rating",
    controlLibraryName: "Background Checks",
    evidenceType: "Approved vendor list",
    orderIndex: 15
  },
  {
    questionText: "Is fire alarm system installed covering production, storage, and hazmat areas?",
    category: "Fire Safety",
    questionType: "yes-no",
    followUpText: "Rate fire detection coverage (1-5)",
    followUpType: "rating",
    controlLibraryName: "Fire Alarm System",
    evidenceType: "Fire alarm zone map",
    orderIndex: 16
  },
  {
    questionText: "Are sprinklers or specialized suppression systems installed and tested regularly?",
    category: "Fire Safety",
    questionType: "yes-no",
    followUpText: "Rate suppression system adequacy (1-5)",
    followUpType: "rating",
    controlLibraryName: "Fire Suppression System",
    evidenceType: "Fire suppression test records",
    orderIndex: 17
  },
  {
    questionText: "Are flammable materials stored in approved containers and segregated per safety regulations?",
    category: "Hazmat Management",
    questionType: "yes-no",
    followUpText: "Rate hazmat storage compliance (1-5)",
    followUpType: "rating",
    controlLibraryName: "Hazmat Storage & Handling Procedures",
    evidenceType: "Hazmat storage inspection",
    orderIndex: 18
  },
  {
    questionText: "Is employee activity in sensitive areas monitored via CCTV or access logs?",
    category: "Surveillance",
    questionType: "yes-no",
    followUpText: "Rate monitoring effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Access audit log sample",
    orderIndex: 19
  },
  {
    questionText: "Are industrial control systems network-segmented from corporate IT and internet?",
    category: "Cyber-Physical Security",
    questionType: "yes-no",
    followUpText: "Rate OT network segmentation effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Network Segmentation",
    evidenceType: "Network diagram",
    orderIndex: 20
  },
  {
    questionText: "Are aisles kept clear and slip/trip hazards addressed through regular inspections?",
    category: "Safety",
    questionType: "yes-no",
    followUpText: "Rate housekeeping and safety compliance (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "Safety inspection checklist",
    orderIndex: 21
  },
  {
    questionText: "Have you experienced workplace safety incidents or OSHA violations in the past 12 months?",
    category: "Safety Incident History",
    questionType: "yes-no",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "OSHA incident reports",
    orderIndex: 22,
    riskDirection: "negative"
  },
  {
    questionText: "Have you had intellectual property theft or industrial espionage attempts in the past 3 years?",
    category: "Security Incident History",
    questionType: "yes-no",
    controlLibraryName: "Card Access System",
    evidenceType: "Security incident reports",
    orderIndex: 23,
    riskDirection: "negative"
  },
  {
    questionText: "Have you experienced production disruptions due to security breaches or sabotage?",
    category: "Security Incident History",
    questionType: "yes-no",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Incident investigation reports",
    orderIndex: 24,
    riskDirection: "negative"
  }
];
