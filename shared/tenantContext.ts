export interface TenantContext {
  organizationId: string | null;
  userId: string;
  role: 'admin' | 'consultant' | 'client_admin' | 'client_viewer';
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
}

export interface TenantAware {
  organizationId?: string;
}

export function createTenantContext(
  userId: string,
  role: 'admin' | 'consultant' | 'client_admin' | 'client_viewer' = 'consultant',
  tier: 'free' | 'basic' | 'pro' | 'enterprise' = 'free',
  organizationId: string | null = null
): TenantContext {
  return {
    organizationId,
    userId,
    role,
    tier,
  };
}

export function hasOrganizationAccess(
  context: TenantContext,
  targetOrganizationId: string
): boolean {
  if (context.role === 'admin') {
    return true;
  }
  
  if (context.organizationId === null) {
    return false;
  }
  
  return context.organizationId === targetOrganizationId;
}

export function canAccessResource(
  context: TenantContext,
  resource: TenantAware
): boolean {
  if (context.role === 'admin') {
    return true;
  }
  
  if (!resource.organizationId) {
    return true;
  }
  
  return hasOrganizationAccess(context, resource.organizationId);
}

export function isTenantAdmin(context: TenantContext): boolean {
  return context.role === 'admin' || context.role === 'client_admin';
}

export function canManageUsers(context: TenantContext): boolean {
  return isTenantAdmin(context);
}
