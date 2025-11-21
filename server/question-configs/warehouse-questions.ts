import { QuestionConfig } from './retail-store-questions';

export const WAREHOUSE_QUESTIONS: QuestionConfig[] = [
  {
    questionText: "Is the warehouse perimeter protected by chain-link fencing or similar barrier?",
    category: "Perimeter Security",
    questionType: "yes-no",
    followUpText: "Rate fence condition and effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Perimeter Fencing - Chain Link",
    evidenceType: "Photo of perimeter fence",
    orderIndex: 1
  },
  {
    questionText: "Are vehicle gates automated and access-controlled for entry/exit?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate effectiveness of gate access control (1-5)",
    followUpType: "rating",
    controlLibraryName: "Vehicle Gates - Automated",
    evidenceType: "Photo of vehicle gate system",
    orderIndex: 2
  },
  {
    questionText: "Is CCTV surveillance installed covering loading docks, yard, and trailer parking areas?",
    category: "Surveillance",
    questionType: "yes-no",
    followUpText: "Rate CCTV coverage and quality (1-5)",
    followUpType: "rating",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Camera coverage map",
    orderIndex: 3
  },
  {
    questionText: "Are tamper-evident seals used on all trailers and containers?",
    category: "Cargo Security",
    questionType: "yes-no",
    followUpText: "Rate seal inspection and logging procedures (1-5)",
    followUpType: "rating",
    controlLibraryName: "Loading Dock Security Seals",
    evidenceType: "Seal log sample",
    orderIndex: 4
  },
  {
    questionText: "Are incoming and outgoing vehicles inspected for unauthorized cargo?",
    category: "Cargo Security",
    questionType: "yes-no",
    followUpText: "Rate thoroughness of vehicle inspection procedures (1-5)",
    followUpType: "rating",
    controlLibraryName: "Vehicle Inspection Procedures",
    evidenceType: "Inspection checklist",
    orderIndex: 5
  },
  {
    questionText: "Are background checks conducted on all warehouse employees?",
    category: "Personnel Security",
    questionType: "yes-no",
    followUpText: "Rate screening thoroughness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Background Checks",
    evidenceType: "HR policy document",
    orderIndex: 6
  },
  {
    questionText: "Is a Warehouse Management System (WMS) used to track all inventory movements?",
    category: "Inventory Control",
    questionType: "yes-no",
    followUpText: "Rate WMS effectiveness in detecting anomalies (1-5)",
    followUpType: "rating",
    controlLibraryName: "Warehouse Management System (WMS)",
    evidenceType: "WMS screenshot",
    orderIndex: 7
  },
  {
    questionText: "Is card/badge access control enforced at all entry points?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate access control effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Card Access System",
    evidenceType: "Photo of access readers",
    orderIndex: 8
  },
  {
    questionText: "Is a visitor management system in place to track all non-employee access?",
    category: "Access Control",
    questionType: "yes-no",
    followUpText: "Rate visitor control procedures (1-5)",
    followUpType: "rating",
    controlLibraryName: "Visitor Management System",
    evidenceType: "Visitor log sample",
    orderIndex: 9
  },
  {
    questionText: "Is intrusion alarm system monitored 24/7?",
    category: "Intrusion Detection",
    questionType: "yes-no",
    followUpText: "Rate alarm system effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Alarm Monitoring Service",
    evidenceType: "Alarm monitoring agreement",
    orderIndex: 10
  },
  {
    questionText: "Are all forklift and equipment operators certified and trained?",
    category: "Safety",
    questionType: "yes-no",
    followUpText: "Rate quality of safety training program (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "Training certificates",
    orderIndex: 11
  },
  {
    questionText: "Is adequate lighting maintained in warehouse aisles, docks, and yard areas?",
    category: "Environmental Design",
    questionType: "yes-no",
    followUpText: "Rate lighting adequacy for safe operations (1-5)",
    followUpType: "rating",
    controlLibraryName: "Perimeter Lighting",
    evidenceType: "Photo of warehouse lighting",
    orderIndex: 12
  },
  {
    questionText: "Are motion detectors and door/window sensors installed throughout the facility?",
    category: "Intrusion Detection",
    questionType: "yes-no",
    followUpText: "Rate intrusion detection coverage (1-5)",
    followUpType: "rating",
    controlLibraryName: "Alarm Monitoring Service",
    evidenceType: "Alarm zone map",
    orderIndex: 13
  },
  {
    questionText: "Does WMS support regular cycle counting to detect shrinkage?",
    category: "Inventory Control",
    questionType: "yes-no",
    followUpText: "Rate cycle count frequency and accuracy (1-5)",
    followUpType: "rating",
    controlLibraryName: "Warehouse Management System (WMS)",
    evidenceType: "Cycle count reports",
    orderIndex: 14
  },
  {
    questionText: "Are vendor companies and drivers vetted before granting access?",
    category: "Vendor Management",
    questionType: "yes-no",
    followUpText: "Rate vendor screening process (1-5)",
    followUpType: "rating",
    controlLibraryName: "Background Checks",
    evidenceType: "Vendor approval list",
    orderIndex: 15
  },
  {
    questionText: "Are aisles kept clear and slip/trip hazards addressed promptly?",
    category: "Safety",
    questionType: "yes-no",
    followUpText: "Rate housekeeping and hazard management (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "Safety inspection records",
    orderIndex: 16
  },
  {
    questionText: "Is fire alarm system installed covering all warehouse areas?",
    category: "Fire Safety",
    questionType: "yes-no",
    followUpText: "Rate fire detection coverage (1-5)",
    followUpType: "rating",
    controlLibraryName: "Fire Alarm System",
    evidenceType: "Fire alarm panel photo",
    orderIndex: 17
  },
  {
    questionText: "Are sprinkler systems or other fire suppression installed and tested regularly?",
    category: "Fire Safety",
    questionType: "yes-no",
    followUpText: "Rate fire suppression system effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Fire Suppression System",
    evidenceType: "Sprinkler test records",
    orderIndex: 18
  },
  {
    questionText: "Are security patrols or guards present during operating hours?",
    category: "Security Personnel",
    questionType: "yes-no",
    followUpText: "Rate security patrol effectiveness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Mobile Patrol",
    evidenceType: "Patrol log",
    orderIndex: 19
  },
  {
    questionText: "Have employees received active shooter response training?",
    category: "Emergency Preparedness",
    questionType: "yes-no",
    followUpText: "Rate active threat preparedness (1-5)",
    followUpType: "rating",
    controlLibraryName: "Security Awareness Training",
    evidenceType: "Training records",
    orderIndex: 20
  },
  {
    questionText: "Have you experienced cargo theft or full truckload theft in the past 3 years?",
    category: "Cargo Theft & Incident History",
    questionType: "yes-no",
    controlLibraryName: "Mobile Patrol",
    evidenceType: "Theft incident reports",
    orderIndex: 21,
    riskDirection: "negative"
  },
  {
    questionText: "Have you experienced cargo pilferage or partial load theft in the past 12 months?",
    category: "Cargo Theft & Incident History",
    questionType: "yes-no",
    controlLibraryName: "CCTV System - IP/Network",
    evidenceType: "Loss reports",
    orderIndex: 22,
    riskDirection: "negative"
  },
  {
    questionText: "Have you had confirmed employee or driver theft incidents in the past 12 months?",
    category: "Cargo Theft & Incident History",
    questionType: "yes-no",
    controlLibraryName: "Background Checks",
    evidenceType: "Internal investigation reports",
    orderIndex: 23,
    riskDirection: "negative"
  }
];
