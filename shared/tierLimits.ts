export type AccountTier = "free" | "basic" | "pro" | "enterprise";

export interface TierLimits {
  assessments: number | "unlimited";
  sites: number | "unlimited";
  aiAnalysis: boolean;
  pdfExports: boolean;
  advancedRiskModeling: boolean;
}

export interface OrganizationTierLimits {
  maxAssessments: number; // -1 for unlimited
  maxSites: number; // -1 for unlimited
  maxMembers: number; // -1 for unlimited
}

export const TIER_LIMITS: Record<AccountTier, TierLimits> = {
  free: {
    assessments: 1,
    sites: 1,
    aiAnalysis: false,
    pdfExports: false,
    advancedRiskModeling: false,
  },
  basic: {
    assessments: 5,
    sites: 2,
    aiAnalysis: true,
    pdfExports: true,
    advancedRiskModeling: false,
  },
  pro: {
    assessments: 50,
    sites: 10,
    aiAnalysis: true,
    pdfExports: true,
    advancedRiskModeling: true,
  },
  enterprise: {
    assessments: "unlimited",
    sites: "unlimited",
    aiAnalysis: true,
    pdfExports: true,
    advancedRiskModeling: true,
  },
};

export const ORGANIZATION_TIER_LIMITS: Record<Exclude<AccountTier, "free">, OrganizationTierLimits> = {
  basic: {
    maxAssessments: 5,
    maxSites: 2,
    maxMembers: 2,
  },
  pro: {
    maxAssessments: 50,
    maxSites: 10,
    maxMembers: 10,
  },
  enterprise: {
    maxAssessments: -1, // unlimited
    maxSites: -1, // unlimited
    maxMembers: -1, // unlimited
  },
};

export function getTierLimits(tier: AccountTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function getOrganizationTierLimits(tier: Exclude<AccountTier, "free">): OrganizationTierLimits {
  return ORGANIZATION_TIER_LIMITS[tier];
}

export function canCreateAssessment(tier: AccountTier, currentCount: number): boolean {
  const limits = getTierLimits(tier);
  if (limits.assessments === "unlimited") return true;
  return currentCount < limits.assessments;
}

export function canCreateSite(tier: AccountTier, currentCount: number): boolean {
  const limits = getTierLimits(tier);
  if (limits.sites === "unlimited") return true;
  return currentCount < limits.sites;
}

export function canUseAIAnalysis(tier: AccountTier): boolean {
  return getTierLimits(tier).aiAnalysis;
}

export function canExportPDF(tier: AccountTier): boolean {
  return getTierLimits(tier).pdfExports;
}

export function canUseAdvancedRiskModeling(tier: AccountTier): boolean {
  return getTierLimits(tier).advancedRiskModeling;
}

export function getUpgradeMessage(tier: AccountTier, feature: "assessment" | "site" | "aiAnalysis" | "pdfExport"): string {
  const messages = {
    free: {
      assessment: "Free accounts are limited to 1 assessment. Upgrade to Basic for 5 assessments or Pro for 50.",
      site: "Free accounts are limited to 1 site. Upgrade to Basic for 2 sites or Pro for 10.",
      aiAnalysis: "AI analysis requires a Basic, Pro, or Enterprise account.",
      pdfExport: "PDF exports require a Basic, Pro, or Enterprise account.",
    },
    basic: {
      assessment: "Basic accounts are limited to 5 assessments. Upgrade to Pro for 50 assessments.",
      site: "Basic accounts are limited to 2 sites. Upgrade to Pro for 10 sites.",
      aiAnalysis: "",
      pdfExport: "",
    },
    pro: {
      assessment: "Pro accounts are limited to 50 assessments. Upgrade to Enterprise for unlimited.",
      site: "Pro accounts are limited to 10 sites. Upgrade to Enterprise for unlimited.",
      aiAnalysis: "",
      pdfExport: "",
    },
    enterprise: {
      assessment: "",
      site: "",
      aiAnalysis: "",
      pdfExport: "",
    },
  };

  return messages[tier][feature] || "Upgrade to access this feature.";
}
