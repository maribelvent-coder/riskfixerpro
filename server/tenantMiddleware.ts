import { type Request, type Response, type NextFunction } from "express";
import { type TenantContext, createTenantContext } from "@shared/tenantContext";
import { storage } from "./storage";
import { isFeatureEnabled } from "@shared/featureFlags";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
}

export async function attachTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.session.userId) {
    return next();
  }

  try {
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return next();
    }

    let organizationId: string | null = null;
    
    if (isFeatureEnabled('multiTenancy') && user.organizationId) {
      organizationId = user.organizationId;
    }

    const role = (user.organizationRole || 'consultant') as TenantContext['role'];
    const tier = (user.accountTier || 'free') as TenantContext['tier'];

    req.tenantContext = createTenantContext(
      user.id,
      role,
      tier,
      organizationId
    );

    next();
  } catch (error) {
    console.error('Error attaching tenant context:', error);
    next();
  }
}

export function requireTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.tenantContext) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
