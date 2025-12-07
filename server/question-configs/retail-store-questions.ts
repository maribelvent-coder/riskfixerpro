export interface QuestionConfig {
  questionText: string;
  category: string;
  questionType: "yes-no" | "rating" | "text" | "photo" | "multiple-choice" | "checklist"; // Hyphenated to match schema
  options?: string[]; // For multiple-choice and checklist question types
  followUpText?: string;
  followUpType?: "rating" | "text" | "photo";
  controlLibraryName: string;
  evidenceType?: string;
  orderIndex: number;
  riskDirection?: "positive" | "negative"; // 'positive' = Yes is good (default), 'negative' = Yes is bad (incidents)
}

export const RETAIL_STORE_QUESTIONS: QuestionConfig[] = [
  {
    questionText: "Does the store have an Electronic Article Surveillance (EAS) system installed at exits?",
    category: "Loss Prevention",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of the EAS system (1=Ineffective, 5=Highly Effective)",
    followUpType: "rating",
    controlLibraryName: "Electronic Article Surveillance (EAS)",
    evidenceType: "Photo of EAS gates",
    orderIndex: 1
  },
  {
    questionText: "Is CCTV surveillance installed covering all customer areas, exits, and high-value merchandise?",
    category: "Loss Prevention",
    questionType: "yes-no",
    followUpText: "Rate the CCTV system's effectiveness in deterring theft (1-5)",
    followUpType: "rating",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Photo of camera coverage map",
    orderIndex: 2
  },
  {
    questionText: "Are uniformed security officers or loss prevention personnel present during operating hours?",
    category: "Loss Prevention",
    questionType: "yes-no",
    followUpText: "Rate their effectiveness in preventing organized retail crime (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Officers - Unarmed",
    evidenceType: "Photo of security presence",
    orderIndex: 3
  },
  {
    questionText: "Does the store conduct regular inventory audits and shrink analysis?",
    category: "Inventory Control",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of inventory controls in reducing shrinkage (1-5)",
    followUpType: "rating",
    controlLibraryName: "Inventory Audit & Shrink Analysis",
    evidenceType: "Sample audit report",
    orderIndex: 4
  },
  {
    questionText: "Are security tags or anti-theft devices applied to high-value merchandise?",
    category: "Loss Prevention",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of security tagging program (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Tags & Anti-Theft Devices",
    evidenceType: "Photo of tagged merchandise",
    orderIndex: 5
  },
  {
    questionText: "Are background checks conducted on all employees with cash or inventory access?",
    category: "Personnel Security",
    questionType: "yes-no",
    followUpText: "Rate the thoroughness of employee screening process (1-5)",
    followUpType: "rating",
    controlLibraryName: "Background Checks",
    evidenceType: "HR screening policy document",
    orderIndex: 6
  },
  {
    questionText: "Does the POS system have exception reporting and transaction monitoring to detect employee theft?",
    category: "Cash Handling",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of POS security features (1-5)",
    followUpType: "rating",
    controlLibraryName: "Point-of-Sale (POS) Security System",
    evidenceType: "Screenshot of POS exception reports",
    orderIndex: 7
  },
  {
    questionText: "Are cash management procedures in place (till limits, time-delay safes, regular drops)?",
    category: "Cash Handling",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of cash controls in minimizing robbery risk (1-5)",
    followUpType: "rating",
    controlLibraryName: "Cash Management Procedures",
    evidenceType: "Photo of drop safe, cash handling policy",
    orderIndex: 8
  },
  {
    questionText: "Are panic buttons or duress alarms installed at registers and cash offices?",
    category: "Emergency Response",
    questionType: "yes-no",
    followUpText: "Rate the accessibility and reliability of panic alarm system (1-5)",
    followUpType: "rating",
    controlLibraryName: "Panic Button / Duress Alarm",
    evidenceType: "Photo of panic button locations",
    orderIndex: 9
  },
  {
    questionText: "Have employees received training on robbery prevention and response procedures?",
    category: "Training",
    questionType: "yes-no",
    followUpText: "Rate the comprehensiveness of robbery response training (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "Training records",
    orderIndex: 10
  },
  {
    questionText: "Does the POS system use EMV chip readers and comply with PCI-DSS standards?",
    category: "Payment Security",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of payment security controls (1-5)",
    followUpType: "rating",
    controlLibraryName: "Point-of-Sale (POS) Security System",
    evidenceType: "PCI compliance certificate",
    orderIndex: 11
  },
  {
    questionText: "Are employees trained to recognize and prevent credit card fraud?",
    category: "Training",
    questionType: "yes-no",
    followUpText: "Rate employee awareness of fraud indicators (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "Training materials",
    orderIndex: 12
  },
  {
    questionText: "Is the store protected by an intrusion alarm system monitored 24/7?",
    category: "Intrusion Detection",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of intrusion detection system (1-5)",
    followUpType: "rating",
    controlLibraryName: "Alarm Monitoring Service",
    evidenceType: "Alarm system documentation",
    orderIndex: 13
  },
  {
    questionText: "Are doors and windows reinforced with security shutters, security film, or other hardening measures?",
    category: "Physical Barriers",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of physical barriers against forced entry (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Window Film",
    evidenceType: "Photo of security shutters/reinforced doors",
    orderIndex: 14
  },
  {
    questionText: "Is access to loading dock area controlled and restricted to authorized personnel?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of loading dock access controls (1-5)",
    followUpType: "rating",
    controlLibraryName: "Card Access System",
    evidenceType: "Photo of dock access control system",
    orderIndex: 15
  },
  {
    questionText: "Are tamper-evident seals used on all incoming and outgoing shipments?",
    category: "Cargo Security",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of seal inspection procedures (1-5)",
    followUpType: "rating",
    controlLibraryName: "Loading Dock Security Seals",
    evidenceType: "Seal log records",
    orderIndex: 16
  },
  {
    questionText: "Are background checks or vetting procedures conducted on regular vendors and delivery drivers?",
    category: "Vendor Management",
    questionType: "yes-no",
    followUpText: "Rate the thoroughness of vendor screening process (1-5)",
    followUpType: "rating",
    controlLibraryName: "Background Checks",
    evidenceType: "Vendor approval checklist",
    orderIndex: 17
  },
  {
    questionText: "Is adequate lighting maintained in all customer and employee areas, including parking lots?",
    category: "Environmental Design",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of lighting in preventing slip/trip hazards (1-5)",
    followUpType: "rating",
    controlLibraryName: "Perimeter Lighting",
    evidenceType: "Photo of well-lit areas",
    orderIndex: 18
  },
  {
    questionText: "Have employees received active shooter and workplace violence response training?",
    category: "Emergency Preparedness",
    questionType: "yes-no",
    followUpText: "Rate the preparedness of staff for violent incidents (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "Training records",
    orderIndex: 19
  },
  {
    questionText: "Are emergency communication systems (panic buttons, PA system) available and functional?",
    category: "Emergency Response",
    questionType: "yes-no",
    followUpText: "Rate the effectiveness of emergency alert systems (1-5)",
    followUpType: "rating",
    controlLibraryName: "Panic Button / Duress Alarm",
    evidenceType: "Emergency communication plan",
    orderIndex: 20
  },
  {
    questionText: "Have you had any confirmed employee theft incidents in the past 12 months?",
    category: "Shrinkage & Loss History",
    questionType: "yes-no",
    controlLibraryName: "Background Checks",
    evidenceType: "Incident reports",
    orderIndex: 21,
    riskDirection: "negative"
  },
  {
    questionText: "Have you experienced shoplifting incidents in the past 12 months?",
    category: "Shrinkage & Loss History",
    questionType: "yes-no",
    controlLibraryName: "Electronic Article Surveillance (EAS)",
    evidenceType: "Loss prevention reports",
    orderIndex: 22,
    riskDirection: "negative"
  },
  {
    questionText: "Have you experienced organized retail crime (ORC) activity in the past 12 months?",
    category: "Shrinkage & Loss History",
    questionType: "yes-no",
    controlLibraryName: "Security Officers - Unarmed",
    evidenceType: "ORC incident reports",
    orderIndex: 23,
    riskDirection: "negative"
  },
  {
    questionText: "Have you had any robbery or burglary incidents in the past 5 years?",
    category: "Shrinkage & Loss History",
    questionType: "yes-no",
    controlLibraryName: "Intrusion Detection System (IDS)",
    evidenceType: "Police reports",
    orderIndex: 24,
    riskDirection: "negative"
  }
];
