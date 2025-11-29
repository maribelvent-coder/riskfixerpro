import { type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import jwt from "jsonwebtoken";

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
 * Supports both session-based and JWT authentication:
 * 1. First checks for JWT token in Authorization header
 * 2. Falls back to session-based authentication
 * 
 * Attaches to the request:
 * - req.user: The full user object
 * - req.organizationId: The user's organization ID (if any)
 * - req.accountTier: The user's account tier (free/pro/enterprise)
 * - req.session.userId: Also sets for compatibility with routes using session
 * 
 * For legacy users without organizationId, the user.id is used as a pseudo-tenant
 * to maintain backward compatibility while still enabling tenant-scoped queries.
 */
export async function attachTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let userId: string | undefined;
  let jwtError: Error | undefined;

  // First try JWT authentication from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7); // Remove "Bearer " prefix
      const decoded = jwt.verify(token, process.env.SESSION_SECRET!) as {
        userId: string;
      };
      userId = decoded.userId;
      // Do NOT mutate req.session.userId here to avoid cross-auth race conditions
      // JWT flows should remain stateless
    } catch (error) {
      // Store JWT error to distinguish auth failures from missing auth
      jwtError = error instanceof Error ? error : new Error('Invalid token');
    }
  }

  // Fall back to session-based authentication
  if (!userId && req.session.userId) {
    userId = req.session.userId;
  }

  // If JWT was provided but invalid, and no session exists, store error for later
  if (!userId && jwtError && authHeader) {
    // Mark request as having an auth failure (for requireOrganizationPermission to use)
    (req as any).authError = jwtError;
    return next();
  }

  if (!userId) {
    return next();
  }

  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return next();
    }

    req.user = user;
    req.accountTier = user.accountTier ?? 'free';
    
    // Only set organizationId if user actually has one
    // Legacy users without organizationId will trigger 403 in requireOrganizationPermission
    // and be directed to complete onboarding (which sets organizationId and migrates data)
    req.organizationId = user.organizationId ?? undefined;

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
 * - /api/auth/login
 * - /api/auth/signup
 * 
 * Distinguishes between:
 * - 401 Unauthorized: Auth failure (invalid/expired JWT)
 * - 403 Forbidden: Missing tenant context (user needs to complete onboarding)
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
    '/api/auth/me',
    '/api/auth/login',
    '/api/auth/signup'
  ];

  const isAllowlisted = allowlist.some(path => req.path.startsWith(path));

  if (isAllowlisted) {
    return next();
  }

  // Check for auth failure (invalid JWT)
  const authError = (req as any).authError;
  if (authError) {
    res.status(401).json({ error: 'Authentication failed', details: authError.message });
    return;
  }

  // Check for missing user (not authenticated at all)
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Check for missing organization context
  if (!req.organizationId) {
    res.status(403).json({ 
      error: 'Organization context required',
      code: 'ONBOARDING_REQUIRED',
      message: 'Please complete onboarding to access this resource'
    });
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
