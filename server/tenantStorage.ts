import { type IStorage } from "./storage";
import { type TenantContext } from "@shared/tenantContext";
import { isFeatureEnabled } from "@shared/featureFlags";

export class TenantAwareStorage {
  constructor(
    private storage: IStorage,
    private context: TenantContext
  ) {}

  getContext(): TenantContext {
    return this.context;
  }

  getUnderlyingStorage(): IStorage {
    return this.storage;
  }

  isMultiTenancyEnabled(): boolean {
    return isFeatureEnabled('multiTenancy');
  }
}

export function createTenantAwareStorage(
  storage: IStorage,
  context: TenantContext
): TenantAwareStorage {
  return new TenantAwareStorage(storage, context);
}
