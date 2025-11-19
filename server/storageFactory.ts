import { type IStorage } from "./storage";
import { type TenantContext } from "@shared/tenantContext";
import { TenantAwareStorage, createTenantAwareStorage } from "./tenantStorage";
import { isFeatureEnabled } from "@shared/featureFlags";

export class StorageFactory {
  constructor(private baseStorage: IStorage) {}

  createForContext(context: TenantContext): TenantAwareStorage {
    return createTenantAwareStorage(this.baseStorage, context);
  }

  createForUser(userId: string, organizationId: string | null = null): TenantAwareStorage {
    const context: TenantContext = {
      userId,
      organizationId,
      role: 'consultant',
      tier: 'free',
    };
    return this.createForContext(context);
  }

  getBaseStorage(): IStorage {
    return this.baseStorage;
  }

  isMultiTenancyEnabled(): boolean {
    return isFeatureEnabled('multiTenancy');
  }
}

export function createStorageFactory(baseStorage: IStorage): StorageFactory {
  return new StorageFactory(baseStorage);
}
