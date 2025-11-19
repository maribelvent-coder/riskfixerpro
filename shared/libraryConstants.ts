// Threat Library Categories
export const THREAT_CATEGORIES = [
  "Physical Intrusion",
  "Theft",
  "Vandalism",
  "Workplace Violence",
  "Natural Disaster",
  "Cyber-Physical",
  "Espionage",
  "Executive Protection",
] as const;

export type ThreatCategory = typeof THREAT_CATEGORIES[number];

// Control Library Categories  
export const CONTROL_CATEGORIES = [
  "Access Control",
  "Surveillance",
  "Physical Barriers",
  "Security Personnel",
  "Procedural Controls",
  "Intrusion Detection",
  "Environmental Design",
  "Cyber-Physical Security",
  "Fire/Life Safety",
] as const;

export type ControlCategory = typeof CONTROL_CATEGORIES[number];

// Risk Levels
export const LIKELIHOOD_LEVELS = ["very-low", "low", "medium", "high", "very-high"] as const;
export const IMPACT_LEVELS = ["negligible", "minor", "moderate", "major", "catastrophic"] as const;

export type LikelihoodLevel = typeof LIKELIHOOD_LEVELS[number];
export type ImpactLevel = typeof IMPACT_LEVELS[number];

// Control Types
export const CONTROL_TYPES = ["preventive", "detective", "corrective", "deterrent"] as const;
export type ControlType = typeof CONTROL_TYPES[number];

// Cost Levels
export const COST_LEVELS = ["low", "medium", "high", "very-high"] as const;
export type CostLevel = typeof COST_LEVELS[number];

// Helper to get badge styling (className) based on risk level
export function getRiskBadgeClass(level: string): string {
  switch (level) {
    case "very-low":
    case "negligible":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "low":
    case "minor":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "medium":
    case "moderate":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "high":
    case "major":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
    case "very-high":
    case "catastrophic":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      console.warn(`Unknown risk level: ${level}`);
      return "bg-muted/10 text-muted-foreground border-muted/20";
  }
}

// Helper to get badge styling (className) based on cost level
export function getCostBadgeClass(cost: string): string {
  switch (cost) {
    case "low":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
    case "very-high":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      console.warn(`Unknown cost level: ${cost}`);
      return "bg-muted/10 text-muted-foreground border-muted/20";
  }
}
