import { type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      organizationId?: string;
      accountTier?: string;
    }
  }
}

/**
 * Middleware: Attach tenant context to the request
 * 
 * Retrieves req.session.userId, fetches the user, and attaches:
 * - req.user: The full user object
 * - req.organizationId: The user's organization ID (if any)
 * - req.accountTier: The user's account tier (free/pro/enterprise)
 */
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

    req.user = user;
    req.organizationId = user.organizationId ?? undefined;
    req.accountTier = user.accountTier ?? 'free';

    next();
  } catch (error) {
    console.error('Error attaching tenant context:', error);
    next();
  }
}

/**
 * Middleware: Require organization context for protected routes
 * 
 * Allowlist paths that can be accessed without organization context:
 * - /api/onboarding
 * - /api/auth/logout
 * - /api/auth/me
 * 
 * All other paths require req.organizationId to be set.
 */
export function requireOrganizationPermission(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const allowlist = [
    '/api/onboarding',
    '/api/auth/logout',
    '/api/auth/me'
  ];

  const isAllowlisted = allowlist.some(path => req.path.startsWith(path));

  if (isAllowlisted) {
    return next();
  }

  if (!req.organizationId) {
    res.status(403).json({ error: 'Organization context required' });
    return;
  }

  next();
}

/**
 * Middleware: Require authenticated user
 */
export function requireTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
