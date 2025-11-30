import { db } from "./db";
import * as schema from "@shared/schema";

const missingControls = [
  {
    name: "Incident Response Plan (Documented)",
    category: "procedural",
    controlType: "preventive",
    description: "Written incident response procedures",
    baseWeight:  18,
    reductionPercentage: 25,
    estimatedCost: "low",
    maintenanceLevel: "medium",
    requiresTraining: true,
    requiresMaintenance: false,
    isActive: true,
  },
  {
    name: "Business Continuity Plan (Tested)",
    category: "procedural",
    controlType: "preventive",
    description: "Documented business continuity procedures",
    baseWeight: 20,    reductionPercentage: 20,
    estimatedCost: "low",
    maintenanceLevel: "medium",
    requiresTraining: true,
    requiresMaintenance: false,
    isActive: true,
  },
  {
    name: "Disaster Recovery Site",
    category: "business_continuity",
    controlType: "preventive",
    description: "Geographically separate facility",
    baseWeight: 28,
    reductionPercentage: 32,
    estimatedCost: "high",
    maintenanceLevel: "high",
    requiresTraining: true,
    requiresMaintenance: true,
    isActive: true,
  },
  {
    name: "Machine Guarding & Safety Interlocks",
    category: "safety",
    controlType: "preventive",
    description: "Physical guards and electronic interlocks",
    baseWeight: 18,
    reductionPercentage: 30,
    estimatedCost: "medium",
    maintenanceLevel: "medium",
    requiresTraining: true,
    requiresMaintenance: true,
    isActive: true,
  },
  {
    name: "Warehouse Management System (WMS)",
    category: "technology",
    controlType: "detective",
    description: "Software tracking inventory",
    baseWeight: 20,
    reductionPercentage: 20,
    estimatedCost: "medium",
    maintenanceLevel: "medium",
    requiresTraining: true,
    requiresMaintenance: true,
    isActive: true,
  },
  {
    name: "Hazmat Storage & Handling Procedures",
    category: "procedural",
    controlType: "preventive",
    description: "Documented hazmat procedures",
    baseWeight: ,
    reductionPercentage: 18,
    estimatedCost: "low",
    maintenanceLevel: "medium",
    requiresTraining: true,
    requiresMaintenance: false,
    isActive: true,
  },
];

console.log("Starting missing controls seed...");
console.log(`Preparing to insert ${missingControls.length} controls...`);

try {
  await db.insert(schema.controlLibrary).values(missingControls);
  console.log(
    `✅ Successfully seeded ${missingControls.length} missing controls!`,
  );
  const totalControls = await db.select().from(schema.controlLibrary);
  console.log(`📊 Total controls in database: ${totalControls.length}`);
} catch (error: any) {
  console.error("❌ Error:", error.message);
  if (error.message?.includes("UNIQUE")) {
    console.log("⚠️  Some controls already exist.");
  }
}

console.log("✅ Seed complete!");
