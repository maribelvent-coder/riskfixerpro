export type FeatureFlag = 
  | 'multiTenancy'
  | 'organizations'
  | 'templateSystem'
  | 'facilityZones'
  | 'assetInventory'
  | 'threatLibrary'
  | 'controlLibrary'
  | 'tviRiskModel'
  | 'dualRiskCalculation'
  | 'enhancedAIAnalysis'
  | 'photoMetadata'
  | 'offlineSync'
  | 'auditLogging'
  | 'advancedReporting'
  | 'executiveDashboards'
  | 'billingIntegration';

export type FeatureFlagConfig = {
  [K in FeatureFlag]: boolean;
};

const defaultFlags: FeatureFlagConfig = {
  multiTenancy: false,
  organizations: false,
  templateSystem: false,
  facilityZones: false,
  assetInventory: false,
  threatLibrary: false,
  controlLibrary: false,
  tviRiskModel: false,
  dualRiskCalculation: false,
  enhancedAIAnalysis: false,
  photoMetadata: false,
  offlineSync: false,
  auditLogging: false,
  advancedReporting: false,
  executiveDashboards: false,
  billingIntegration: false,
};

let currentFlags: FeatureFlagConfig = { ...defaultFlags };

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return currentFlags[flag] ?? false;
}

export function enableFeature(flag: FeatureFlag): void {
  currentFlags[flag] = true;
}

export function disableFeature(flag: FeatureFlag): void {
  currentFlags[flag] = false;
}

export function setFeatureFlags(flags: Partial<FeatureFlagConfig>): void {
  currentFlags = { ...currentFlags, ...flags };
}

export function getAllFlags(): FeatureFlagConfig {
  return { ...currentFlags };
}

export function resetFlags(): void {
  currentFlags = { ...defaultFlags };
}

export function loadFlagsFromEnv(): void {
  const envFlags: Partial<FeatureFlagConfig> = {};
  
  Object.keys(defaultFlags).forEach((flag) => {
    const envVar = `FEATURE_${flag.toUpperCase()}`;
    const envValue = process.env[envVar];
    
    if (envValue !== undefined) {
      envFlags[flag as FeatureFlag] = envValue === 'true' || envValue === '1';
    }
  });
  
  setFeatureFlags(envFlags);
}
