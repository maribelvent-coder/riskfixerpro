import { type IStorage } from "./storage";
import { type TenantContext, canAccessResource } from "@shared/tenantContext";
import { isFeatureEnabled } from "@shared/featureFlags";
import {
  type Site,
  type InsertSite,
  type Assessment,
  type InsertAssessment,
  type Organization,
  type User,
} from "@shared/schema";

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

  // Helper to filter items by organization
  private filterByOrganization<T extends { organizationId: string | null; userId: string }>(items: T[]): T[] {
    if (!isFeatureEnabled('multiTenancy')) {
      // Fallback to userId filtering
      return items.filter(item => item.userId === this.context.userId);
    }

    // Admin can see all
    if (this.context.role === 'admin') {
      return items;
    }

    // If user belongs to an organization, filter by org
    if (this.context.organizationId) {
      return items.filter(item => 
        item.organizationId === this.context.organizationId ||
        (item.organizationId === null && item.userId === this.context.userId) // Free tier items
      );
    }

    // Free tier user - only see their own items
    return items.filter(item => item.userId === this.context.userId && item.organizationId === null);
  }

  // Helper to check access to a single item
  private checkAccess<T extends { organizationId: string | null; userId: string }>(item: T | undefined): T | undefined {
    if (!item) return undefined;

    if (!isFeatureEnabled('multiTenancy')) {
      // Simple userId check
      return item.userId === this.context.userId ? item : undefined;
    }

    // Admin can access all
    if (this.context.role === 'admin') {
      return item;
    }

    // Check organization match
    if (this.context.organizationId) {
      if (item.organizationId === this.context.organizationId) {
        return item;
      }
      // Can access own free-tier items even if in an org
      if (item.organizationId === null && item.userId === this.context.userId) {
        return item;
      }
      return undefined;
    }

    // Free tier user - must own it and it must be free tier
    if (item.userId === this.context.userId && item.organizationId === null) {
      return item;
    }

    return undefined;
  }

  // Helper to enrich new items with organizationId
  private enrichWithOrganization<T extends Partial<{ organizationId: string | null }>>(data: T): T {
    if (!isFeatureEnabled('multiTenancy') || !this.context.organizationId) {
      return data;
    }

    // Auto-set organizationId if not provided
    if (data.organizationId === undefined) {
      return {
        ...data,
        organizationId: this.context.organizationId,
      };
    }

    return data;
  }

  // Organization methods - pass through to storage
  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.storage.getOrganization(id);
  }

  async getOrganizationMembers(organizationId: string): Promise<User[]> {
    return this.storage.getOrganizationMembers(organizationId);
  }

  async createOrganization(org: any): Promise<Organization> {
    return this.storage.createOrganization(org);
  }

  // Site methods with tenant filtering
  async getAllSites(): Promise<Site[]> {
    if (!isFeatureEnabled('multiTenancy') || !this.context.organizationId) {
      return this.storage.getAllSites(this.context.userId);
    }

    const sites = await this.storage.getOrganizationSites(this.context.organizationId);
    return this.filterByOrganization(sites);
  }

  async getSite(id: string): Promise<Site | undefined> {
    const site = await this.storage.getSite(id);
    return this.checkAccess(site);
  }

  async createSite(site: InsertSite): Promise<Site> {
    const enrichedSite = this.enrichWithOrganization(site);
    return this.storage.createSite(enrichedSite as InsertSite);
  }

  async updateSite(id: string, site: Partial<Site>): Promise<Site | undefined> {
    const existing = await this.getSite(id);
    if (!existing) {
      return undefined;
    }
    return this.storage.updateSite(id, site);
  }

  async deleteSite(id: string): Promise<boolean> {
    const existing = await this.getSite(id);
    if (!existing) {
      return false;
    }
    return this.storage.deleteSite(id);
  }

  // Assessment methods with tenant filtering
  async getAllAssessments(): Promise<Assessment[]> {
    const assessments = await this.storage.getAllAssessments();
    return this.filterByOrganization(assessments);
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const assessment = await this.storage.getAssessment(id);
    return this.checkAccess(assessment);
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const enrichedAssessment = this.enrichWithOrganization(assessment);
    return this.storage.createAssessment(enrichedAssessment as InsertAssessment);
  }

  async updateAssessment(id: string, assessment: Partial<Assessment>): Promise<Assessment | undefined> {
    const existing = await this.getAssessment(id);
    if (!existing) {
      return undefined;
    }
    return this.storage.updateAssessment(id, assessment);
  }

  async deleteAssessment(id: string): Promise<boolean> {
    const existing = await this.getAssessment(id);
    if (!existing) {
      return false;
    }
    return this.storage.deleteAssessment(id);
  }
}

export function createTenantAwareStorage(
  storage: IStorage,
  context: TenantContext
): TenantAwareStorage {
  return new TenantAwareStorage(storage, context);
}
