import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./openai-service";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import multer from "multer";
import { 
  insertAssessmentSchema,
  insertSiteSchema,
  insertFacilityZoneSchema,
  insertFacilitySurveyQuestionSchema,
  insertExecutiveInterviewResponseSchema,
  insertAssessmentQuestionSchema,
  insertRiskAssetSchema,
  insertRiskScenarioSchema,
  insertVulnerabilitySchema,
  insertControlSchema,
  insertTreatmentPlanSchema,
  insertReportSchema,
  insertUserSchema,
  insertLoadingDockSchema,
  manufacturingProfileSchema,
  datacenterProfileSchema,
  type InsertFacilitySurveyQuestion,
  type InsertAssessmentQuestion
} from "@shared/schema";
import { 
  canCreateAssessment, 
  canCreateSite, 
  canUseAIAnalysis,
  getUpgradeMessage,
  getOrganizationTierLimits,
  type AccountTier 
} from "@shared/tierLimits";
import { getSurveyParadigmFromTemplate, ASSESSMENT_TEMPLATES } from "@shared/templates";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { emailService } from "./emailService";
import { registerGeoIntelRoutes } from "./routes/geoIntelRoutes.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Extend Express session types
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      assessment?: any;
      site?: any;
    }
  }
}

// Middleware to verify assessment ownership or organization access
async function verifyAssessmentOwnership(req: any, res: any, next: any) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const assessmentId = req.params.id;
    const assessment = await storage.getAssessmentWithQuestions(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Allow access if user owns the assessment
    if (assessment.userId === userId) {
      req.assessment = assessment;
      return next();
    }

    // Allow access if user is in the same organization (multi-tenancy)
    const user = await storage.getUser(userId);
    if (user && user.organizationId && assessment.organizationId === user.organizationId) {
      req.assessment = assessment;
      return next();
    }

    return res.status(403).json({ error: "Access denied" });
  } catch (error) {
    console.error("Error verifying assessment ownership:", error);
    res.status(500).json({ error: "Failed to verify access" });
  }
}

// Middleware to verify admin access
async function verifyAdminAccess(req: any, res: any, next: any) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Error verifying admin access:", error);
    res.status(500).json({ error: "Failed to verify admin access" });
  }
}

// Middleware to verify site ownership or organization access
async function verifySiteOwnership(req: any, res: any, next: any) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Support both :id and :siteId parameter names
    const siteId = req.params.id || req.params.siteId;
    const site = await storage.getSite(siteId);
    
    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Allow access if user owns the site
    if (site.userId === userId) {
      req.site = site;
      return next();
    }

    // Allow access if user is in the same organization (multi-tenancy)
    const user = await storage.getUser(userId);
    if (user && user.organizationId && site.organizationId === user.organizationId) {
      req.site = site;
      return next();
    }

    return res.status(403).json({ error: "Access denied" });
  } catch (error) {
    console.error("Error verifying site ownership:", error);
    res.status(500).json({ error: "Failed to verify access" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register Geographic Intelligence routes
  registerGeoIntelRoutes(app, storage);

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const signupSchema = insertUserSchema.extend({
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });

      const validatedData = signupSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists (only if provided)
      if (validatedData.email) {
        const existingEmail = await storage.getUserByEmail(validatedData.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user with hashed password (accountTier will default to "free")
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email || null,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      // Save session explicitly before sending response
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error during signup:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
      });

      const validatedData = loginSchema.parse(req.body);

      // Find user by username
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Set session
      req.session.userId = user.id;

      // Save session explicitly before sending response
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  // Password reset - request token
  app.post("/api/auth/request-password-reset", async (req, res) => {
    try {
      const requestSchema = z.object({
        email: z.string().email("Please enter a valid email address"),
      });

      const validatedData = requestSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      
      // Always return the same response to prevent user enumeration
      const response = { 
        message: "If an account with that email exists, a password reset link has been sent." 
      };

      if (user) {
        // Invalidate any existing unused tokens for this user
        await storage.invalidateUserPasswordResetTokens(user.id);

        // Generate random token (unhashed)
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Hash the token before storing
        const tokenHash = await bcrypt.hash(token, 10);

        // Store hashed token in database
        await storage.createPasswordResetToken({
          userId: user.id,
          token: tokenHash,
          expiresAt,
          used: false,
        });

        // In production, email the plain token to the user
        // For development/admin use, log it (in production, never log or return this)
        console.log(`Password reset token for ${validatedData.email}: ${token}`);
        console.log(`Reset link: ${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000'}/reset-password?token=${token}`);
        console.log(`Expires at: ${expiresAt}`);
      }

      // Always return the same response
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error requesting password reset:", error);
      res.status(500).json({ error: "Failed to request password reset" });
    }
  });

  // Password reset - verify token and reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const resetSchema = z.object({
        token: z.string().min(1, "Token is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      });

      const validatedData = resetSchema.parse(req.body);

      // Get all valid (unused, unexpired) tokens for verification
      const validTokens = await storage.getValidPasswordResetTokens();
      
      // Find a matching token by comparing hashes
      let matchedToken = null;
      for (const storedToken of validTokens) {
        const isMatch = await bcrypt.compare(validatedData.token, storedToken.token);
        if (isMatch) {
          matchedToken = storedToken;
          break;
        }
      }

      if (!matchedToken) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Check if token is expired or already used (double-check)
      if (matchedToken.used) {
        return res.status(400).json({ error: "This token has already been used" });
      }

      if (new Date() > new Date(matchedToken.expiresAt)) {
        return res.status(400).json({ error: "This token has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

      // Update user password
      await storage.updateUserPassword(matchedToken.userId, hashedPassword);

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(matchedToken.id);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update current user's email
  app.patch("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const updateSchema = z.object({
        email: z.string().email("Please enter a valid email address"),
      });

      const validatedData = updateSchema.parse(req.body);

      // Check if email already exists (for another user)
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail && existingEmail.id !== req.session.userId) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Update user email
      await storage.updateUserEmail(req.session.userId, validatedData.email);

      // Get updated user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating user email:", error);
      res.status(500).json({ error: "Failed to update email" });
    }
  });

  // Team management routes
  app.get("/api/team/organization", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.organizationId) {
        return res.json(null);
      }

      const organization = await storage.getOrganization(user.organizationId);
      res.json(organization);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  });

  // Organization CRUD routes
  app.post("/api/organizations", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Users must not already be in an organization
      if (user.organizationId) {
        return res.status(400).json({ error: "You are already in an organization" });
      }

      // Only paid tier users (basic, pro, enterprise) can create organizations
      const validTiers = ['basic', 'pro', 'enterprise'];
      if (!validTiers.includes(user.accountTier)) {
        return res.status(403).json({ 
          error: "You need a Basic, Pro, or Enterprise account to create an organization",
          needsUpgrade: true 
        });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Organization name is required" });
      }

      // Inherit organization tier from user's account tier
      // Apply tier-based limits from pricing page
      const orgTier = user.accountTier as 'basic' | 'pro' | 'enterprise';
      const tierLimits = getOrganizationTierLimits(orgTier);

      // Create organization with tier-based limits
      const organization = await storage.createOrganization({
        name,
        ownerId: user.id,
        accountTier: orgTier,
        maxMembers: tierLimits.maxMembers,
        maxSites: tierLimits.maxSites,
        maxAssessments: tierLimits.maxAssessments,
      });

      // Add user to organization as owner
      await storage.addUserToOrganization(user.id, organization.id, 'owner');

      res.status(201).json(organization);
    } catch (error) {
      console.error("Error creating organization:", error);
      res.status(500).json({ error: "Failed to create organization" });
    }
  });

  app.patch("/api/organizations/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.organizationId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only owners can update organization
      if (user.organizationRole !== 'owner') {
        return res.status(403).json({ error: "Only organization owners can update settings" });
      }

      // Validate and whitelist allowed fields (only safe fields - tier changes require admin/payment)
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      
      // Note: accountTier changes must be done through admin panel or payment flow

      const updated = await storage.updateOrganization(req.params.id, validatedData);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      console.error("Error updating organization:", error);
      res.status(500).json({ error: "Failed to update organization" });
    }
  });

  app.delete("/api/organizations/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.organizationId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only owners can delete organization
      if (user.organizationRole !== 'owner') {
        return res.status(403).json({ error: "Only organization owners can delete the organization" });
      }

      // Remove all members from organization first
      const members = await storage.getOrganizationMembers(req.params.id);
      for (const member of members) {
        await storage.removeUserFromOrganization(member.id);
      }

      // Actually delete the organization record
      const deleted = await storage.deleteOrganization(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Organization not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting organization:", error);
      res.status(500).json({ error: "Failed to delete organization" });
    }
  });

  // Organization Invitation Routes
  app.post("/api/organizations/:id/invitations", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.organizationId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only owners and admins can invite
      if (user.organizationRole !== 'owner' && user.organizationRole !== 'admin') {
        return res.status(403).json({ error: "Only owners and admins can invite members" });
      }

      const { email, role } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Cannot invite owners
      if (role === 'owner') {
        return res.status(400).json({ error: "Cannot invite users as owners" });
      }

      // Check if user already exists in this organization
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.organizationId === req.params.id) {
        return res.status(400).json({ error: "User is already a member of this organization" });
      }

      // Check for existing pending invitation
      const existingInvitations = await storage.listOrganizationInvitations(req.params.id);
      const pendingInvite = existingInvitations.find(
        inv => inv.email === email && inv.status === 'pending'
      );
      if (pendingInvite) {
        return res.status(400).json({ error: "Invitation already sent to this email" });
      }

      // Generate cryptographically strong token
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await storage.createInvitation({
        organizationId: req.params.id,
        email,
        role: role || 'member',
        invitedBy: user.id,
        status: 'pending',
        token,
        expiresAt,
      });

      // Send invitation email
      const organization = await storage.getOrganization(req.params.id);
      if (organization) {
        await emailService.sendInvitationEmail({
          email,
          organizationName: organization.name,
          inviterName: user.username,
          role: invitation.role,
          token,
          expiresAt,
        }).catch(err => {
          console.error("Failed to send invitation email:", err);
          // Don't fail the request if email fails - invitation was still created
        });
      }

      // Return invitation without token for security
      const { token: _token, ...safeInvitation } = invitation;
      res.status(201).json(safeInvitation);
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ error: "Failed to create invitation" });
    }
  });

  app.get("/api/organizations/:id/invitations", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.organizationId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only owners and admins can view invitations
      if (user.organizationRole !== 'owner' && user.organizationRole !== 'admin') {
        return res.status(403).json({ error: "Only owners and admins can view invitations" });
      }

      const invitations = await storage.listOrganizationInvitations(req.params.id);
      
      // Filter out sensitive token data from response
      const safeInvitations = invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        invitedBy: inv.invitedBy,
        createdAt: inv.createdAt,
        acceptedAt: inv.acceptedAt,
        expiresAt: inv.expiresAt,
      }));
      
      res.json(safeInvitations);
    } catch (error) {
      console.error("Error listing invitations:", error);
      res.status(500).json({ error: "Failed to list invitations" });
    }
  });

  app.post("/api/invitations/:token/accept", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // User must not already be in an organization
      if (user.organizationId) {
        return res.status(400).json({ error: "You are already in an organization" });
      }

      const invitation = await storage.getInvitationByToken(req.params.token);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }

      if (invitation.status !== 'pending') {
        return res.status(400).json({ error: "Invitation is no longer valid" });
      }

      if (new Date() > new Date(invitation.expiresAt)) {
        return res.status(400).json({ error: "Invitation has expired" });
      }

      // Verify email matches (if user has email set)
      if (user.email && user.email !== invitation.email) {
        return res.status(403).json({ error: "This invitation was sent to a different email address" });
      }

      // Add user to organization
      await storage.addUserToOrganization(user.id, invitation.organizationId, invitation.role);

      // Mark invitation as accepted
      await storage.updateInvitation(invitation.id, {
        status: 'accepted',
        acceptedAt: new Date(),
      });

      const organization = await storage.getOrganization(invitation.organizationId);
      res.json({ success: true, organization });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  });

  app.delete("/api/invitations/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const invitation = await storage.getInvitation(req.params.id);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.organizationId !== invitation.organizationId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only owners and admins can revoke invitations
      if (user.organizationRole !== 'owner' && user.organizationRole !== 'admin') {
        return res.status(403).json({ error: "Only owners and admins can revoke invitations" });
      }

      // Mark as revoked instead of deleting (for audit trail)
      await storage.updateInvitation(req.params.id, { status: 'revoked' });

      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking invitation:", error);
      res.status(500).json({ error: "Failed to revoke invitation" });
    }
  });

  app.get("/api/team/members", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || !user.organizationId) {
        return res.json([]);
      }

      const members = await storage.getOrganizationMembers(user.organizationId);
      // Remove passwords from response
      const membersWithoutPasswords = members.map(({ password, ...member }) => member);
      res.json(membersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/team/sites", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { memberId } = req.query;

      let sites;
      if (memberId && typeof memberId === 'string') {
        // Get sites for a specific team member
        // Verify the member is in the same organization
        const member = await storage.getUser(memberId);
        if (!member || member.organizationId !== user.organizationId) {
          return res.status(403).json({ error: "Access denied" });
        }
        sites = await storage.getSitesByUserId(memberId);
      } else if (user.organizationId) {
        // Get all sites for the organization
        sites = await storage.getOrganizationSites(user.organizationId);
      } else {
        // Free tier user - only their own sites
        sites = await storage.getAllSites(user.id);
      }

      res.json(sites);
    } catch (error) {
      console.error("Error fetching team sites:", error);
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", verifyAdminAccess, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/reset-password", verifyAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(id, hashedPassword);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.post("/api/admin/users/:id/tier", verifyAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const { accountTier } = req.body;

      const validTiers = ['free', 'basic', 'pro', 'enterprise'];
      if (!accountTier || !validTiers.includes(accountTier)) {
        return res.status(400).json({ error: "Invalid account tier. Must be one of: free, basic, pro, enterprise" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // If downgrading to free tier, validate organization constraints BEFORE updating
      if (accountTier === 'free' && user.organizationId) {
        // Check if user is the organization owner
        const org = await storage.getOrganization(user.organizationId);
        if (org && org.ownerId === id) {
          // Cannot downgrade organization owner to free tier
          return res.status(400).json({ 
            error: "Cannot downgrade organization owner to free tier. Please transfer ownership or delete the organization first." 
          });
        }
        // Remove user from organization first
        await storage.removeUserFromOrganization(id);
      }

      // Update the user's account tier after all validations pass
      await storage.updateUserAccountTier(id, accountTier);

      res.json({ message: "Account tier updated successfully", accountTier });
    } catch (error) {
      console.error("Error updating account tier:", error);
      res.status(500).json({ error: "Failed to update account tier" });
    }
  });

  app.get("/api/admin/organizations", verifyAdminAccess, async (req, res) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching all organizations:", error);
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  app.patch("/api/admin/organizations/:id/limits", verifyAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const { maxMembers, maxSites, maxAssessments } = req.body;

      const organization = await storage.getOrganization(id);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Validate inputs
      if (maxMembers !== undefined && (typeof maxMembers !== 'number' || maxMembers < -1)) {
        return res.status(400).json({ error: "maxMembers must be a number >= -1" });
      }
      if (maxSites !== undefined && (typeof maxSites !== 'number' || maxSites < -1)) {
        return res.status(400).json({ error: "maxSites must be a number >= -1" });
      }
      if (maxAssessments !== undefined && (typeof maxAssessments !== 'number' || maxAssessments < -1)) {
        return res.status(400).json({ error: "maxAssessments must be a number >= -1" });
      }

      // Update organization limits
      const updateData: Partial<typeof organization> = {};
      if (maxMembers !== undefined) updateData.maxMembers = maxMembers;
      if (maxSites !== undefined) updateData.maxSites = maxSites;
      if (maxAssessments !== undefined) updateData.maxAssessments = maxAssessments;

      const updated = await storage.updateOrganization(id, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating organization limits:", error);
      res.status(500).json({ error: "Failed to update organization limits" });
    }
  });

  app.post("/api/admin/seed-production", verifyAdminAccess, async (req, res) => {
    try {
      console.log('🌱 Starting production database seeding...');
      console.log('⚠️  WARNING: This will replace existing template questions');
      
      const results = {
        interviewQuestions: 0,
        executiveSurveyQuestions: 0,
        errors: [] as string[],
        warnings: [] as string[]
      };

      // Import seed functions
      const { seedInterviewQuestions } = await import('./seed-interview-questions');
      const { seedExecutiveSurveyQuestions } = await import('./seed-executive-questions');

      // Run each seed script and capture actual counts
      try {
        const count = await seedInterviewQuestions();
        results.interviewQuestions = count;
        console.log(`✅ Interview questions seeded: ${count}`);
      } catch (error) {
        const errorMsg = `Interview questions failed: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }

      try {
        const result = await seedExecutiveSurveyQuestions();
        results.executiveSurveyQuestions = result.count;
        console.log(`✅ Executive survey questions seeded: ${result.count}`);
        if (result.deletedFacilitySurveyData) {
          results.warnings.push('Deleted associated facility survey data as part of template cleanup');
        }
      } catch (error) {
        const errorMsg = `Executive survey questions failed: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }

      const totalSuccess = results.interviewQuestions + results.executiveSurveyQuestions;
      console.log(`🎉 Production database seeding complete! Total: ${totalSuccess} questions`);
      
      res.json({ 
        message: results.errors.length === 0 
          ? "Database seeded successfully"
          : `Partial success: ${results.errors.length} error(s) occurred`,
        results 
      });
    } catch (error) {
      console.error("Error seeding production database:", error);
      res.status(500).json({ 
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      // Return the assessment templates defined in shared/templates.ts
      res.json(ASSESSMENT_TEMPLATES);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Site routes
  app.get("/api/sites", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      let sites = await storage.getAllSites(userId);

      // If user is in an organization, include sites from organization members
      if (user.organizationId) {
        const members = await storage.getOrganizationMembers(user.organizationId);
        const memberIds = members.map(m => m.id).filter(id => id !== userId);
        
        for (const memberId of memberIds) {
          const memberSites = await storage.getAllSites(memberId);
          // Only include sites that have the organization ID
          const orgSites = memberSites.filter(s => s.organizationId === user.organizationId);
          sites = [...sites, ...orgSites];
        }
      }

      res.json(sites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });

  app.get("/api/sites/:id", verifySiteOwnership, async (req, res) => {
    try {
      // Site already verified and stored in req.site by middleware
      res.json(req.site);
    } catch (error) {
      console.error("Error fetching site:", error);
      res.status(500).json({ error: "Failed to fetch site" });
    }
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check tier site limit
      const existingSites = await storage.getAllSites(userId);
      const tier = user.accountTier as AccountTier;
      
      if (!canCreateSite(tier, existingSites.length)) {
        return res.status(403).json({ 
          error: getUpgradeMessage(tier, "site"),
          needsUpgrade: true 
        });
      }

      // Sanitize: Remove organizationId from request body to prevent tampering
      const { organizationId: _, ...bodyData } = req.body;
      
      const validatedData = insertSiteSchema.parse({
        ...bodyData,
        userId,
        organizationId: user.organizationId || null
      });

      const site = await storage.createSite(validatedData);
      res.status(201).json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating site:", error);
      res.status(500).json({ error: "Failed to create site" });
    }
  });

  app.put("/api/sites/:id", verifySiteOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      // Sanitize: Remove ownership fields from update payload to prevent tampering
      const { userId, organizationId, ...updateData } = req.body;
      const updated = await storage.updateSite(id, updateData);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating site:", error);
      res.status(500).json({ error: "Failed to update site" });
    }
  });

  app.delete("/api/sites/:id", verifySiteOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSite(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting site:", error);
      res.status(500).json({ error: "Failed to delete site" });
    }
  });

  // Facility Zone routes
  app.get("/api/sites/:siteId/zones", verifySiteOwnership, async (req, res) => {
    try {
      const { siteId } = req.params;
      const zones = await storage.getFacilityZonesBySite(siteId);
      res.json(zones);
    } catch (error) {
      console.error("Error fetching facility zones:", error);
      res.status(500).json({ error: "Failed to fetch facility zones" });
    }
  });

  app.get("/api/zones/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const zone = await storage.getFacilityZone(id);
      
      if (!zone) {
        return res.status(404).json({ error: "Zone not found" });
      }

      // Verify user owns the site that this zone belongs to
      const site = await storage.getSite(zone.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check if user owns the site or is in the same organization
      const isOwner = site.userId === userId;
      const isSameOrg = user.organizationId && site.organizationId === user.organizationId;

      if (!isOwner && !isSameOrg) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(zone);
    } catch (error) {
      console.error("Error fetching zone:", error);
      res.status(500).json({ error: "Failed to fetch zone" });
    }
  });

  app.post("/api/sites/:siteId/zones", verifySiteOwnership, async (req, res) => {
    try {
      const { siteId } = req.params;

      const validatedData = insertFacilityZoneSchema.parse({
        ...req.body,
        siteId
      });

      const zone = await storage.createFacilityZone(validatedData);
      res.status(201).json(zone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating facility zone:", error);
      res.status(500).json({ error: "Failed to create facility zone" });
    }
  });

  app.put("/api/zones/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const zone = await storage.getFacilityZone(id);
      
      if (!zone) {
        return res.status(404).json({ error: "Zone not found" });
      }

      // Verify user owns the site that this zone belongs to
      const site = await storage.getSite(zone.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check if user owns the site or is in the same organization
      const isOwner = site.userId === userId;
      const isSameOrg = user.organizationId && site.organizationId === user.organizationId;

      if (!isOwner && !isSameOrg) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Sanitize: Remove siteId from update payload to prevent tampering
      const { siteId: _, ...updateData } = req.body;
      const updated = await storage.updateFacilityZone(id, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating zone:", error);
      res.status(500).json({ error: "Failed to update zone" });
    }
  });

  app.delete("/api/zones/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const zone = await storage.getFacilityZone(id);
      
      if (!zone) {
        return res.status(404).json({ error: "Zone not found" });
      }

      // Verify user owns the site that this zone belongs to
      const site = await storage.getSite(zone.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check if user owns the site or is in the same organization
      const isOwner = site.userId === userId;
      const isSameOrg = user.organizationId && site.organizationId === user.organizationId;

      if (!isOwner && !isSameOrg) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteFacilityZone(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting zone:", error);
      res.status(500).json({ error: "Failed to delete zone" });
    }
  });

  // Threat Library routes
  app.get("/api/libraries/threats", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const threats = await storage.getThreatLibrary();
      res.json(threats);
    } catch (error) {
      console.error("Error fetching threat library:", error);
      res.status(500).json({ error: "Failed to fetch threat library" });
    }
  });

  app.get("/api/libraries/threats/category/:category", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { category } = req.params;
      const threats = await storage.getThreatLibraryByCategory(category);
      res.json(threats);
    } catch (error) {
      console.error("Error fetching threats by category:", error);
      res.status(500).json({ error: "Failed to fetch threats by category" });
    }
  });

  app.get("/api/libraries/threats/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const threat = await storage.getThreatLibraryItem(id);
      
      if (!threat) {
        return res.status(404).json({ error: "Threat not found" });
      }

      res.json(threat);
    } catch (error) {
      console.error("Error fetching threat:", error);
      res.status(500).json({ error: "Failed to fetch threat" });
    }
  });

  // Control Library routes
  app.get("/api/libraries/controls", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const controls = await storage.getControlLibrary();
      res.json(controls);
    } catch (error) {
      console.error("Error fetching control library:", error);
      res.status(500).json({ error: "Failed to fetch control library" });
    }
  });

  app.get("/api/libraries/controls/category/:category", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { category } = req.params;
      const controls = await storage.getControlLibraryByCategory(category);
      res.json(controls);
    } catch (error) {
      console.error("Error fetching controls by category:", error);
      res.status(500).json({ error: "Failed to fetch controls by category" });
    }
  });

  app.get("/api/libraries/controls/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const control = await storage.getControlLibraryItem(id);
      
      if (!control) {
        return res.status(404).json({ error: "Control not found" });
      }

      res.json(control);
    } catch (error) {
      console.error("Error fetching control:", error);
      res.status(500).json({ error: "Failed to fetch control" });
    }
  });

  // Assessment routes
  app.get("/api/assessments", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      let assessments = await storage.getAllAssessments(userId);

      // If user is in an organization, include assessments from organization members
      if (user.organizationId) {
        const members = await storage.getOrganizationMembers(user.organizationId);
        const memberIds = members.map(m => m.id).filter(id => id !== userId);
        
        for (const memberId of memberIds) {
          const memberAssessments = await storage.getAllAssessments(memberId);
          // Only include assessments that have the organization ID
          const orgAssessments = memberAssessments.filter(a => a.organizationId === user.organizationId);
          assessments = [...assessments, ...orgAssessments];
        }
      }

      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", verifyAssessmentOwnership, async (req, res) => {
    try {
      // Assessment already verified and stored in req.assessment by middleware
      res.json(req.assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  // Get comprehensive report data for an assessment
  app.get("/api/assessments/:id/comprehensive-report-data", verifyAssessmentOwnership, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const assessmentId = req.params.id;
      
      // Import the report data aggregator
      const { aggregateReportData } = await import("./services/reportDataAggregator");
      
      // Get comprehensive data
      const reportData = await aggregateReportData(assessmentId, storage, userId);
      
      res.json(reportData);
    } catch (error) {
      console.error("Error generating comprehensive report data:", error);
      res.status(500).json({ error: "Failed to generate comprehensive report data" });
    }
  });

  // WAREHOUSE FRAMEWORK v2.0 ROUTES
  // Get warehouse-specific analysis including cargo theft vulnerability score
  app.get("/api/assessments/:id/warehouse-analysis", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const assessment = req.assessment; // Verified by middleware
      
      // Import the cargo theft vulnerability scoring function
      const { calculateCargoTheftVulnerabilityScore } = await import("./services/risk-engine/adapters/warehouse");
      
      // Get loading docks for this assessment
      const loadingDocks = await storage.getLoadingDocksByAssessment(assessmentId);
      
      // Calculate cargo theft vulnerability score
      const riskAnalysis = calculateCargoTheftVulnerabilityScore(assessment);
      
      // Return comprehensive warehouse data
      res.json({
        assessment,
        loadingDocks,
        riskAnalysis,
      });
    } catch (error) {
      console.error("Error generating warehouse analysis:", error);
      res.status(500).json({ error: "Failed to generate warehouse analysis" });
    }
  });

  // Update warehouse profile (JSONB column)
  app.patch("/api/assessments/:id/warehouse-profile", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const warehouseProfileData = req.body;
      
      // Validate warehouse profile data structure
      const warehouseProfileSchema = z.object({
        warehouseType: z.string().optional(),
        squareFootage: z.number().optional(),
        inventoryValue: z.number().optional(),
        highValueProducts: z.array(z.string()).optional(),
        loadingDockCount: z.number().optional(),
        dailyTruckVolume: z.number().optional(),
        shrinkageRate: z.number().optional(),
        cargoTheftIncidents: z.array(z.object({
          date: z.string(),
          loss: z.number(),
          insiderInvolvement: z.boolean().optional(),
        })).optional(),
        locationRisk: z.enum(['High', 'Medium', 'Low']).optional(),
      });
      
      const validatedProfile = warehouseProfileSchema.parse(warehouseProfileData);
      
      // Update assessment with new warehouse_profile data
      const updatedAssessment = await storage.updateAssessment(assessmentId, {
        warehouse_profile: validatedProfile,
      });
      
      if (!updatedAssessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      res.json(updatedAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid warehouse profile data", details: error.errors });
      }
      console.error("Error updating warehouse profile:", error);
      res.status(500).json({ error: "Failed to update warehouse profile" });
    }
  });

  // Create new loading dock
  app.post("/api/assessments/:id/loading-docks", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      
      // Validate input data using Zod schema
      const validatedData = insertLoadingDockSchema.parse({
        ...req.body,
        assessmentId,
      });
      
      // Create loading dock
      const loadingDock = await storage.createLoadingDock(validatedData);
      
      res.status(201).json(loadingDock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid loading dock data", details: error.errors });
      }
      console.error("Error creating loading dock:", error);
      res.status(500).json({ error: "Failed to create loading dock" });
    }
  });

  // Update loading dock
  app.patch("/api/assessments/:id/loading-docks/:dockId", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id: assessmentId, dockId } = req.params;
      
      // Get existing dock to verify it belongs to this assessment
      const existingDock = await storage.getLoadingDock(dockId);
      if (!existingDock) {
        return res.status(404).json({ error: "Loading dock not found" });
      }
      
      if (existingDock.assessmentId !== assessmentId) {
        return res.status(403).json({ error: "Loading dock does not belong to this assessment" });
      }
      
      // Validate partial update data (excluding assessmentId which shouldn't change)
      const { assessmentId: _, ...updateData } = req.body;
      const validatedData = insertLoadingDockSchema.partial().parse(updateData);
      
      // Update loading dock
      const updatedDock = await storage.updateLoadingDock(dockId, validatedData);
      
      if (!updatedDock) {
        return res.status(404).json({ error: "Loading dock not found" });
      }
      
      res.json(updatedDock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid loading dock data", details: error.errors });
      }
      console.error("Error updating loading dock:", error);
      res.status(500).json({ error: "Failed to update loading dock" });
    }
  });

  // Delete loading dock
  app.delete("/api/assessments/:id/loading-docks/:dockId", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id: assessmentId, dockId } = req.params;
      
      // Get existing dock to verify it belongs to this assessment
      const existingDock = await storage.getLoadingDock(dockId);
      if (!existingDock) {
        return res.status(404).json({ error: "Loading dock not found" });
      }
      
      if (existingDock.assessmentId !== assessmentId) {
        return res.status(403).json({ error: "Loading dock does not belong to this assessment" });
      }
      
      // Delete loading dock
      const success = await storage.deleteLoadingDock(dockId);
      
      if (!success) {
        return res.status(404).json({ error: "Loading dock not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting loading dock:", error);
      res.status(500).json({ error: "Failed to delete loading dock" });
    }
  });

  // RETAIL STORE FRAMEWORK ROUTES
  // Get retail-specific analysis including shrinkage risk score
  app.get("/api/assessments/:id/retail-analysis", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessment = req.assessment; // Verified by middleware
      
      // Import the shrinkage risk scoring function
      const { calculateShrinkageRiskScore } = await import("./services/risk-engine/adapters/retail");
      
      // Calculate shrinkage risk score
      const riskAnalysis = calculateShrinkageRiskScore(assessment);
      
      // Return comprehensive retail data
      res.json({
        assessment,
        riskAnalysis,
      });
    } catch (error) {
      console.error("Error generating retail analysis:", error);
      res.status(500).json({ error: "Failed to generate retail analysis" });
    }
  });

  // Update retail profile (JSONB column)
  app.patch("/api/assessments/:id/retail-profile", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const retailProfileData = req.body;
      
      // Validate retail profile data structure
      const retailProfileSchema = z.object({
        annualRevenue: z.number().optional(),
        shrinkageRate: z.number().optional(),
        highValueMerchandise: z.array(z.string()).optional(),
        storeFormat: z.string().optional(),
      });
      
      const validatedProfile = retailProfileSchema.parse(retailProfileData);
      
      // Update assessment with new retail_profile data
      const updatedAssessment = await storage.updateAssessment(assessmentId, {
        retail_profile: validatedProfile,
      });
      
      if (!updatedAssessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      // Auto-generate retail risk scenarios after profile update (non-fatal)
      console.log(`🛒 Triggering retail risk scenario generation for assessment ${assessmentId}`);
      
      try {
        const { generateRetailRiskScenarios } = await import('./services/risk-engine/generators/retail');
        const scenarioResult = await generateRetailRiskScenarios(assessmentId, storage);
        
        console.log(`📊 Retail scenario generation result:`, scenarioResult);
        
        // Return assessment with scenario generation metadata
        res.json({
          ...updatedAssessment,
          _scenarioGeneration: scenarioResult
        });
      } catch (genError) {
        // Scenario generation failed but profile save succeeded
        console.error('⚠️ Retail scenario generation failed:', genError);
        
        // Return success since profile update succeeded, but include error info
        res.json({
          ...updatedAssessment,
          _scenarioGeneration: {
            success: false,
            scenariosCreated: 0,
            criticalScenarios: 0,
            summary: 'Profile updated successfully, but scenario generation failed',
            errors: [genError instanceof Error ? genError.message : 'Unknown error']
          }
        });
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid retail profile data", details: error.errors });
      }
      console.error("Error updating retail profile:", error);
      res.status(500).json({ error: "Failed to update retail profile" });
    }
  });

  // MANUFACTURING FRAMEWORK ROUTES
  
  // Update manufacturing profile (JSONB column) - explicit wrapped payload
  app.patch("/api/assessments/:id/manufacturing-profile", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const { manufacturing_profile } = req.body; // Expect wrapped payload
      
      // Guard against missing payload
      if (!manufacturing_profile) {
        return res.status(400).json({ error: "Manufacturing profile data is required" });
      }
      
      // Validate using shared schema with safeParse
      const validationResult = manufacturingProfileSchema.safeParse(manufacturing_profile);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid manufacturing profile data", 
          details: validationResult.error.errors 
        });
      }
      
      // Update assessment with validated profile
      const updatedAssessment = await storage.updateAssessment(assessmentId, {
        manufacturing_profile: validationResult.data,
      });
      
      if (!updatedAssessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      res.json(updatedAssessment);
    } catch (error) {
      console.error("Error updating manufacturing profile:", error);
      res.status(500).json({ error: "Failed to update manufacturing profile" });
    }
  });

  // Get production continuity analysis
  app.get("/api/assessments/:id/production-continuity", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const assessment = req.assessment; // Verified by middleware
      
      // Import the manufacturing adapter
      const { ManufacturingAdapter } = await import("./services/risk-engine/adapters/manufacturing");
      const adapter = new ManufacturingAdapter(storage);
      
      // Calculate production continuity score
      const continuityScore = await adapter.calculateProductionContinuityScore(assessment);
      
      res.json(continuityScore);
    } catch (error) {
      console.error("Error calculating production continuity:", error);
      res.status(500).json({ error: "Failed to calculate production continuity score" });
    }
  });

  // DATACENTER FRAMEWORK ROUTES
  
  // Update datacenter profile (JSONB column) - explicit wrapped payload
  app.patch("/api/assessments/:id/datacenter-profile", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const { datacenter_profile } = req.body; // Expect wrapped payload
      
      // Guard against missing payload
      if (!datacenter_profile) {
        return res.status(400).json({ error: "Datacenter profile data is required" });
      }
      
      // Validate using shared schema with safeParse
      const validationResult = datacenterProfileSchema.safeParse(datacenter_profile);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid datacenter profile data", 
          details: validationResult.error.errors 
        });
      }
      
      // Update assessment with validated profile
      const updatedAssessment = await storage.updateAssessment(assessmentId, {
        datacenter_profile: validationResult.data,
      });
      
      if (!updatedAssessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      res.json(updatedAssessment);
    } catch (error) {
      console.error("Error updating datacenter profile:", error);
      res.status(500).json({ error: "Failed to update datacenter profile" });
    }
  });

  // Get uptime reliability and compliance analysis
  app.get("/api/assessments/:id/uptime-reliability", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const assessment = req.assessment; // Verified by middleware
      
      // Import the datacenter adapter
      const { DatacenterAdapter } = await import("./services/risk-engine/adapters/datacenter");
      const adapter = new DatacenterAdapter(storage);
      
      // Calculate uptime reliability and compliance scores
      const reliabilityScore = await adapter.calculateUptimeReliability(assessment);
      
      res.json(reliabilityScore);
    } catch (error) {
      console.error("Error calculating uptime reliability:", error);
      res.status(500).json({ error: "Failed to calculate uptime reliability score" });
    }
  });

  // OFFICE BUILDING FRAMEWORK ROUTES
  
  // Update office profile (JSONB column) - explicit wrapped payload
  app.patch("/api/assessments/:id/office-profile", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const { office_profile } = req.body; // Expect wrapped payload
      
      // Guard against missing payload
      if (!office_profile) {
        return res.status(400).json({ error: "Office profile data is required" });
      }
      
      // Validate using shared schema with safeParse
      const { officeProfileSchema } = await import("@shared/schema");
      const validationResult = officeProfileSchema.safeParse(office_profile);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid office profile data", 
          details: validationResult.error.errors 
        });
      }
      
      // Update assessment with validated profile
      const updatedAssessment = await storage.updateAssessment(assessmentId, {
        office_profile: validationResult.data,
      });
      
      if (!updatedAssessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      res.json(updatedAssessment);
    } catch (error) {
      console.error("Error updating office profile:", error);
      res.status(500).json({ error: "Failed to update office profile" });
    }
  });

  // Get office safety and data security analysis
  app.get("/api/assessments/:id/office-safety", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const assessment = req.assessment; // Verified by middleware
      
      // Import the office adapter
      const { OfficeAdapter } = await import("./services/risk-engine/adapters/office");
      const adapter = new OfficeAdapter(storage);
      
      // Calculate office safety scores
      const safetyScore = await adapter.calculateOfficeSafety(assessment);
      
      res.json(safetyScore);
    } catch (error) {
      console.error("Error calculating office safety:", error);
      res.status(500).json({ error: "Failed to calculate office safety score" });
    }
  });

  // EXECUTIVE PROTECTION FRAMEWORK ROUTES
  
  /**
   * Calculate exposure factor from executive profile
   * E = (Public Profile × 0.4) + (Media Exposure × 0.3) + (Net Worth × 0.2) + (Geographic Risk × 0.1)
   */
  function calculateExposureFromProfile(profile: any): number {
    const publicProfileMap: Record<string, number> = {
      'private': 1,
      'low': 2,
      'medium': 3,
      'high': 4,
      'very_high': 5
    };
    
    const mediaExposureMap: Record<string, number> = {
      'none': 1,
      'low': 2,
      'medium': 3,
      'high': 4,
      'very_high': 5
    };
    
    // Map actual netWorthRange enum values to exposure scores
    const netWorthMap: Record<string, number> = {
      'under_1m': 1,
      '1m_5m': 2,
      '5m_10m': 2,
      '10m_50m': 3,
      '50m_100m': 4,
      'over_100m': 5
    };
    
    const publicProfile = publicProfileMap[profile.publicProfile] || 3;
    const mediaExposure = mediaExposureMap[profile.mediaExposure || 'medium'] || 3;
    const netWorth = netWorthMap[profile.netWorthRange || '10m_50m'] || 3;
    const geographicRisk = 2; // Default to low-medium (could be enhanced with crime data)
    
    const exposure = (
      publicProfile * 0.4 +
      mediaExposure * 0.3 +
      netWorth * 0.2 +
      geographicRisk * 0.1
    );
    
    return Math.round(exposure * 100) / 100; // Round to 2 decimals
  }
  
  /**
   * Calculate risk metrics from profile and scenarios
   */
  async function calculateRiskMetrics(assessmentId: string, profile: any, storage: any) {
    const exposureFactor = calculateExposureFromProfile(profile);
    
    // Get all scenarios for this assessment
    const scenarios = await storage.getRiskScenarios(assessmentId);
    
    // Calculate aggregate risk score
    let totalRisk = 0;
    let criticalCount = 0;
    let highCount = 0;
    
    for (const scenario of scenarios) {
      totalRisk += scenario.inherentRisk || 0;
      
      if (scenario.riskLevel === 'Critical') criticalCount++;
      if (scenario.riskLevel === 'High') highCount++;
    }
    
    // Calculate average inherent risk and normalize to 0-100 scale
    // EP: max inherentRisk is 500 (5×5×5×4 from T×V×E×I)
    const avgInherentRisk = scenarios.length > 0 ? totalRisk / scenarios.length : 0;
    const avgRiskScore = Math.round((avgInherentRisk / 500) * 100);
    
    // Determine overall risk level based on normalized score and scenario counts
    let riskLevel = 'Low';
    if (criticalCount > 0 || avgRiskScore >= 75) {
      riskLevel = 'Critical';
    } else if (highCount > 0 || avgRiskScore >= 50) {
      riskLevel = 'High';
    } else if (avgRiskScore >= 25) {
      riskLevel = 'Medium';
    }
    
    return {
      exposureFactor,
      riskScore: avgRiskScore,
      riskLevel,
      activeScenarioCount: scenarios.length
    };
  }
  
  // Get executive profile for an assessment
  app.get("/api/assessments/:id/executive-profile", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      
      // Get executive profile
      const profile = await storage.getExecutiveProfileByAssessment(assessmentId);
      
      if (!profile) {
        return res.json({
          assessment: req.assessment,
          profile: null,
          analysis: null,
        });
      }
      
      // Calculate risk metrics from profile and scenarios
      const analysis = await calculateRiskMetrics(assessmentId, profile, storage);
      
      res.json({
        assessment: req.assessment,
        profile,
        analysis,
      });
    } catch (error) {
      console.error("Error fetching executive profile:", error);
      res.status(500).json({ error: "Failed to fetch executive profile" });
    }
  });

  // Update/Create executive profile and auto-generate EP risk scenarios
  app.patch("/api/assessments/:id/executive-profile", verifyAssessmentOwnership, async (req, res) => {
    try {
      const assessmentId = req.params.id;
      const profileData = req.body;
      
      // Validate executive profile data structure
      const executiveProfileSchema = z.object({
        fullName: z.string(),
        title: z.string().optional(),
        companyRole: z.string().optional(),
        publicProfile: z.string().default('medium'),
        netWorthRange: z.string().optional(),
        mediaExposure: z.string().optional(),
        currentSecurityLevel: z.string().default('minimal'),
        hasPersonalProtection: z.boolean().default(false),
        hasPanicRoom: z.boolean().default(false),
        hasArmoredVehicle: z.boolean().default(false),
      });
      
      const validatedProfile = executiveProfileSchema.parse(profileData);
      
      // Check if profile exists for this assessment
      const existingProfile = await storage.getExecutiveProfileByAssessment(assessmentId);
      
      let profile;
      if (existingProfile) {
        // Update existing profile
        profile = await storage.updateExecutiveProfile(existingProfile.id, validatedProfile);
      } else {
        // Create new profile
        profile = await storage.createExecutiveProfile({
          assessmentId,
          ...validatedProfile,
        });
      }
      
      if (!profile) {
        return res.status(404).json({ error: "Failed to save executive profile" });
      }
      
      // Auto-generate EP risk scenarios after profile update (non-fatal)
      console.log(`🛡️  Triggering EP risk scenario generation for assessment ${assessmentId}`);
      
      try {
        const { generateExecutiveProtectionRiskScenarios } = await import('./services/risk-engine/generators/executive-protection');
        const scenarioResult = await generateExecutiveProtectionRiskScenarios(assessmentId, storage);
        
        console.log(`📊 EP scenario generation result:`, scenarioResult);
        
        // Calculate risk metrics from profile and scenarios
        const analysis = await calculateRiskMetrics(assessmentId, profile, storage);
        
        // Return profile with scenario generation metadata and analysis
        res.json({
          profile,
          analysis,
          _scenarioGeneration: scenarioResult
        });
      } catch (genError) {
        // Scenario generation failed but profile save succeeded
        console.error('⚠️ EP scenario generation failed:', genError);
        
        // Still calculate metrics even if scenario generation failed
        const analysis = await calculateRiskMetrics(assessmentId, profile, storage);
        
        // Return success since profile update succeeded, but include error info
        res.json({
          profile,
          analysis,
          _scenarioGeneration: {
            success: false,
            scenariosCreated: 0,
            criticalScenarios: 0,
            summary: 'Profile updated successfully, but scenario generation failed',
            errors: [genError instanceof Error ? genError.message : 'Unknown error']
          }
        });
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid executive profile data", details: error.errors });
      }
      console.error("Error updating executive profile:", error);
      res.status(500).json({ error: "Failed to update executive profile" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // STEP 1: Validate input data FIRST (including required templateId)
      // This catches missing/invalid templates before any other logic runs
      // Sanitize: Remove organizationId from request body to prevent tampering
      const { organizationId: _, ...bodyData } = req.body;
      
      const validatedData = insertAssessmentSchema.parse({
        ...bodyData,
        userId,
        organizationId: user.organizationId || null
      });

      // STEP 2: Derive surveyParadigm from validated templateId
      const templateId = validatedData.templateId;
      const surveyParadigm = getSurveyParadigmFromTemplate(templateId) || "facility";
      
      // Add paradigm to validated data
      const dataWithParadigm = { ...validatedData, surveyParadigm };

      // STEP 3: Check tier limits AFTER validation
      const existingAssessments = await storage.getAllAssessments(userId);
      const tier = user.accountTier as AccountTier;
      
      if (!canCreateAssessment(tier, existingAssessments.length)) {
        return res.status(403).json({ 
          error: getUpgradeMessage(tier, "assessment"),
          needsUpgrade: true 
        });
      }

      // STEP 4: Create assessment with validated + enriched data
      const assessment = await storage.createAssessment(dataWithParadigm);

      // Auto-populate template questions (templateId is guaranteed to exist here)
      if (templateId) {
        try {
          const templateQuestions = await storage.getTemplateQuestions(templateId);
          
          if (templateQuestions.length > 0) {
            // Copy template questions to the correct table based on paradigm
            if (surveyParadigm === 'executive') {
              // For executive paradigm, copy to assessmentQuestions table
              const assessmentQuestions: InsertAssessmentQuestion[] = templateQuestions.map(tq => ({
                assessmentId: assessment.id,
                templateQuestionId: tq.id,
                questionId: tq.questionId,
                category: tq.category,
                subcategory: tq.subcategory || null,
                question: tq.question,
                bestPractice: tq.bestPractice || null,
                rationale: tq.rationale || null,
                importance: tq.importance || null,
                orderIndex: tq.orderIndex,
                type: tq.type || "yes-no",
                weight: 1,
                response: null,
                notes: null,
                evidence: null
              }));
              
              await storage.bulkCreateAssessmentQuestions(assessmentQuestions);
              console.log(`✓ Auto-populated ${assessmentQuestions.length} assessment questions from template: ${templateId}`);
            } else {
              // For facility paradigm, copy to facilitySurveyQuestions table (existing behavior)
              const facilityQuestions: InsertFacilitySurveyQuestion[] = templateQuestions.map(tq => ({
                assessmentId: assessment.id,
                templateQuestionId: tq.id,
                category: tq.category,
                subcategory: tq.subcategory || null,
                question: tq.question,
                bestPractice: tq.bestPractice || null,
                rationale: tq.rationale || null,
                importance: tq.importance || null,
                orderIndex: tq.orderIndex,
                type: tq.type || "yes-no",
                response: null,
                notes: null,
                evidence: null,
                recommendations: null,
                standard: null
              }));
              
              await storage.bulkCreateFacilityQuestions(facilityQuestions);
              console.log(`✓ Auto-populated ${facilityQuestions.length} survey questions from template: ${templateId}`);
            }
          }
        } catch (templateError) {
          console.error(`Error auto-populating template questions:`, templateError);
          // Don't fail the assessment creation if template population fails
        }
      }

      // Auto-create facility zones from template suggestions
      if (templateId && assessment.siteId) {
        try {
          const template = ASSESSMENT_TEMPLATES.find(t => t.id === templateId);
          
          if (template?.suggestedZones && template.suggestedZones.length > 0) {
            // Get existing zones for this site to avoid duplicates
            const existingZones = await storage.getFacilityZonesBySite(assessment.siteId);
            const existingZoneNames = existingZones.map(z => z.name.toLowerCase());
            
            // Create zones that don't already exist
            const zonesToCreate = template.suggestedZones.filter(
              sz => !existingZoneNames.includes(sz.name.toLowerCase())
            );
            
            for (const suggestedZone of zonesToCreate) {
              await storage.createFacilityZone({
                siteId: assessment.siteId,
                name: suggestedZone.name,
                zoneType: suggestedZone.zoneType,
                securityLevel: suggestedZone.securityLevel,
                description: suggestedZone.description || null,
                floorNumber: null,
                accessRequirements: null
              });
            }
            
            if (zonesToCreate.length > 0) {
              console.log(`✓ Auto-created ${zonesToCreate.length} facility zones from template: ${templateId}`);
            }
          }
        } catch (zoneError) {
          console.error(`Error auto-creating facility zones:`, zoneError);
          // Don't fail the assessment creation if zone creation fails
        }
      }

      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating assessment:", error);
      res.status(500).json({ error: "Failed to create assessment" });
    }
  });

  app.put("/api/assessments/:id", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      // Sanitize: Remove ownership fields from update payload to prevent tampering
      const { userId, organizationId, ...updateData } = req.body;
      const updated = await storage.updateAssessment(id, updateData);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(500).json({ error: "Failed to update assessment" });
    }
  });

  app.delete("/api/assessments/:id", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAssessment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ error: "Failed to delete assessment" });
    }
  });

  // Facility Survey routes
  app.get("/api/assessments/:id/facility-survey", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const questions = await storage.getFacilitySurveyQuestions(id);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching facility survey:", error);
      res.status(500).json({ error: "Failed to fetch facility survey" });
    }
  });

  app.post("/api/assessments/:id/facility-survey", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const { questions } = req.body;
      
      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions must be an array" });
      }

      // Validate each question
      const validatedQuestions = questions.map(q => 
        insertFacilitySurveyQuestionSchema.parse({ ...q, assessmentId: id })
      );
      
      const result = await storage.bulkUpsertFacilityQuestions(id, validatedQuestions);
      
      // Update assessment status to facility-survey when facility survey is saved
      const completedQuestions = result.filter(q => q.response !== null && q.response !== undefined).length;
      const progress = (completedQuestions / result.length) * 100;
      
      if (progress >= 80) {
        await storage.updateAssessment(id, { 
          status: "facility-survey",
          facilitySurveyCompleted: true,
          facilitySurveyCompletedAt: new Date()
        });
      }
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid facility survey data", details: error.errors });
      }
      console.error("Error saving facility survey:", error);
      res.status(500).json({ error: "Failed to save facility survey" });
    }
  });

  // Executive Interview routes
  app.get("/api/assessments/:id/executive-interview/questions", verifyAssessmentOwnership, async (req, res) => {
    try {
      const questions = await storage.getAllExecutiveInterviewQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching executive interview questions:", error);
      res.status(500).json({ error: "Failed to fetch executive interview questions" });
    }
  });

  app.get("/api/assessments/:id/executive-interview/responses", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const responses = await storage.getExecutiveInterviewResponses(id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching executive interview responses:", error);
      res.status(500).json({ error: "Failed to fetch executive interview responses" });
    }
  });

  app.post("/api/assessments/:id/executive-interview/responses", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const { questionId, yesNoResponse, textResponse } = req.body;

      if (!questionId) {
        return res.status(400).json({ error: "Question ID is required" });
      }

      const validatedResponse = insertExecutiveInterviewResponseSchema.parse({
        assessmentId: id,
        questionId,
        yesNoResponse: yesNoResponse !== undefined ? yesNoResponse : null,
        textResponse: textResponse || null
      });

      const response = await storage.upsertExecutiveInterviewResponse(validatedResponse);
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid response data", details: error.errors });
      }
      console.error("Error saving executive interview response:", error);
      res.status(500).json({ error: "Failed to save executive interview response" });
    }
  });

  // Assessment Questions routes (for executive paradigm objective assessment questions)
  app.get("/api/assessments/:id/assessment-questions", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const questions = await storage.getAssessmentQuestions(id);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching assessment questions:", error);
      res.status(500).json({ error: "Failed to fetch assessment questions" });
    }
  });

  app.patch("/api/assessments/:id/assessment-questions/:questionId", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { questionId } = req.params;
      
      // Validate: Only allow updating response, notes, and evidence fields
      const allowedUpdateSchema = z.object({
        response: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
        notes: z.string().nullable().optional(),
        evidence: z.array(z.string()).nullable().optional(),
      });
      
      const updateData = allowedUpdateSchema.parse(req.body);
      
      const updated = await storage.updateAssessmentQuestion(questionId, updateData);
      
      if (!updated) {
        return res.status(404).json({ error: "Question not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      console.error("Error updating assessment question:", error);
      res.status(500).json({ error: "Failed to update assessment question" });
    }
  });

  // Auto-generate risk scenarios from interview responses
  app.post("/api/assessments/:id/generate-scenarios-from-interview", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`🚀 Starting auto-generation of risk scenarios for assessment ${id}`);
      
      // Import the auto-generation service
      const { autoGenerateScenariosFromInterview } = await import('./services/auto-generate-scenarios');
      
      // Run auto-generation
      const result = await autoGenerateScenariosFromInterview(id, storage);
      
      if (!result.success) {
        return res.status(400).json({
          error: "Failed to generate scenarios",
          details: result.errors
        });
      }
      
      // Return success with details
      res.json({
        success: true,
        threatsCreated: result.threatsCreated,
        criticalThreats: result.criticalThreats,
        overallRiskLevel: result.overallRiskLevel,
        summary: result.summary,
        warnings: result.errors // Include warnings even on success
      });
      
    } catch (error) {
      console.error("Error in generate-scenarios-from-interview endpoint:", error);
      res.status(500).json({ 
        error: "Internal server error during scenario generation",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Auto-generate warehouse risk scenarios from warehouse profile + facility survey
  app.post("/api/assessments/:id/generate-warehouse-scenarios", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`🏭 Starting warehouse risk scenario generation for assessment ${id}`);
      
      // Import the warehouse generator
      const { generateWarehouseRiskScenarios } = await import('./services/risk-engine/generators/warehouse');
      
      // Run scenario generation
      const result = await generateWarehouseRiskScenarios(id, storage);
      
      if (!result.success) {
        return res.status(400).json({
          error: "Failed to generate warehouse scenarios",
          details: result.errors
        });
      }
      
      // Return success with details
      res.json({
        success: true,
        scenariosCreated: result.scenariosCreated,
        criticalScenarios: result.criticalScenarios,
        summary: result.summary,
        warnings: result.errors // Include warnings even on success
      });
      
    } catch (error) {
      console.error("Error in generate-warehouse-scenarios endpoint:", error);
      res.status(500).json({ 
        error: "Internal server error during warehouse scenario generation",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Asset Bridge route - Extract assets from facility survey for Phase 2
  app.post("/api/assessments/:id/extract-assets", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the facility survey questions for this assessment
      const facilityQuestions = await storage.getFacilitySurveyQuestions(id);
      
      if (facilityQuestions.length === 0) {
        return res.status(400).json({ error: "No facility survey data found" });
      }

      // Extract assets from facility survey responses
      const extractedAssets: any[] = [];

      // Map facility survey categories to risk assets
      const assetMappings: Record<string, {name: string, type: string, description: string}> = {
        'lighting': {
          name: 'Lighting Systems',
          type: 'Infrastructure',
          description: 'Facility lighting infrastructure including perimeter, parking, and emergency lighting'
        },
        'surveillance': {
          name: 'Surveillance Systems', 
          type: 'Technology',
          description: 'CCTV cameras, monitoring equipment, and video surveillance infrastructure'
        },
        'access-control': {
          name: 'Access Control Systems',
          type: 'Technology', 
          description: 'Door locks, card readers, visitor management, and entry point security'
        },
        'barriers': {
          name: 'Physical Barriers',
          type: 'Infrastructure',
          description: 'Perimeter fencing, walls, gates, and structural security barriers'
        },
        'intrusion-detection': {
          name: 'Intrusion Detection Systems',
          type: 'Technology',
          description: 'Alarm systems, motion sensors, and perimeter detection equipment'
        }
      };

      // Analyze facility survey responses and extract assets
      for (const question of facilityQuestions) {
        if (question.response && question.category) {
          const mapping = assetMappings[question.category];
          if (mapping) {
            // Check if this asset type is already extracted
            const existingAsset = extractedAssets.find(a => a.name === mapping.name);
            
            if (!existingAsset) {
              extractedAssets.push({
                assessmentId: id,
                name: mapping.name,
                type: mapping.type,
                description: mapping.description,
                source: 'facility_survey',
                sourceId: question.id,
                criticality: 'medium' // Default, can be customized later
              });
            }
          }
        }
      }

      // Add custom asset placeholder for user-defined assets
      extractedAssets.push({
        assessmentId: id,
        name: 'Custom Assets',
        type: 'Custom',
        description: 'User-defined assets specific to this facility',
        source: 'custom',
        sourceId: null,
        criticality: 'medium'
      });

      // Validate and save the extracted assets using the robust upsert method
      const validatedAssets = extractedAssets.map(asset => 
        insertRiskAssetSchema.parse(asset)
      );
      
      const savedAssets = await storage.bulkUpsertRiskAssets(id, validatedAssets);
      
      res.json({
        message: "Assets extracted successfully from facility survey",
        extractedCount: savedAssets.length,
        assets: savedAssets
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid asset data", details: error.errors });
      }
      console.error("Error extracting assets:", error);
      res.status(500).json({ error: "Failed to extract assets from facility survey" });
    }
  });

  // Risk Assets routes
  app.get("/api/assessments/:id/risk-assets", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const assets = await storage.getRiskAssets(id);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching risk assets:", error);
      res.status(500).json({ error: "Failed to fetch risk assets" });
    }
  });

  app.post("/api/assessments/:id/risk-assets", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const assetData = insertRiskAssetSchema.parse({ ...req.body, assessmentId: id });
      const result = await storage.createRiskAsset(assetData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid asset data", details: error.errors });
      }
      console.error("Error creating risk asset:", error);
      res.status(500).json({ error: "Failed to create risk asset" });
    }
  });

  app.delete("/api/risk-assets/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getRiskAsset(id);
      if (!resource) {
        return res.status(404).json({ error: "Risk asset not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const deleted = await storage.deleteRiskAsset(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting risk asset:", error);
      res.status(500).json({ error: "Failed to delete risk asset" });
    }
  });

  app.post("/api/assessments/:id/risk-assets/bulk", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const { assets } = req.body;
      
      if (!Array.isArray(assets)) {
        return res.status(400).json({ error: "Assets must be an array" });
      }

      const validatedAssets = assets.map(asset => 
        insertRiskAssetSchema.parse({ ...asset, assessmentId: id })
      );
      
      const result = await storage.bulkUpsertRiskAssets(id, validatedAssets);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid assets data", details: error.errors });
      }
      console.error("Error bulk upserting assets:", error);
      res.status(500).json({ error: "Failed to bulk upsert assets" });
    }
  });

  // Risk Scenarios routes
  app.get("/api/assessments/:id/risk-scenarios", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const scenarios = await storage.getRiskScenarios(id);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching risk scenarios:", error);
      res.status(500).json({ error: "Failed to fetch risk scenarios" });
    }
  });

  app.post("/api/assessments/:id/risk-scenarios", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const scenarioData = insertRiskScenarioSchema.parse({ ...req.body, assessmentId: id });
      
      // Automatic risk calculation (Task 9)
      const { calculateInherentRisk, calculateControlEffectiveness, calculateResidualRiskNBS } = await import("../shared/riskCalculations");
      
      // Use numeric scores if provided, otherwise default to 3
      const likelihoodScore = scenarioData.likelihoodScore ?? 3;
      const impactScore = scenarioData.impactScore ?? 3;
      
      // Calculate inherent risk (L × I)
      const inherentRisk = calculateInherentRisk(likelihoodScore, impactScore);
      
      // Calculate control effectiveness if threatLibraryId is provided
      let residualRisk = inherentRisk;
      let controlEffectiveness = 0;
      if (scenarioData.threatLibraryId) {
        const surveyResponses = await storage.getSurveyResponsesWithControlWeights(id, scenarioData.threatLibraryId);
        controlEffectiveness = calculateControlEffectiveness(surveyResponses);
        residualRisk = calculateResidualRiskNBS(inherentRisk, controlEffectiveness);
      }
      
      // Add calculated fields
      const dataWithCalculations = {
        ...scenarioData,
        likelihoodScore,
        impactScore,
        inherentRisk,
        controlEffectiveness,
        residualRisk,
      };
      
      const result = await storage.createRiskScenario(dataWithCalculations);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid scenario data", details: error.errors });
      }
      console.error("Error creating risk scenario:", error);
      res.status(500).json({ error: "Failed to create risk scenario" });
    }
  });

  app.put("/api/risk-scenarios/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getRiskScenario(id);
      if (!resource) {
        return res.status(404).json({ error: "Risk scenario not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Sanitize: Remove ownership fields to prevent reassignment
      const { assessmentId, ...updateData } = req.body;
      
      // Automatic risk recalculation if likelihood/impact/threat changed (Task 9)
      const { calculateInherentRisk, calculateControlEffectiveness, calculateResidualRiskNBS } = await import("../shared/riskCalculations");
      
      const likelihoodScore = updateData.likelihoodScore ?? resource.likelihoodScore ?? 3;
      const impactScore = updateData.impactScore ?? resource.impactScore ?? 3;
      const threatLibraryId = updateData.threatLibraryId ?? resource.threatLibraryId;
      
      // Recalculate inherent risk
      const inherentRisk = calculateInherentRisk(likelihoodScore, impactScore);
      
      // Recalculate control effectiveness
      let residualRisk = inherentRisk;
      let controlEffectiveness = 0;
      if (threatLibraryId) {
        const surveyResponses = await storage.getSurveyResponsesWithControlWeights(resource.assessmentId, threatLibraryId);
        controlEffectiveness = calculateControlEffectiveness(surveyResponses);
        residualRisk = calculateResidualRiskNBS(inherentRisk, controlEffectiveness);
      }
      
      const dataWithCalculations = {
        ...updateData,
        likelihoodScore,
        impactScore,
        inherentRisk,
        controlEffectiveness,
        residualRisk,
      };
      
      const result = await storage.updateRiskScenario(id, dataWithCalculations);
      res.json(result);
    } catch (error) {
      console.error("Error updating risk scenario:", error);
      res.status(500).json({ error: "Failed to update risk scenario" });
    }
  });

  // AI Narrative Intelligence - Generate professional analysis for warehouse risk scenarios
  app.post("/api/risk-scenarios/:id/generate-narrative", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      // Fetch the risk scenario
      const scenario = await storage.getRiskScenario(id);
      if (!scenario) {
        return res.status(404).json({ error: "Risk scenario not found" });
      }

      // Verify ownership through parent assessment
      const assessment = await storage.getAssessment(scenario.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Fetch facility survey questions and extract responses
      const surveyQuestions = await storage.getFacilitySurveyQuestions(scenario.assessmentId);
      const surveyResponses: Record<string, any> | null = surveyQuestions && surveyQuestions.length > 0
        ? surveyQuestions.reduce((acc, q) => {
            // Production data may have questionId field (from template_questions.questionId like "dock_4")
            // Fall back to template UUID, category, or record ID
            const questionData = q as any;  // Type assertion to access runtime fields
            const key = questionData.questionId          // Primary: questionId from template ("dock_4", "perimeter_1")
                     || q.templateQuestionId             // Fallback 1: template UUID
                     || q.category                       // Fallback 2: category name
                     || q.id;                            // Fallback 3: record UUID
            
            if (q.response && key) {
              // Extract value from response JSONB - handle both simple and complex formats
              let value = q.response;
              if (typeof q.response === 'object' && q.response !== null) {
                // Try to extract nested value/text/answer/optionId fields from JSONB
                const responseObj = q.response as any;
                value = responseObj.value 
                     || responseObj.text 
                     || responseObj.answer 
                     || responseObj.optionId
                     || responseObj.selected 
                     || q.response;  // Fallback to full object
              }
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>)
        : null;

      // Generate AI narrative using template-aware factory
      const { generateRiskNarrative } = await import("./services/ai/narrative-generator");
      const narrative = await generateRiskNarrative(scenario, assessment, surveyResponses);
      
      // Update only the threatDescription field to avoid corrupting other data
      const updatedScenario = await storage.updateRiskScenario(id, {
        threatDescription: narrative
      });
      
      console.log(`✅ Generated and saved AI narrative for scenario: ${scenario.scenario}`);
      
      res.json({
        success: true,
        narrative,
        updatedScenario
      });
      
    } catch (error) {
      console.error("❌ Error generating risk narrative:", error);
      res.status(500).json({ 
        error: "Failed to generate AI narrative",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.delete("/api/risk-scenarios/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getRiskScenario(id);
      if (!resource) {
        return res.status(404).json({ error: "Risk scenario not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const deleted = await storage.deleteRiskScenario(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting risk scenario:", error);
      res.status(500).json({ error: "Failed to delete risk scenario" });
    }
  });

  app.post("/api/assessments/:id/risk-scenarios/bulk", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const { scenarios } = req.body;
      
      if (!Array.isArray(scenarios)) {
        return res.status(400).json({ error: "Scenarios must be an array" });
      }

      const validatedScenarios = scenarios.map(scenario => 
        insertRiskScenarioSchema.parse({ ...scenario, assessmentId: id })
      );
      
      const result = await storage.bulkUpsertRiskScenarios(id, validatedScenarios);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid scenarios data", details: error.errors });
      }
      console.error("Error bulk upserting scenarios:", error);
      res.status(500).json({ error: "Failed to bulk upsert scenarios" });
    }
  });

  // Task 11: Risk Matrix endpoint - returns scenarios grouped by risk level for heatmap
  app.get("/api/assessments/:id/risk-matrix", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const scenarios = await storage.getRiskScenarios(id);
      
      // Group scenarios by likelihood (1-5) and impact (1-5) for 5x5 matrix
      const matrix: { [key: string]: typeof scenarios } = {};
      
      scenarios.forEach(scenario => {
        const l = scenario.likelihoodScore ?? 3;
        const i = scenario.impactScore ?? 3;
        const key = `${l}-${i}`;
        
        if (!matrix[key]) {
          matrix[key] = [];
        }
        matrix[key].push(scenario);
      });
      
      res.json({
        matrix,
        scenarios,
        summary: {
          total: scenarios.length,
          critical: scenarios.filter(s => (s.residualRisk ?? 0) >= 20).length,
          high: scenarios.filter(s => (s.residualRisk ?? 0) >= 12 && (s.residualRisk ?? 0) < 20).length,
          medium: scenarios.filter(s => (s.residualRisk ?? 0) >= 6 && (s.residualRisk ?? 0) < 12).length,
          low: scenarios.filter(s => (s.residualRisk ?? 0) < 6).length,
        }
      });
    } catch (error) {
      console.error("Error fetching risk matrix:", error);
      res.status(500).json({ error: "Failed to fetch risk matrix" });
    }
  });

  // Task 12: Cascading recalculation - recalculates all scenarios when survey answers change
  app.post("/api/assessments/:id/recalc-controls", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const scenarios = await storage.getRiskScenarios(id);
      
      const { calculateInherentRisk, calculateControlEffectiveness, calculateResidualRiskNBS } = await import("../shared/riskCalculations");
      
      // Recalculate each scenario
      const updatedScenarios = await Promise.all(
        scenarios.map(async (scenario) => {
          const likelihoodScore = scenario.likelihoodScore ?? 3;
          const impactScore = scenario.impactScore ?? 3;
          
          // Recalculate inherent risk
          const inherentRisk = calculateInherentRisk(likelihoodScore, impactScore);
          
          // Recalculate control effectiveness if threat is specified
          let residualRisk = inherentRisk;
          let controlEffectiveness = 0;
          if (scenario.threatLibraryId) {
            const surveyResponses = await storage.getSurveyResponsesWithControlWeights(id, scenario.threatLibraryId);
            controlEffectiveness = calculateControlEffectiveness(surveyResponses);
            residualRisk = calculateResidualRiskNBS(inherentRisk, controlEffectiveness);
          }
          
          // Update the scenario with new calculations
          return await storage.updateRiskScenario(scenario.id, {
            inherentRisk,
            controlEffectiveness,
            residualRisk,
          });
        })
      );
      
      res.json({
        updated: updatedScenarios.length,
        scenarios: updatedScenarios,
      });
    } catch (error) {
      console.error("Error recalculating controls:", error);
      res.status(500).json({ error: "Failed to recalculate controls" });
    }
  });

  // Treatment Plans routes
  app.get("/api/assessments/:id/treatment-plans", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const plans = await storage.getTreatmentPlans(id);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching treatment plans:", error);
      res.status(500).json({ error: "Failed to fetch treatment plans" });
    }
  });

  app.post("/api/assessments/:id/treatment-plans", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const planData = insertTreatmentPlanSchema.parse({ ...req.body, assessmentId: id });
      const result = await storage.createTreatmentPlan(planData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid treatment plan data", details: error.errors });
      }
      console.error("Error creating treatment plan:", error);
      res.status(500).json({ error: "Failed to create treatment plan" });
    }
  });

  app.put("/api/treatment-plans/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getTreatmentPlan(id);
      if (!resource) {
        return res.status(404).json({ error: "Treatment plan not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Sanitize: Remove ownership fields to prevent reassignment
      const { assessmentId, riskScenarioId, ...updateData } = req.body;
      const result = await storage.updateTreatmentPlan(id, updateData);
      res.json(result);
    } catch (error) {
      console.error("Error updating treatment plan:", error);
      res.status(500).json({ error: "Failed to update treatment plan" });
    }
  });

  app.delete("/api/treatment-plans/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getTreatmentPlan(id);
      if (!resource) {
        return res.status(404).json({ error: "Treatment plan not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const deleted = await storage.deleteTreatmentPlan(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting treatment plan:", error);
      res.status(500).json({ error: "Failed to delete treatment plan" });
    }
  });

  app.post("/api/assessments/:id/treatment-plans/bulk", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const { plans } = req.body;
      
      if (!Array.isArray(plans)) {
        return res.status(400).json({ error: "Plans must be an array" });
      }

      const validatedPlans = plans.map(plan => 
        insertTreatmentPlanSchema.parse({ ...plan, assessmentId: id })
      );
      
      const result = await storage.bulkUpsertTreatmentPlans(id, validatedPlans);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid treatment plans data", details: error.errors });
      }
      console.error("Error bulk upserting treatment plans:", error);
      res.status(500).json({ error: "Failed to bulk upsert treatment plans" });
    }
  });

  // Vulnerabilities routes
  app.get("/api/assessments/:id/vulnerabilities", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const vulnerabilities = await storage.getVulnerabilities(id);
      res.json(vulnerabilities);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      res.status(500).json({ error: "Failed to fetch vulnerabilities" });
    }
  });

  app.post("/api/assessments/:id/vulnerabilities", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const vulnerabilityData = insertVulnerabilitySchema.parse({ ...req.body, assessmentId: id });
      const result = await storage.createVulnerability(vulnerabilityData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid vulnerability data", details: error.errors });
      }
      console.error("Error creating vulnerability:", error);
      res.status(500).json({ error: "Failed to create vulnerability" });
    }
  });

  app.put("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getVulnerability(id);
      if (!resource) {
        return res.status(404).json({ error: "Vulnerability not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Sanitize: Remove ownership fields to prevent reassignment
      const { assessmentId, riskScenarioId, ...updateData } = req.body;
      const result = await storage.updateVulnerability(id, updateData);
      res.json(result);
    } catch (error) {
      console.error("Error updating vulnerability:", error);
      res.status(500).json({ error: "Failed to update vulnerability" });
    }
  });

  app.delete("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getVulnerability(id);
      if (!resource) {
        return res.status(404).json({ error: "Vulnerability not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const deleted = await storage.deleteVulnerability(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vulnerability:", error);
      res.status(500).json({ error: "Failed to delete vulnerability" });
    }
  });

  // Controls routes
  app.get("/api/assessments/:id/controls", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const controls = await storage.getControls(id);
      res.json(controls);
    } catch (error) {
      console.error("Error fetching controls:", error);
      res.status(500).json({ error: "Failed to fetch controls" });
    }
  });

  app.post("/api/assessments/:id/controls", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const controlData = insertControlSchema.parse({ ...req.body, assessmentId: id });
      const result = await storage.createControl(controlData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid control data", details: error.errors });
      }
      console.error("Error creating control:", error);
      res.status(500).json({ error: "Failed to create control" });
    }
  });

  app.put("/api/controls/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getControl(id);
      if (!resource) {
        return res.status(404).json({ error: "Control not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Sanitize: Remove ownership fields to prevent reassignment
      const { assessmentId, riskScenarioId, vulnerabilityId, ...updateData } = req.body;
      const result = await storage.updateControl(id, updateData);
      res.json(result);
    } catch (error) {
      console.error("Error updating control:", error);
      res.status(500).json({ error: "Failed to update control" });
    }
  });

  app.delete("/api/controls/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      
      const resource = await storage.getControl(id);
      if (!resource) {
        return res.status(404).json({ error: "Control not found" });
      }

      const assessment = await storage.getAssessment(resource.assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const deleted = await storage.deleteControl(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting control:", error);
      res.status(500).json({ error: "Failed to delete control" });
    }
  });

  // Assessment Questions routes
  app.get("/api/assessments/:id/questions", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const questions = await storage.getAssessmentQuestions(id);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.post("/api/assessments/:id/questions/bulk", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const { questions } = req.body;
      
      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: "Questions must be an array" });
      }

      // Validate each question
      const validatedQuestions = questions.map(q => 
        insertAssessmentQuestionSchema.parse({ ...q, assessmentId: id })
      );
      
      const result = await storage.bulkUpsertQuestions(id, validatedQuestions);
      
      // Update assessment status to risk-assessment when ASIS questions are saved
      await storage.updateAssessment(id, { 
        status: "risk-assessment",
        riskAssessmentCompleted: true,
        riskAssessmentCompletedAt: new Date()
      });
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid question data", details: error.errors });
      }
      console.error("Error saving questions:", error);
      res.status(500).json({ error: "Failed to save questions" });
    }
  });

  // Facility Survey Questions routes
  app.get("/api/assessments/:id/facility-survey-questions", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const questions = await storage.getFacilitySurveyQuestions(id);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching facility survey questions:", error);
      res.status(500).json({ error: "Failed to fetch facility survey questions" });
    }
  });

  app.patch("/api/assessments/:id/facility-survey-questions/:questionId", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { questionId } = req.params;
      const updateData = req.body;
      
      // Sanitize: don't allow changing assessmentId or templateQuestionId
      const { assessmentId, templateQuestionId, ...safeData } = updateData;
      
      const updated = await storage.updateFacilitySurveyQuestion(questionId, safeData);
      
      if (!updated) {
        return res.status(404).json({ error: "Question not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating facility survey question:", error);
      res.status(500).json({ error: "Failed to update question" });
    }
  });

  app.post("/api/assessments/:id/facility-survey-questions", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const questionData = req.body;
      
      const validatedQuestion = insertFacilitySurveyQuestionSchema.parse({ ...questionData, assessmentId: id });
      
      const created = await storage.createFacilitySurveyQuestion(validatedQuestion);
      
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid question data", details: error.errors });
      }
      console.error("Error creating facility survey question:", error);
      res.status(500).json({ error: "Failed to create question" });
    }
  });

  // AI Risk Analysis routes
  app.post("/api/assessments/:id/analyze", verifyAssessmentOwnership, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check tier AI analysis access
      const tier = user.accountTier as AccountTier;
      if (!canUseAIAnalysis(tier)) {
        return res.status(403).json({ 
          error: getUpgradeMessage(tier, "aiAnalysis"),
          needsUpgrade: true 
        });
      }

      const { id } = req.params;
      const assessment = await storage.getAssessmentWithQuestions(id);
      
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Check for enhanced risk assessment data (assets and scenarios)
      const hasEnhancedData = assessment.riskAssets && assessment.riskAssets.length > 0 && 
                              assessment.riskScenarios && assessment.riskScenarios.length > 0;
      
      // Check for legacy facility survey questions
      const hasLegacyData = assessment.questions && assessment.questions.length > 0;

      if (!hasEnhancedData && !hasLegacyData) {
        return res.status(400).json({ 
          error: "Assessment has no data to analyze. Please complete either the facility survey or the enhanced risk assessment." 
        });
      }

      // Generate AI analysis
      const analysis = await openaiService.analyzeSecurityRisks(assessment);
      
      // Save risk insights to storage
      const savedInsights = await storage.bulkCreateRiskInsights(analysis.insights);
      
      // Calculate risk level based on insights
      const criticalCount = savedInsights.filter(i => i.severity === "critical").length;
      const highCount = savedInsights.filter(i => i.severity === "high").length;
      
      let riskLevel = "low";
      if (criticalCount > 0) riskLevel = "critical";
      else if (highCount > 2) riskLevel = "high";
      else if (highCount > 0 || savedInsights.filter(i => i.severity === "medium").length > 3) riskLevel = "medium";
      
      // Update assessment with risk level and completed status
      await storage.updateAssessment(id, { 
        riskLevel,
        status: "completed",
        completedAt: new Date()
      });

      res.json({
        overallRiskScore: analysis.overallRiskScore,
        riskLevel,
        insights: savedInsights,
        executiveSummary: analysis.executiveSummary
      });
    } catch (error) {
      console.error("Error analyzing assessment:", error);
      res.status(500).json({ error: "Failed to analyze assessment" });
    }
  });

  app.get("/api/assessments/:id/insights", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const insights = await storage.getRiskInsights(id);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // Reports routes
  app.get("/api/assessments/:id/reports", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const reports = await storage.getReports(id);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/assessments/:id/reports", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const { type, title, format } = req.body;
      
      if (!type || !title || !format) {
        return res.status(400).json({ error: "Type, title, and format are required" });
      }

      const assessment = await storage.getAssessmentWithQuestions(id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Create report record
      const reportData = insertReportSchema.parse({
        assessmentId: id,
        type,
        title,
        format,
        status: "generating"
      });

      const report = await storage.createReport(reportData);

      // Generate report content asynchronously
      try {
        const content = await openaiService.generateReportContent(assessment, type);
        
        // Update report with generated content
        await storage.updateReport(report.id, {
          status: "ready",
          generatedAt: new Date(),
          filePath: `/reports/${report.id}.${format}`,
          fileSize: `${Math.round(content.length / 1024)}KB`
        });

        const updatedReport = await storage.getReport(report.id);
        res.status(201).json(updatedReport);
      } catch (error) {
        await storage.updateReport(report.id, { status: "error" });
        throw error;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid report data", details: error.errors });
      }
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.get("/api/reports/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (report.status !== "ready") {
        return res.status(400).json({ error: "Report is not ready for download" });
      }

      // In a real implementation, you would serve the actual file
      // For now, return report metadata
      res.json({
        id: report.id,
        title: report.title,
        format: report.format,
        downloadUrl: `/api/reports/${id}/download`,
        message: "Report download would be available here"
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      res.status(500).json({ error: "Failed to download report" });
    }
  });

  // Evidence Upload/Download/Delete routes
  app.post("/api/assessments/:id/evidence", verifyAssessmentOwnership, upload.fields([{ name: 'photo', maxCount: 1 }]), async (req, res) => {
    try {
      const { questionId, questionType } = req.body;
      
      if (!questionId || !questionType) {
        return res.status(400).json({ error: "questionId and questionType are required" });
      }

      if (!['facility', 'assessment'].includes(questionType)) {
        return res.status(400).json({ error: "questionType must be 'facility' or 'assessment'" });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!files || !files.photo || files.photo.length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = files.photo[0];
      const assessmentId = req.params.id;
      const objectStorageService = new ObjectStorageService();
      
      const evidencePath = await objectStorageService.uploadEvidence(
        file.buffer,
        file.originalname,
        assessmentId,
        questionId
      );

      if (questionType === 'facility') {
        const question = await storage.getFacilitySurveyQuestion(questionId);
        if (!question || question.assessmentId !== assessmentId) {
          await objectStorageService.deleteEvidence(evidencePath);
          return res.status(404).json({ error: "Question not found" });
        }

        const currentEvidence = question.evidence || [];
        if (currentEvidence.length >= 10) {
          await objectStorageService.deleteEvidence(evidencePath);
          return res.status(400).json({ error: "Maximum 10 evidence photos per question" });
        }

        const updatedQuestion = await storage.appendFacilityQuestionEvidence(questionId, evidencePath);
        
        if (!updatedQuestion) {
          await objectStorageService.deleteEvidence(evidencePath);
          return res.status(500).json({ error: "Failed to update question" });
        }
      } else {
        const question = await storage.getAssessmentQuestion(questionId);
        if (!question || question.assessmentId !== assessmentId) {
          await objectStorageService.deleteEvidence(evidencePath);
          return res.status(404).json({ error: "Question not found" });
        }

        const currentEvidence = question.evidence || [];
        if (currentEvidence.length >= 10) {
          await objectStorageService.deleteEvidence(evidencePath);
          return res.status(400).json({ error: "Maximum 10 evidence photos per question" });
        }

        const updatedQuestion = await storage.appendAssessmentQuestionEvidence(questionId, evidencePath);
        
        if (!updatedQuestion) {
          await objectStorageService.deleteEvidence(evidencePath);
          return res.status(500).json({ error: "Failed to update question" });
        }
      }

      res.json({
        success: true,
        evidencePath,
        filename: file.originalname
      });
    } catch (error: any) {
      console.error("Error uploading evidence:", error);
      if (error.message === 'Only image files are allowed') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to upload evidence" });
    }
  });

  app.get("/evidence/:path(*)", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const evidencePath = `/evidence/${req.params.path}`;
      const objectStorageService = new ObjectStorageService();
      
      const file = await objectStorageService.getEvidenceFile(evidencePath);
      const [metadata] = await file.getMetadata();
      
      const assessmentId = metadata.metadata?.assessmentId as string | undefined;
      if (!assessmentId) {
        return res.status(404).json({ error: "Evidence not found" });
      }

      const assessment = await storage.getAssessment(assessmentId);
      if (!assessment || assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await objectStorageService.downloadEvidence(file, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Evidence not found" });
      }
      console.error("Error downloading evidence:", error);
      res.status(500).json({ error: "Failed to download evidence" });
    }
  });

  app.delete("/api/assessments/:id/evidence", verifyAssessmentOwnership, async (req, res) => {
    try {
      const { questionId, questionType, evidencePath } = req.body;
      
      if (!questionId || !questionType || !evidencePath) {
        return res.status(400).json({ error: "questionId, questionType, and evidencePath are required" });
      }

      if (!['facility', 'assessment'].includes(questionType)) {
        return res.status(400).json({ error: "questionType must be 'facility' or 'assessment'" });
      }

      const assessmentId = req.params.id;

      if (questionType === 'facility') {
        const question = await storage.getFacilitySurveyQuestion(questionId);
        if (!question || question.assessmentId !== assessmentId) {
          return res.status(404).json({ error: "Question not found" });
        }

        const currentEvidence = question.evidence || [];
        const updatedEvidence = currentEvidence.filter(e => e !== evidencePath);
        
        await storage.updateFacilitySurveyQuestion(questionId, {
          evidence: updatedEvidence
        });
      } else {
        const question = await storage.getAssessmentQuestion(questionId);
        if (!question || question.assessmentId !== assessmentId) {
          return res.status(404).json({ error: "Question not found" });
        }

        const currentEvidence = question.evidence || [];
        const updatedEvidence = currentEvidence.filter(e => e !== evidencePath);
        
        await storage.updateAssessmentQuestion(questionId, {
          evidence: updatedEvidence
        });
      }

      const objectStorageService = new ObjectStorageService();
      await objectStorageService.deleteEvidence(evidencePath);

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting evidence:", error);
      res.status(500).json({ error: "Failed to delete evidence" });
    }
  });

  // Statistics/Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const assessments = await storage.getAllAssessments(userId);
      
      const stats = {
        totalAssessments: assessments.length,
        activeAssessments: assessments.filter(a => a.status === "in-progress").length,
        completedThisMonth: assessments.filter(a => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return a.status === "completed" && 
                 a.completedAt && 
                 new Date(a.completedAt) > monthAgo;
        }).length,
        averageRiskScore: assessments.length > 0 ? 
          assessments.reduce((sum, a) => {
            const score = a.riskLevel === "critical" ? 9 : 
                         a.riskLevel === "high" ? 7 :
                         a.riskLevel === "medium" ? 5 : 3;
            return sum + score;
          }, 0) / assessments.length : 0,
        riskDistribution: {
          low: assessments.filter(a => a.riskLevel === "low").length,
          medium: assessments.filter(a => a.riskLevel === "medium").length,
          high: assessments.filter(a => a.riskLevel === "high").length,
          critical: assessments.filter(a => a.riskLevel === "critical").length
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
