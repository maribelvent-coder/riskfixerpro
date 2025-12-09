import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./openai-service";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import multer from "multer";
import { db } from "./db";
import { assessments, riskScenarios } from "@shared/schema";
import { TenantStorage } from "./tenant-storage";
import {
  attachTenantContext,
  requireOrganizationPermission,
  requireTenantContext,
} from "./tenantMiddleware";
import { eq, and, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
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
  type InsertAssessmentQuestion,
} from "@shared/schema";
import {
  canCreateAssessment,
  canCreateSite,
  canUseAIAnalysis,
  getUpgradeMessage,
  getOrganizationTierLimits,
  type AccountTier,
} from "@shared/tierLimits";
import {
  getSurveyParadigmFromTemplate,
  ASSESSMENT_TEMPLATES,
} from "@shared/templates";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { emailService } from "./emailService";
import { sendInvitationEmail } from "./services/email";
import { registerGeoIntelRoutes } from "./routes/geoIntelRoutes.js";
import { generateAssessmentReport } from "./services/reporting/pdf-generator";

// Manufacturing Assessment Imports
import {
  MANUFACTURING_INTERVIEW_QUESTIONS,
  MANUFACTURING_SECTION_METADATA,
  MANUFACTURING_SECTIONS,
  MANUFACTURING_ZONES,
  getQuestionsBySection,
  getQuestionById,
  getAllQuestionsFlattened,
  getQuestionnaireStats,
  getAIContextPrompt,
} from "./services/manufacturing-interview-questionnaire";

import {
  calculateVulnerabilityFromInterview,
  calculateThreatLikelihoodFromInterview,
  calculateImpactFromInterview,
  calculateOverallSecurityScore,
  generateControlRecommendations,
  getPrioritizedControlRecommendations,
  calculateRiskForThreat,
  initializeRiskScenariosFromInterview,
  MANUFACTURING_THREATS,
  THREAT_CONTROL_MAPPING,
  QUESTION_THREAT_MAPPING,
} from "./services/manufacturing-interview-mapper";

import {
  generateManufacturingRiskScenariosWithAI,
  assessSingleManufacturingThreat,
  generateManufacturingNarrative,
} from "./services/manufacturing-ai-risk-assessment";

// Executive Protection Assessment Imports
import {
  calculateVulnerability as calculateEPVulnerability,
  calculateThreatLikelihood as calculateEPThreatLikelihood,
  calculateImpact as calculateEPImpact,
  calculateExposureFactor,
  calculateThreatRisk as calculateEPThreatRisk,
  generateEPRiskScenarios,
  generateControlRecommendations as generateEPControlRecommendations,
  EP_THREATS,
  EP_THREAT_CONTROL_MAPPING,
} from "./services/ep-interview-mapper";

// Retail Controls & ROI Calculator Imports
import {
  generateControlRecommendations as generateRetailControlRecommendations,
  calculateControlROI,
  getApplicableControls,
  getControlsForThreat,
  RETAIL_CONTROLS,
  type StoreProfile,
  type ThreatAssessment,
  type SurveyResponses,
} from "./services/retail-controls";

// Retail AI Risk Assessment Imports
import {
  generateRetailRiskScenariosWithAI,
  assessSingleRetailThreat,
  generateRetailNarrativeSummary,
  RETAIL_STORE_THREATS,
} from "./services/retail-ai-risk-assessment";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
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
      userId?: string;
    }
  }
}

// Middleware to verify assessment ownership or organization access (using TenantStorage)
async function verifyAssessmentOwnership(req: any, res: any, next: any) {
  try {
    // Check for auth error first (invalid JWT)
    if (req.authError) {
      return res
        .status(401)
        .json({
          error: "Authentication failed",
          details: req.authError.message,
        });
    }

    // Check for missing user (not authenticated at all)
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Use tenant context from attachTenantContext middleware
    if (!req.organizationId) {
      return res.status(403).json({
        error: "Organization context required",
        code: "ONBOARDING_REQUIRED",
        message: "Please complete onboarding to access this resource",
      });
    }

    const assessmentId = req.params.id;
    const tenantStorage = new TenantStorage(db as any, req.organizationId);
    const assessment = await tenantStorage.getAssessment(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Assessment found means it belongs to the tenant (TenantStorage enforces this)
    req.assessment = assessment;
    return next();
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

// Middleware to verify site ownership or organization access (using TenantStorage)
async function verifySiteOwnership(req: any, res: any, next: any) {
  try {
    // Check for auth error first (invalid JWT)
    if (req.authError) {
      return res
        .status(401)
        .json({
          error: "Authentication failed",
          details: req.authError.message,
        });
    }

    // Check for missing user (not authenticated at all)
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Use tenant context from attachTenantContext middleware
    if (!req.organizationId) {
      return res.status(403).json({
        error: "Organization context required",
        code: "ONBOARDING_REQUIRED",
        message: "Please complete onboarding to access this resource",
      });
    }

    // Support both :id and :siteId parameter names
    const siteId = req.params.id || req.params.siteId;
    const tenantStorage = new TenantStorage(db as any, req.organizationId);
    const site = await tenantStorage.getSite(siteId);

    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Site found means it belongs to the tenant (TenantStorage enforces this)
    req.site = site;
    return next();
  } catch (error) {
    console.error("Error verifying site ownership:", error);
    res.status(500).json({ error: "Failed to verify access" });
  }
}

// Startup backfill: Ensure all users have organizations (migrates legacy data)
async function backfillUserOrganizations(): Promise<void> {
  try {
    const allUsers = await storage.getAllUsers();
    const orphanedUsers = allUsers.filter(u => !u.organizationId);
    
    if (orphanedUsers.length === 0) {
      console.log('✅ All users have organizations - no backfill needed');
      return;
    }
    
    console.log(`⚠️ Found ${orphanedUsers.length} users without organizations, backfilling...`);
    
    for (const user of orphanedUsers) {
      try {
        // Create personal organization
        const org = await storage.createOrganization({
          name: `${user.username}'s Workspace`,
          ownerId: user.id,
          accountTier: 'free',
          maxMembers: 1,
          maxSites: 3,
          maxAssessments: 5,
        });
        
        // Link user to organization
        await storage.addUserToOrganization(user.id, org.id, 'owner');
        console.log(`  ✅ Created organization for user: ${user.username}`);
      } catch (backfillError) {
        console.error(`  ❌ Failed to create organization for user ${user.username}:`, backfillError);
      }
    }
    
    console.log('✅ User organization backfill complete');
  } catch (error) {
    console.error('Error during user organization backfill:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Startup: Ensure all users have organizations (backfills legacy data)
  await backfillUserOrganizations();
  
  // Register Geographic Intelligence routes
  registerGeoIntelRoutes(app, storage);

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const signupSchema = insertUserSchema
        .extend({
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });

      const validatedData = signupSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(
        validatedData.username,
      );
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

      // Auto-create personal organization for new user (REQUIRED for proper multi-tenant access)
      // Note: Neon HTTP driver doesn't support transactions, so we implement manual rollback
      let organization;
      try {
        // Create personal organization
        organization = await storage.createOrganization({
          name: `${validatedData.username}'s Workspace`,
          ownerId: user.id,
          accountTier: 'free',
          maxMembers: 1,      // Free tier: solo workspace
          maxSites: 3,        // Free tier limits
          maxAssessments: 5,  // Free tier limits
        });

        // Link user to organization as owner
        await storage.addUserToOrganization(user.id, organization.id, 'owner');
        
        console.log(`✅ Auto-created organization ${organization.id} for new user ${user.username}`);
        
        // Update the user object with organization info for the response
        user.organizationId = organization.id;
        user.organizationRole = 'owner';
      } catch (orgError) {
        // Manual rollback: clean up in reverse order (org first, then user) to respect FK constraints
        console.error('Organization setup failed, rolling back:', orgError);
        
        // Step 1: Delete organization if it was created (before deleting user due to FK constraint)
        if (organization) {
          try {
            await storage.deleteOrganization(organization.id);
            console.log(`Rolled back organization ${organization.id}`);
          } catch (deleteOrgError) {
            console.error('Failed to rollback organization:', deleteOrgError);
          }
        }
        
        // Step 2: Delete the user
        try {
          await storage.deleteUser(user.id);
          console.log(`Rolled back user ${user.id} due to organization creation failure`);
        } catch (deleteUserError) {
          console.error('Failed to rollback user creation:', deleteUserError);
        }
        
        return res.status(500).json({ error: "Failed to complete account setup. Please try again." });
      }

      // Set session (auto-login after signup)
      req.session.userId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error during signup:", err);
            reject(err);
          } else {
            console.log("✅ Session created for new user:", user.username);
            resolve();
          }
        });
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.SESSION_SECRET!, {
        expiresIn: "7d",
      });

      // Return user without password + token
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ ...userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error during signup:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Development-only bypass auth endpoint for QA testing
  if (process.env.NODE_ENV === "development") {
    // HTML page that sets session and redirects to app
    app.get("/api/bypass", async (req, res) => {
      try {
        const user = await storage.getUserByUsername("mcadmin");
        if (!user) {
          return res.status(404).send("mcadmin user not found");
        }

        req.session.userId = user.id;

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).send("Failed to save session");
          }

          console.log("🧪 DEV: Bypass auth for mcadmin, userId:", user.id);

          // Return HTML that redirects to /app
          res.send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Auth Bypass</title>
                <meta http-equiv="refresh" content="1;url=/app">
              </head>
              <body style="font-family: system-ui; padding: 40px; background: #1a1a1a; color: #fff;">
                <h2>✅ Session Created</h2>
                <p>Logged in as: <strong>mcadmin</strong></p>
                <p>User ID: ${user.id}</p>
                <p>Redirecting to <a href="/app" style="color: #4ade80;">/app</a> in 1 second...</p>
                <script>setTimeout(() => window.location.href = '/app', 1000);</script>
              </body>
            </html>
          `);
        });
      } catch (error) {
        console.error("Bypass auth error:", error);
        res.status(500).send("Failed to create session");
      }
    });

    // Simple POST test endpoint - no auth, no session
    app.post("/api/test-post", (req, res) => {
      console.log("🧪 TEST POST received:", JSON.stringify(req.body));
      res.json({
        success: true,
        received: req.body,
        timestamp: new Date().toISOString(),
      });
    });

    // JSON API endpoint
    app.get("/api/test-session", async (req, res) => {
      try {
        const user = await storage.getUserByUsername("mcadmin");
        if (!user) {
          return res.status(404).json({ error: "mcadmin user not found" });
        }

        req.session.userId = user.id;

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ error: "Failed to save session" });
          }

          console.log(
            "🧪 DEV: Test session created for mcadmin, userId:",
            user.id,
          );
          res.json({
            success: true,
            message: "Test session created for mcadmin",
            userId: user.id,
            sessionId: req.sessionID,
          });
        });
      } catch (error) {
        console.error("Test session error:", error);
        res.status(500).json({ error: "Failed to create test session" });
      }
    });
  }

  // Session-based auth check endpoint
  app.get("/api/auth/me", async (req, res) => {
    try {
      // Use session-based auth
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(401).json({ error: "Invalid or expired session" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🔐 LOGIN ATTEMPT - Step 1: Request received");
    console.log("   📥 Body:", JSON.stringify(req.body));
    console.log("   📥 Content-Type:", req.headers["content-type"]);
    console.log("   📥 Origin:", req.headers["origin"]);
    console.log(
      "   📥 User-Agent:",
      req.headers["user-agent"]?.substring(0, 50),
    );

    try {
      // Step 2: Validate input
      console.log("🔐 LOGIN - Step 2: Validating input schema...");
      const loginSchema = z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
      });

      const validatedData = loginSchema.parse(req.body);
      console.log(
        "   ✅ Schema validation passed for username:",
        validatedData.username,
      );

      // Step 3: Find user by username
      console.log("🔐 LOGIN - Step 3: Looking up user in database...");
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        console.log("   ❌ User not found:", validatedData.username);
        return res.status(401).json({ error: "Invalid username or password" });
      }
      console.log("   ✅ User found:", user.id, user.username);

      // Step 4: Verify password
      console.log("🔐 LOGIN - Step 4: Verifying password with bcrypt...");
      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        user.password,
      );
      if (!isValidPassword) {
        console.log("   ❌ Password mismatch for user:", user.username);
        return res.status(401).json({ error: "Invalid username or password" });
      }
      console.log("   ✅ Password verified successfully");

      // Step 5: Set session userId
      console.log("🔐 LOGIN - Step 5: Setting session...");
      console.log("   Session ID before:", req.sessionID);
      console.log("   Session exists:", !!req.session);
      req.session.userId = user.id;
      console.log("   ✅ Session userId set:", req.session.userId);

      // Step 6: Session save check
      console.log("🔐 LOGIN - Step 6: Saving session...");
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.log("   ❌ Session save error:", err);
            reject(err);
          } else {
            console.log("   ✅ Session saved successfully");
            resolve();
          }
        });
      });

      // Step 7: Generate JWT token
      console.log("🔐 LOGIN - Step 7: Generating JWT token...");
      const token = jwt.sign({ userId: user.id }, process.env.SESSION_SECRET!, {
        expiresIn: "7d",
      });
      console.log("   ✅ JWT token generated");

      // Step 8: Send response
      console.log("🔐 LOGIN - Step 8: Sending success response...");
      const { password, ...userWithoutPassword } = user;
      console.log(
        "   Response payload:",
        JSON.stringify({ ...userWithoutPassword, token: "[REDACTED]" }),
      );
      console.log(
        "═══════════════════════════════════════════════════════════",
      );
      res.json({ ...userWithoutPassword, token });
    } catch (error) {
      console.log(
        "═══════════════════════════════════════════════════════════",
      );
      console.log("🔐 LOGIN - ❌ EXCEPTION CAUGHT");
      if (error instanceof z.ZodError) {
        console.log("   Error type: Zod validation error");
        console.log("   Details:", JSON.stringify(error.errors));
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("   Error type:", error?.constructor?.name);
      console.error(
        "   Error message:",
        error instanceof Error ? error.message : String(error),
      );
      console.error(
        "   Error stack:",
        error instanceof Error ? error.stack : "No stack",
      );
      console.log(
        "═══════════════════════════════════════════════════════════",
      );
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }

        res.clearCookie("connect.sid", {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

        return res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "No active session" });
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
        message:
          "If an account with that email exists, a password reset link has been sent.",
      };

      if (user) {
        // Invalidate any existing unused tokens for this user
        await storage.invalidateUserPasswordResetTokens(user.id);

        // Generate random token (unhashed)
        const token = randomBytes(32).toString("hex");
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
        console.log(
          `Password reset token for ${validatedData.email}: ${token}`,
        );
        console.log(
          `Reset link: ${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : "http://localhost:5000"}/reset-password?token=${token}`,
        );
        console.log(`Expires at: ${expiresAt}`);
      }

      // Always return the same response
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
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
        newPassword: z
          .string()
          .min(8, "Password must be at least 8 characters"),
      });

      const validatedData = resetSchema.parse(req.body);

      // Get all valid (unused, unexpired) tokens for verification
      const validTokens = await storage.getValidPasswordResetTokens();

      // Find a matching token by comparing hashes
      let matchedToken = null;
      for (const storedToken of validTokens) {
        const isMatch = await bcrypt.compare(
          validatedData.token,
          storedToken.token,
        );
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
        return res
          .status(400)
          .json({ error: "This token has already been used" });
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
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Accept invitation - create account and join organization (public route)
  app.post("/api/auth/accept-invite", async (req, res) => {
    try {
      const acceptInviteSchema = z.object({
        token: z.string().min(1, "Token is required"),
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        email: z.string().email("Please enter a valid email address"),
      });

      const validatedData = acceptInviteSchema.parse(req.body);

      // Get invitation by token
      const invitation = await storage.getInvitationByToken(
        validatedData.token,
      );

      if (!invitation) {
        return res.status(400).json({ error: "Invalid invitation token" });
      }

      // Check if invitation is pending
      if (invitation.status !== "pending") {
        return res
          .status(400)
          .json({ error: "This invitation has already been used" });
      }

      // Check if invitation is expired
      if (new Date() > new Date(invitation.expiresAt)) {
        return res.status(400).json({ error: "This invitation has expired" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(
        validatedData.username,
      );
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create new user
      const newUser = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
      });

      // Accept invitation (updates user's organizationId and organizationRole, marks invitation as accepted)
      await storage.acceptInvitation(validatedData.token, newUser.id);

      // Get updated user with organization info
      const updatedUser = await storage.getUser(newUser.id);

      // Create session for the new user
      req.session.userId = newUser.id;

      // Return user without password
      if (updatedUser) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(201).json(userWithoutPassword);
      } else {
        res
          .status(201)
          .json({ message: "Account created and invitation accepted" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error accepting invitation:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.SESSION_SECRET!) as {
          userId: string;
        };

        const user = await storage.getUser(decoded.userId);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError);
        return res.status(401).json({ error: "Invalid or expired token" });
      }
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
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
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
        return res
          .status(400)
          .json({ error: "You are already in an organization" });
      }

      // Only paid tier users (basic, pro, enterprise) can create organizations
      const validTiers = ["basic", "pro", "enterprise"];
      if (!validTiers.includes(user.accountTier)) {
        return res.status(403).json({
          error:
            "You need a Basic, Pro, or Enterprise account to create an organization",
          needsUpgrade: true,
        });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Organization name is required" });
      }

      // Inherit organization tier from user's account tier
      // Apply tier-based limits from pricing page
      const orgTier = user.accountTier as "basic" | "pro" | "enterprise";
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
      await storage.addUserToOrganization(user.id, organization.id, "owner");

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
      if (user.organizationRole !== "owner") {
        return res
          .status(403)
          .json({ error: "Only organization owners can update settings" });
      }

      // Validate and whitelist allowed fields (only safe fields - tier changes require admin/payment)
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
      });

      const validatedData = updateSchema.parse(req.body);

      // Note: accountTier changes must be done through admin panel or payment flow

      const updated = await storage.updateOrganization(
        req.params.id,
        validatedData,
      );
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid update data", details: error.errors });
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
      if (user.organizationRole !== "owner") {
        return res.status(403).json({
          error: "Only organization owners can delete the organization",
        });
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

  // Organization Invite - uses tenant context from middleware
  app.post(
    "/api/organization/invite",
    requireOrganizationPermission,
    async (req: any, res) => {
      try {
        const user = req.user;
        const organizationId = req.organizationId;

        // Only owners and admins can invite
        if (
          user.organizationRole !== "owner" &&
          user.organizationRole !== "admin"
        ) {
          return res
            .status(403)
            .json({ error: "Only owners and admins can invite members" });
        }

        const inviteSchema = z.object({
          email: z.string().email("Please enter a valid email address"),
          role: z.enum(["member", "admin"]).default("member"),
        });

        const validatedData = inviteSchema.parse(req.body);

        // Cannot invite owners
        if (validatedData.role === "owner") {
          return res
            .status(400)
            .json({ error: "Cannot invite users as owners" });
        }

        // Check if user already exists in this organization
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.organizationId === organizationId) {
          return res
            .status(400)
            .json({ error: "User is already a member of this organization" });
        }

        // Check for existing pending invitation
        const existingInvitations =
          await storage.listOrganizationInvitations(organizationId);
        const pendingInvite = existingInvitations.find(
          (inv) =>
            inv.email === validatedData.email && inv.status === "pending",
        );
        if (pendingInvite) {
          return res
            .status(400)
            .json({ error: "Invitation already sent to this email" });
        }

        // Generate cryptographically strong token
        const token = randomBytes(32).toString("hex");

        // Set expiration to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await storage.createInvitation({
          organizationId,
          email: validatedData.email,
          role: validatedData.role,
          invitedBy: user.id,
          status: "pending",
          token,
          expiresAt,
        });

        // Send invitation email using the new simple email service
        await sendInvitationEmail(validatedData.email, token);

        // Return invitation without token for security
        const { token: _token, ...safeInvitation } = invitation;
        res.status(201).json(safeInvitation);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid data", details: error.errors });
        }
        console.error("Error creating invitation:", error);
        res.status(500).json({ error: "Failed to create invitation" });
      }
    },
  );

  // Get organization invitations - uses tenant context from middleware
  app.get(
    "/api/organization/invites",
    requireOrganizationPermission,
    async (req: any, res) => {
      try {
        const organizationId = req.organizationId;

        const invitations =
          await storage.listOrganizationInvitations(organizationId);

        // Exclude token field for security
        const safeInvitations = invitations.map(
          ({ token, ...invitation }) => invitation,
        );

        res.json(safeInvitations);
      } catch (error) {
        console.error("Error fetching invitations:", error);
        res.status(500).json({ error: "Failed to fetch invitations" });
      }
    },
  );

  // Get organization members - uses tenant context from middleware
  app.get(
    "/api/organization/members",
    requireOrganizationPermission,
    async (req: any, res) => {
      try {
        const organizationId = req.organizationId;

        const members = await storage.getOrganizationMembers(organizationId);

        // Exclude password field for security
        const safeMembers = members.map(({ password, ...member }) => member);

        res.json(safeMembers);
      } catch (error) {
        console.error("Error fetching organization members:", error);
        res.status(500).json({ error: "Failed to fetch organization members" });
      }
    },
  );

  // Organization Invitation Routes (Legacy - uses session and :id param)
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
      if (
        user.organizationRole !== "owner" &&
        user.organizationRole !== "admin"
      ) {
        return res
          .status(403)
          .json({ error: "Only owners and admins can invite members" });
      }

      const { email, role } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Cannot invite owners
      if (role === "owner") {
        return res.status(400).json({ error: "Cannot invite users as owners" });
      }

      // Check if user already exists in this organization
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.organizationId === req.params.id) {
        return res
          .status(400)
          .json({ error: "User is already a member of this organization" });
      }

      // Check for existing pending invitation
      const existingInvitations = await storage.listOrganizationInvitations(
        req.params.id,
      );
      const pendingInvite = existingInvitations.find(
        (inv) => inv.email === email && inv.status === "pending",
      );
      if (pendingInvite) {
        return res
          .status(400)
          .json({ error: "Invitation already sent to this email" });
      }

      // Generate cryptographically strong token
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");

      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await storage.createInvitation({
        organizationId: req.params.id,
        email,
        role: role || "member",
        invitedBy: user.id,
        status: "pending",
        token,
        expiresAt,
      });

      // Send invitation email
      const organization = await storage.getOrganization(req.params.id);
      if (organization) {
        await emailService
          .sendInvitationEmail({
            email,
            organizationName: organization.name,
            inviterName: user.username,
            role: invitation.role,
            token,
            expiresAt,
          })
          .catch((err) => {
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
      if (
        user.organizationRole !== "owner" &&
        user.organizationRole !== "admin"
      ) {
        return res
          .status(403)
          .json({ error: "Only owners and admins can view invitations" });
      }

      const invitations = await storage.listOrganizationInvitations(
        req.params.id,
      );

      // Filter out sensitive token data from response
      const safeInvitations = invitations.map((inv) => ({
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
        return res
          .status(400)
          .json({ error: "You are already in an organization" });
      }

      const invitation = await storage.getInvitationByToken(req.params.token);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }

      if (invitation.status !== "pending") {
        return res.status(400).json({ error: "Invitation is no longer valid" });
      }

      if (new Date() > new Date(invitation.expiresAt)) {
        return res.status(400).json({ error: "Invitation has expired" });
      }

      // Verify email matches (if user has email set)
      if (user.email && user.email !== invitation.email) {
        return res.status(403).json({
          error: "This invitation was sent to a different email address",
        });
      }

      // Add user to organization
      await storage.addUserToOrganization(
        user.id,
        invitation.organizationId,
        invitation.role,
      );

      // Mark invitation as accepted
      await storage.updateInvitation(invitation.id, {
        status: "accepted",
        acceptedAt: new Date(),
      });

      const organization = await storage.getOrganization(
        invitation.organizationId,
      );
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
      if (
        user.organizationRole !== "owner" &&
        user.organizationRole !== "admin"
      ) {
        return res
          .status(403)
          .json({ error: "Only owners and admins can revoke invitations" });
      }

      // Mark as revoked instead of deleting (for audit trail)
      await storage.updateInvitation(req.params.id, { status: "revoked" });

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
      const membersWithoutPasswords = members.map(
        ({ password, ...member }) => member,
      );
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
      if (memberId && typeof memberId === "string") {
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

  app.post(
    "/api/admin/users/:id/reset-password",
    verifyAdminAccess,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
          return res
            .status(400)
            .json({ error: "Password must be at least 8 characters" });
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
    },
  );

  app.post("/api/admin/users/:id/tier", verifyAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const { accountTier } = req.body;

      const validTiers = ["free", "basic", "pro", "enterprise"];
      if (!accountTier || !validTiers.includes(accountTier)) {
        return res.status(400).json({
          error:
            "Invalid account tier. Must be one of: free, basic, pro, enterprise",
        });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // If downgrading to free tier, validate organization constraints BEFORE updating
      if (accountTier === "free" && user.organizationId) {
        // Check if user is the organization owner
        const org = await storage.getOrganization(user.organizationId);
        if (org && org.ownerId === id) {
          // Cannot downgrade organization owner to free tier
          return res.status(400).json({
            error:
              "Cannot downgrade organization owner to free tier. Please transfer ownership or delete the organization first.",
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

  app.patch(
    "/api/admin/organizations/:id/limits",
    verifyAdminAccess,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { maxMembers, maxSites, maxAssessments } = req.body;

        const organization = await storage.getOrganization(id);
        if (!organization) {
          return res.status(404).json({ error: "Organization not found" });
        }

        // Validate inputs
        if (
          maxMembers !== undefined &&
          (typeof maxMembers !== "number" || maxMembers < -1)
        ) {
          return res
            .status(400)
            .json({ error: "maxMembers must be a number >= -1" });
        }
        if (
          maxSites !== undefined &&
          (typeof maxSites !== "number" || maxSites < -1)
        ) {
          return res
            .status(400)
            .json({ error: "maxSites must be a number >= -1" });
        }
        if (
          maxAssessments !== undefined &&
          (typeof maxAssessments !== "number" || maxAssessments < -1)
        ) {
          return res
            .status(400)
            .json({ error: "maxAssessments must be a number >= -1" });
        }

        // Update organization limits
        const updateData: Partial<typeof organization> = {};
        if (maxMembers !== undefined) updateData.maxMembers = maxMembers;
        if (maxSites !== undefined) updateData.maxSites = maxSites;
        if (maxAssessments !== undefined)
          updateData.maxAssessments = maxAssessments;

        const updated = await storage.updateOrganization(id, updateData);
        res.json(updated);
      } catch (error) {
        console.error("Error updating organization limits:", error);
        res.status(500).json({ error: "Failed to update organization limits" });
      }
    },
  );

  app.post(
    "/api/admin/seed-production",
    verifyAdminAccess,
    async (req, res) => {
      try {
        console.log("🌱 Starting production database seeding...");
        console.log(
          "⚠️  WARNING: This will replace existing template questions",
        );

        const results = {
          interviewQuestions: 0,
          executiveSurveyQuestions: 0,
          errors: [] as string[],
          warnings: [] as string[],
        };

        // Import seed functions
        const { seedInterviewQuestions } = await import(
          "./seed-interview-questions"
        );
        const { seedExecutiveSurveyQuestions } = await import(
          "./seed-executive-questions"
        );

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
            results.warnings.push(
              "Deleted associated facility survey data as part of template cleanup",
            );
          }
        } catch (error) {
          const errorMsg = `Executive survey questions failed: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`❌ ${errorMsg}`);
          results.errors.push(errorMsg);
        }

        const totalSuccess =
          results.interviewQuestions + results.executiveSurveyQuestions;
        console.log(
          `🎉 Production database seeding complete! Total: ${totalSuccess} questions`,
        );

        res.json({
          message:
            results.errors.length === 0
              ? "Database seeded successfully"
              : `Partial success: ${results.errors.length} error(s) occurred`,
          results,
        });
      } catch (error) {
        console.error("Error seeding production database:", error);
        res.status(500).json({
          error: "Failed to seed database",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

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

  // Site routes (tenant-scoped)
  app.get("/api/sites", requireOrganizationPermission, async (req, res) => {
    try {
      const tenantStorage = new TenantStorage(db as any, req.organizationId!);
      const sites = await tenantStorage.getAllSites();
      res.json(sites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });

  app.get("/api/sites/:id", requireOrganizationPermission, async (req, res) => {
    try {
      const tenantStorage = new TenantStorage(db as any, req.organizationId!);
      const site = await tenantStorage.getSite(req.params.id);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      console.error("Error fetching site:", error);
      res.status(500).json({ error: "Failed to fetch site" });
    }
  });

  app.post("/api/sites", requireOrganizationPermission, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Check tier site limit
      const tenantStorage = new TenantStorage(db as any, req.organizationId!);
      const existingSites = await tenantStorage.getAllSites();
      const tier = req.accountTier as AccountTier;

      if (!canCreateSite(tier, existingSites.length)) {
        return res.status(403).json({
          error: getUpgradeMessage(tier, "site"),
          needsUpgrade: true,
        });
      }

      // Sanitize: Remove organizationId from request body to prevent tampering
      const { organizationId: _, ...bodyData } = req.body;

      const validatedData = insertSiteSchema.parse({
        ...bodyData,
        userId,
      });

      const site = await tenantStorage.createSite(validatedData);
      res.status(201).json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating site:", error);
      res.status(500).json({ error: "Failed to create site" });
    }
  });

  app.put("/api/sites/:id", requireOrganizationPermission, async (req, res) => {
    try {
      const { id } = req.params;
      const tenantStorage = new TenantStorage(db as any, req.organizationId!);

      // Sanitize: Remove ownership fields from update payload to prevent tampering
      const { userId, organizationId, ...updateData } = req.body;
      const updated = await tenantStorage.updateSite(id, updateData);

      if (!updated) {
        return res.status(404).json({ error: "Site not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating site:", error);
      res.status(500).json({ error: "Failed to update site" });
    }
  });

  app.delete(
    "/api/sites/:id",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const { id } = req.params;
        const tenantStorage = new TenantStorage(db as any, req.organizationId!);
        const deleted = await tenantStorage.deleteSite(id);

        if (!deleted) {
          return res.status(404).json({ error: "Site not found" });
        }
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting site:", error);
        res.status(500).json({ error: "Failed to delete site" });
      }
    },
  );

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
      const isSameOrg =
        user.organizationId && site.organizationId === user.organizationId;

      if (!isOwner && !isSameOrg) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(zone);
    } catch (error) {
      console.error("Error fetching zone:", error);
      res.status(500).json({ error: "Failed to fetch zone" });
    }
  });

  app.post(
    "/api/sites/:siteId/zones",
    verifySiteOwnership,
    async (req, res) => {
      try {
        const { siteId } = req.params;

        const validatedData = insertFacilityZoneSchema.parse({
          ...req.body,
          siteId,
        });

        const zone = await storage.createFacilityZone(validatedData);
        res.status(201).json(zone);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid data", details: error.errors });
        }
        console.error("Error creating facility zone:", error);
        res.status(500).json({ error: "Failed to create facility zone" });
      }
    },
  );

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
      const isSameOrg =
        user.organizationId && site.organizationId === user.organizationId;

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
      const isSameOrg =
        user.organizationId && site.organizationId === user.organizationId;

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

  // Assessment routes (tenant-scoped)
  app.get(
    "/api/assessments",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const tenantStorage = new TenantStorage(db as any, req.organizationId!);
        const assessments = await tenantStorage.getAllAssessments();
        res.json(assessments);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        res.status(500).json({ error: "Failed to fetch assessments" });
      }
    },
  );

  app.get(
    "/api/assessments/:id",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const tenantStorage = new TenantStorage(db as any, req.organizationId!);
        const assessment = await tenantStorage.getAssessment(req.params.id);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }
        res.json(assessment);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        res.status(500).json({ error: "Failed to fetch assessment" });
      }
    },
  );

  // Get comprehensive report data for an assessment
  app.get(
    "/api/assessments/:id/comprehensive-report-data",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const userId = req.session.userId!;
        const assessmentId = req.params.id;
        const tenantStorage = new TenantStorage(db as any, req.organizationId!);

        // Verify assessment belongs to tenant
        const assessment = await tenantStorage.getAssessment(assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        // Import the report data aggregator
        const { aggregateReportData } = await import(
          "./services/reportDataAggregator"
        );

        // Get comprehensive data
        const reportData = await aggregateReportData(
          assessmentId,
          storage,
          userId,
        );

        res.json(reportData);
      } catch (error) {
        console.error("Error generating comprehensive report data:", error);
        res
          .status(500)
          .json({ error: "Failed to generate comprehensive report data" });
      }
    },
  );

  // WAREHOUSE FRAMEWORK v2.0 ROUTES
  // Get warehouse-specific analysis including cargo theft vulnerability score
  app.get(
    "/api/assessments/:id/warehouse-analysis",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const tenantStorage = new TenantStorage(db as any, req.organizationId!);
        const assessment = await tenantStorage.getAssessment(assessmentId);

        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        // Import the cargo theft vulnerability scoring function
        const { calculateCargoTheftVulnerabilityScore } = await import(
          "./services/risk-engine/adapters/warehouse"
        );

        // Get loading docks for this assessment
        const loadingDocks =
          await storage.getLoadingDocksByAssessment(assessmentId);

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
        res
          .status(500)
          .json({ error: "Failed to generate warehouse analysis" });
      }
    },
  );

  // Update warehouse profile (JSONB column)
  app.patch(
    "/api/assessments/:id/warehouse-profile",
    verifyAssessmentOwnership,
    async (req, res) => {
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
          cargoTheftIncidents: z
            .array(
              z.object({
                date: z.string(),
                loss: z.number(),
                insiderInvolvement: z.boolean().optional(),
              }),
            )
            .optional(),
          locationRisk: z.enum(["High", "Medium", "Low"]).optional(),
          // TCOR - Total Cost of Risk fields
          employeeCount: z.number().optional(),
          annualTurnoverRate: z.number().optional(), // percentage (e.g., 50 for 50%)
          avgHiringCost: z.number().optional(), // dollars per hire
          annualLiabilityEstimates: z.number().optional(), // annual legal/insurance/WC costs
          securityIncidentsPerYear: z.number().optional(), // number of incidents
          brandDamageEstimate: z.number().optional(), // estimated brand/reputation cost
        });

        const validatedProfile =
          warehouseProfileSchema.parse(warehouseProfileData);

        // Update assessment with new warehouse_profile data
        const updatedAssessment = await storage.updateAssessment(assessmentId, {
          warehouseProfile: validatedProfile,
        });

        if (!updatedAssessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        res.json(updatedAssessment);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Invalid warehouse profile data",
            details: error.errors,
          });
        }
        console.error("Error updating warehouse profile:", error);
        res.status(500).json({ error: "Failed to update warehouse profile" });
      }
    },
  );

  // Create new loading dock
  app.post(
    "/api/assessments/:id/loading-docks",
    verifyAssessmentOwnership,
    async (req, res) => {
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
          return res.status(400).json({
            error: "Invalid loading dock data",
            details: error.errors,
          });
        }
        console.error("Error creating loading dock:", error);
        res.status(500).json({ error: "Failed to create loading dock" });
      }
    },
  );

  // Update loading dock
  app.patch(
    "/api/assessments/:id/loading-docks/:dockId",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id: assessmentId, dockId } = req.params;

        // Get existing dock to verify it belongs to this assessment
        const existingDock = await storage.getLoadingDock(dockId);
        if (!existingDock) {
          return res.status(404).json({ error: "Loading dock not found" });
        }

        if (existingDock.assessmentId !== assessmentId) {
          return res
            .status(403)
            .json({ error: "Loading dock does not belong to this assessment" });
        }

        // Validate partial update data (excluding assessmentId which shouldn't change)
        const { assessmentId: _, ...updateData } = req.body;
        const validatedData = insertLoadingDockSchema
          .partial()
          .parse(updateData);

        // Update loading dock
        const updatedDock = await storage.updateLoadingDock(
          dockId,
          validatedData,
        );

        if (!updatedDock) {
          return res.status(404).json({ error: "Loading dock not found" });
        }

        res.json(updatedDock);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Invalid loading dock data",
            details: error.errors,
          });
        }
        console.error("Error updating loading dock:", error);
        res.status(500).json({ error: "Failed to update loading dock" });
      }
    },
  );

  // Delete loading dock
  app.delete(
    "/api/assessments/:id/loading-docks/:dockId",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id: assessmentId, dockId } = req.params;

        // Get existing dock to verify it belongs to this assessment
        const existingDock = await storage.getLoadingDock(dockId);
        if (!existingDock) {
          return res.status(404).json({ error: "Loading dock not found" });
        }

        if (existingDock.assessmentId !== assessmentId) {
          return res
            .status(403)
            .json({ error: "Loading dock does not belong to this assessment" });
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
    },
  );

  // RETAIL STORE FRAMEWORK ROUTES
  // Get retail-specific analysis including shrinkage risk score
  app.get(
    "/api/assessments/:id/retail-analysis",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessment = req.assessment; // Verified by middleware
        const assessmentId = req.params.id;

        // Fetch survey responses for this assessment
        const surveyResponses = await storage.getAssessmentQuestions(assessmentId);
        
        // Map survey question IDs to expected field names for risk calculation
        const surveyData: Record<string, any> = {};
        for (const response of surveyResponses) {
          if (response.response) {
            // Normalize response to lowercase for yes/no comparison
            const normalizedResponse = typeof response.response === 'string' 
              ? response.response.toLowerCase() 
              : response.response;
            
            // Map specific question IDs to risk calculation field names
            switch (response.questionId) {
              case 'eas_1':
                surveyData.eas_system = normalizedResponse;
                break;
              case 'cctv_1':
                surveyData.cctv_system = normalizedResponse;
                break;
              case 'cctv_5':
                surveyData.pos_cctv = normalizedResponse;
                break;
              case 'lp_staff_1':
                surveyData.lp_staff = normalizedResponse;
                break;
              case 'shrinkage_4':
                surveyData.prior_orc = normalizedResponse;
                break;
              case 'shrinkage_6':
                surveyData.prior_robbery = normalizedResponse;
                break;
              default:
                // Store all responses by question ID for potential future use
                surveyData[response.questionId] = normalizedResponse;
            }
          }
        }

        // Import the shrinkage risk scoring function
        const { calculateShrinkageRiskScore } = await import(
          "./services/risk-engine/adapters/retail"
        );

        // Merge assessment with survey data for risk calculation
        const assessmentWithSurvey = {
          ...assessment,
          ...surveyData,
        };

        // Calculate shrinkage risk score
        const riskAnalysis = calculateShrinkageRiskScore(assessmentWithSurvey);

        // Return comprehensive retail data
        res.json({
          assessment,
          riskAnalysis,
        });
      } catch (error) {
        console.error("Error generating retail analysis:", error);
        res.status(500).json({ error: "Failed to generate retail analysis" });
      }
    },
  );

  // Update retail profile (JSONB column)
  app.patch(
    "/api/assessments/:id/retail-profile",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const retailProfileData = req.body;

        // Validate retail profile data structure
        const { merchandiseDisplaySchema } = await import("../shared/schema");
        const retailProfileSchema = z.object({
          annualRevenue: z.number().optional(),
          shrinkageRate: z.number().optional(),
          highValueMerchandise: z.array(z.string()).optional(),
          storeFormat: z.string().optional(),
          merchandiseDisplay: merchandiseDisplaySchema
            .optional()
            .default("Open Shelving"),
          // TCOR - Total Cost of Risk fields
          employeeCount: z.number().optional(),
          annualTurnoverRate: z.number().optional(), // percentage (e.g., 50 for 50%)
          avgHiringCost: z.number().optional(), // dollars per hire
          annualLiabilityEstimates: z.number().optional(), // annual legal/insurance/WC costs
          securityIncidentsPerYear: z.number().optional(), // number of incidents
          brandDamageEstimate: z.number().optional(), // estimated brand/reputation cost
        });

        const validatedProfile = retailProfileSchema.parse(retailProfileData);

        // Update assessment with new retail_profile data
        const updatedAssessment = await storage.updateAssessment(assessmentId, {
          retailProfile: validatedProfile,
        });

        if (!updatedAssessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        // Auto-generate retail risk scenarios after profile update (non-fatal)
        console.log(
          `🛒 Triggering retail risk scenario generation for assessment ${assessmentId}`,
        );

        try {
          // Step 1: Get survey responses from database
          const surveyQuestions = await storage.getFacilitySurveyQuestions(assessmentId);
          
          // Step 2: Convert to InterviewResponses format
          const interviewResponses: Record<string, any> = {};
          for (const q of surveyQuestions) {
            if (q.response !== null && q.response !== undefined && q.templateQuestionId) {
              interviewResponses[q.templateQuestionId] = q.response;
            }
          }

          const hasSurveyResponses = Object.keys(interviewResponses).length > 0;
          console.log(`📋 Found ${Object.keys(interviewResponses).length} survey responses for AI assessment`);

          let scenarioResult;

          if (hasSurveyResponses) {
            // Step 3 & 4: Use AI assessment with full context (if tier allows)
            // Check if user has AI analysis access
            const userId = req.user?.id || req.session?.userId;
            const user = userId ? await storage.getUser(userId) : null;
            const tier = (user?.accountTier || 'free') as AccountTier;
            const useAI = canUseAIAnalysis(tier);
            
            if (useAI) {
              console.log(`🤖 Using AI-powered assessment with survey responses (tier: ${tier})`);
            } else {
              console.log(`📊 AI not available for tier ${tier}, using algorithmic assessment`);
            }
            
            // Build shrinkage data from profile
            const shrinkageData = {
              currentRate: (validatedProfile.shrinkageRate || 0) / 100,
              annualLossDollars: (validatedProfile.annualRevenue || 0) * ((validatedProfile.shrinkageRate || 0) / 100),
            };

            // Build retail profile for store type context (especially merchandiseDisplayModel)
            const retailProfileContext = {
              merchandiseDisplayModel: validatedProfile.merchandiseDisplay,
              storeFormat: validatedProfile.storeFormat,
              annualRevenue: validatedProfile.annualRevenue,
              shrinkageRate: validatedProfile.shrinkageRate,
              highValueMerchandise: validatedProfile.highValueMerchandise,
              operatingHours: validatedProfile.operatingHours,
            };

            console.log(`[RETAIL-PROFILE] Merchandise display model: ${retailProfileContext.merchandiseDisplayModel}`);

            scenarioResult = await generateRetailRiskScenariosWithAI(
              assessmentId,
              interviewResponses,
              {
                useAI, // Respect tier limits
                shrinkageData,
                retailProfile: retailProfileContext, // Pass store type context to AI
              },
            );

            // Store AI recommendations in assessment for ROI calculator to use
            if (scenarioResult.aiRecommendations?.length > 0) {
              console.log(`[RETAIL-PROFILE] Storing ${scenarioResult.aiRecommendations.length} AI recommendations`);
              await storage.updateAssessment(assessmentId, {
                retailProfile: {
                  ...validatedProfile,
                  _aiRecommendations: scenarioResult.aiRecommendations,
                  _aiAssessmentMode: scenarioResult.mode,
                  _aiConfidence: scenarioResult.aiConfidence,
                },
              });
            }
          } else {
            // Fallback to algorithmic generation if no survey responses
            console.log(`📊 Using algorithmic assessment (no survey responses found)`);
            const { generateRetailRiskScenarios } = await import(
              "./services/risk-engine/generators/retail"
            );
            scenarioResult = await generateRetailRiskScenarios(
              assessmentId,
              storage,
            );
          }

          console.log(`📊 Retail scenario generation result:`, scenarioResult);

          // Return assessment with scenario generation metadata
          res.json({
            ...updatedAssessment,
            _scenarioGeneration: scenarioResult,
          });
        } catch (genError) {
          // Scenario generation failed but profile save succeeded
          console.error("⚠️ Retail scenario generation failed:", genError);

          // Return success since profile update succeeded, but include error info
          res.json({
            ...updatedAssessment,
            _scenarioGeneration: {
              success: false,
              scenariosCreated: 0,
              criticalScenarios: 0,
              summary:
                "Profile updated successfully, but scenario generation failed",
              errors: [
                genError instanceof Error ? genError.message : "Unknown error",
              ],
            },
          });
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Invalid retail profile data",
            details: error.errors,
          });
        }
        console.error("Error updating retail profile:", error);
        res.status(500).json({ error: "Failed to update retail profile" });
      }
    },
  );

  // ============================================================================
  // RETAIL AI RISK ASSESSMENT ROUTES
  // ============================================================================

  // Generate AI-powered retail risk scenarios
  app.post(
    "/api/assessments/:id/retail-interview/generate-risks-ai",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const {
          interviewResponses,
          useAI = true,
          photoFindings,
          incidentHistory,
          capIndexData,
          shrinkageData,
        } = req.body;

        const assessment = await storage.getAssessment(id);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        if (
          assessment.templateId !== "retail-store" &&
          assessment.templateId !== "retail"
        ) {
          return res.status(400).json({
            error:
              "Invalid assessment type. This endpoint is for Retail Store assessments only.",
          });
        }

        const result = await generateRetailRiskScenariosWithAI(
          id,
          interviewResponses,
          {
            useAI,
            photoFindings,
            incidentHistory,
            capIndexData,
            shrinkageData,
          },
        );

        res.json(result);
      } catch (error) {
        console.error("Error generating retail risk scenarios:", error);
        res.status(500).json({
          error: "Failed to generate risk scenarios",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Assess a single retail threat
  app.post(
    "/api/assessments/:id/retail-interview/assess-single-threat",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { threatId, interviewResponses, useAI = true } = req.body;

        if (!threatId) {
          return res.status(400).json({ error: "threatId is required" });
        }

        const validThreat = RETAIL_STORE_THREATS.find((t) => t.id === threatId);
        if (!validThreat) {
          return res.status(400).json({
            error: "Invalid threatId",
            validThreats: RETAIL_STORE_THREATS.map((t) => t.id),
          });
        }

        const result = await assessSingleRetailThreat(
          threatId,
          interviewResponses,
          { useAI },
        );
        res.json(result);
      } catch (error) {
        console.error("Error assessing single retail threat:", error);
        res.status(500).json({
          error: "Failed to assess threat",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // List available retail threats for assessment
  app.get(
    "/api/retail-threats",
    async (_req, res) => {
      try {
        res.json({
          threats: RETAIL_STORE_THREATS.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            asisCode: t.asisCode,
          })),
        });
      } catch (error) {
        console.error("Error listing retail threats:", error);
        res.status(500).json({ error: "Failed to list retail threats" });
      }
    },
  );

  // Retail Control Recommendations for ROI Calculator
  app.post(
    "/api/assessments/:id/retail-recommendations",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { surveyResponses, storeProfile, identifiedThreats } = req.body;

        // Build store profile from request or assessment data
        const assessment = await storage.getAssessment(id);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const retailProfile = assessment.retailProfile as any || {};
        
        // Check for AI-generated recommendations stored in retailProfile
        const aiRecommendations = retailProfile._aiRecommendations || [];
        const aiAssessmentMode = retailProfile._aiAssessmentMode;
        const aiConfidence = retailProfile._aiConfidence;
        
        console.log('[RECOMMENDATIONS] Checking for AI recommendations...');
        console.log('[RECOMMENDATIONS] AI mode:', aiAssessmentMode, 'confidence:', aiConfidence);
        console.log('[RECOMMENDATIONS] AI recommendations available:', aiRecommendations.length);
        
        // Use AI recommendations if available, otherwise fall back to algorithmic
        if (aiRecommendations.length > 0) {
          console.log('[RECOMMENDATIONS] Using AI-generated recommendations');
          
          // Convert AI recommendations to expected format
          const recommendations = aiRecommendations.slice(0, 10).map((rec: any, index: number) => ({
            control: {
              id: rec.controlId,
              name: rec.controlName,
              description: rec.rationale,
              standardsReference: rec.standardsReference,
            },
            priority: rec.urgency === 'immediate' ? 'critical' : 
                      rec.urgency === 'short_term' ? 'high' : 'medium',
            reason: rec.rationale,
            addressedThreats: rec.threatIds || [],
            estimatedROI: {
              // Parse cost range or use defaults based on urgency
              implementationCost: rec.estimatedCostRange 
                ? parseInt(rec.estimatedCostRange.replace(/[^0-9]/g, '')) || 15000
                : rec.urgency === 'immediate' ? 25000 : rec.urgency === 'short_term' ? 15000 : 8000,
              estimatedAnnualSavings: Math.round(
                (retailProfile.annualRevenue || 1000000) * 
                (retailProfile.shrinkageRate || 2) / 100 * 
                (rec.urgency === 'immediate' ? 0.25 : rec.urgency === 'short_term' ? 0.15 : 0.08)
              ),
              paybackPeriodMonths: rec.urgency === 'immediate' ? 8 : rec.urgency === 'short_term' ? 12 : 18,
            },
          }));

          // Calculate totals
          const totalInvestment = recommendations.reduce(
            (sum: number, r: any) => sum + r.estimatedROI.implementationCost, 0
          );
          const totalAnnualSavings = recommendations.reduce(
            (sum: number, r: any) => sum + r.estimatedROI.estimatedAnnualSavings, 0
          );
          const avgPaybackMonths = recommendations.length > 0
            ? Math.round(recommendations.reduce(
                (sum: number, r: any) => sum + r.estimatedROI.paybackPeriodMonths, 0
              ) / recommendations.length)
            : 0;

          console.log('[RECOMMENDATIONS] AI recommendations mapped:', recommendations.length);
          console.log('[RECOMMENDATIONS] AI control names:', recommendations.map((r: any) => r.control.name));

          return res.json({
            recommendations,
            summary: {
              totalRecommendations: recommendations.length,
              criticalCount: recommendations.filter((r: any) => r.priority === 'critical').length,
              highCount: recommendations.filter((r: any) => r.priority === 'high').length,
              mediumCount: recommendations.filter((r: any) => r.priority === 'medium').length,
              lowCount: recommendations.filter((r: any) => r.priority === 'low').length,
              totalInvestment,
              totalAnnualSavings,
              avgPaybackMonths,
              projectedFiveYearSavings: totalAnnualSavings * 5,
            },
            storeProfile: { 
              storeFormat: retailProfile.merchandiseDisplay || 'Open Shelving',
              annualRevenue: retailProfile.annualRevenue || 1000000,
            },
            source: 'ai',
            aiMode: aiAssessmentMode,
            aiConfidence,
          });
        }

        // Fallback to algorithmic recommendations
        console.log('[RECOMMENDATIONS] No AI recommendations, using algorithmic fallback');
        
        // Build complete store profile for control recommendations
        // CRITICAL: storeFormat in StoreProfile type is used for control filtering
        // and must use merchandiseDisplay values (Open Shelving, Service Only, etc.)
        // NOT the physical store format (Mall, Standalone, etc.)
        const merchandiseDisplayValue = storeProfile?.merchandiseDisplay || 
          retailProfile.merchandiseDisplay || 'Open Shelving';
        
        console.log('[RECOMMENDATIONS] Raw retailProfile:', JSON.stringify(retailProfile, null, 2));
        console.log('[RECOMMENDATIONS] Using merchandiseDisplay for filtering:', merchandiseDisplayValue);
        
        const completeStoreProfile: StoreProfile = {
          squareFootage: storeProfile?.squareFootage || 
            (retailProfile.annualRevenue > 10000000 ? 25000 : 
             retailProfile.annualRevenue > 3000000 ? 12000 : 5000),
          // Use merchandiseDisplay for control filtering (Open Shelving, Service Only, etc.)
          storeFormat: merchandiseDisplayValue,
          hasHighValueMerchandise: storeProfile?.hasHighValueMerchandise || 
            (retailProfile.highValueMerchandise?.length > 0),
          hasDressingRooms: storeProfile?.hasDressingRooms || 
            (retailProfile.merchandiseDisplay?.toLowerCase().includes('apparel') || false),
          hasSelfCheckout: storeProfile?.hasSelfCheckout || false,
          operatingHours: storeProfile?.operatingHours || 'standard',
          annualRevenue: storeProfile?.annualRevenue || retailProfile.annualRevenue || 1000000,
          currentShrinkageRate: storeProfile?.currentShrinkageRate || 
            (retailProfile.shrinkageRate ? retailProfile.shrinkageRate / 100 : 0.015),
        };

        // Build threat assessments from risk scenarios or provided data
        let threatAssessments: ThreatAssessment[] = identifiedThreats || [];
        
        if (!threatAssessments.length) {
          // Get risk scenarios from database
          const scenarios = await storage.getRiskScenarios(id);
          threatAssessments = scenarios.map(s => ({
            threatId: s.threat_id || s.threatType?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
            threatName: s.threatType || 'Unknown Threat',
            riskLevel: (s.riskScore || 0) >= 75 ? 'critical' : 
                       (s.riskScore || 0) >= 50 ? 'high' :
                       (s.riskScore || 0) >= 25 ? 'medium' : 'low',
            inherentRisk: s.riskScore || 0,
          }));
        }

        // Get survey responses from database if not provided
        let responses: SurveyResponses = surveyResponses || {};
        if (Object.keys(responses).length === 0) {
          const surveyQuestions = await storage.getFacilitySurveyQuestionsByAssessment(id);
          for (const q of surveyQuestions) {
            if (q.response !== null && q.response !== undefined && q.templateQuestionId) {
              responses[q.templateQuestionId] = q.response;
            }
          }
        }

        console.log('[RECOMMENDATIONS] Store profile:', JSON.stringify(completeStoreProfile, null, 2));
        console.log('[RECOMMENDATIONS] Identified threats:', threatAssessments.length, threatAssessments.map(t => t.threatId));
        console.log('[RECOMMENDATIONS] Survey responses count:', Object.keys(responses).length);
        
        // Generate control recommendations
        const recommendations = generateRetailControlRecommendations(
          responses,
          completeStoreProfile,
          threatAssessments
        );

        console.log('[RECOMMENDATIONS] Generated recommendations:', recommendations.length);
        console.log('[RECOMMENDATIONS] Control IDs:', recommendations.map(r => r.control.id));
        console.log('[RECOMMENDATIONS] Total costs:', recommendations.map(r => r.estimatedROI.implementationCost));

        // Calculate totals
        const totalInvestment = recommendations.reduce(
          (sum, r) => sum + r.estimatedROI.implementationCost, 0
        );
        const totalAnnualSavings = recommendations.reduce(
          (sum, r) => sum + r.estimatedROI.estimatedAnnualSavings, 0
        );
        const avgPaybackMonths = recommendations.length > 0
          ? Math.round(recommendations.reduce(
              (sum, r) => sum + r.estimatedROI.paybackPeriodMonths, 0
            ) / recommendations.length)
          : 0;

        res.json({
          recommendations,
          summary: {
            totalRecommendations: recommendations.length,
            criticalCount: recommendations.filter(r => r.priority === 'critical').length,
            highCount: recommendations.filter(r => r.priority === 'high').length,
            mediumCount: recommendations.filter(r => r.priority === 'medium').length,
            lowCount: recommendations.filter(r => r.priority === 'low').length,
            totalInvestment,
            totalAnnualSavings,
            avgPaybackMonths,
            projectedFiveYearSavings: totalAnnualSavings * 5,
          },
          storeProfile: completeStoreProfile,
        });
      } catch (error) {
        console.error("Error generating retail recommendations:", error);
        res.status(500).json({ error: "Failed to generate control recommendations" });
      }
    },
  );

  // MANUFACTURING FRAMEWORK ROUTES

  // Update manufacturing profile (JSONB column) - explicit wrapped payload
  app.patch(
    "/api/assessments/:id/manufacturing-profile",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const manufacturingProfileData = req.body;

        // Validate using shared schema with safeParse
        const validationResult = manufacturingProfileSchema.safeParse(
          manufacturingProfileData,
        );

        if (!validationResult.success) {
          return res.status(400).json({
            error: "Invalid manufacturing profile data",
            details: validationResult.error.errors,
          });
        }

        // Update assessment with validated profile
        const updatedAssessment = await storage.updateAssessment(assessmentId, {
          manufacturingProfile: validationResult.data,
        });

        if (!updatedAssessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        res.json(updatedAssessment);
      } catch (error) {
        console.error("Error updating manufacturing profile:", error);
        res
          .status(500)
          .json({ error: "Failed to update manufacturing profile" });
      }
    },
  );

  // Get production continuity analysis
  app.get(
    "/api/assessments/:id/production-continuity",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const assessment = req.assessment; // Verified by middleware

        // Import the manufacturing adapter
        const { ManufacturingAdapter } = await import(
          "./services/risk-engine/adapters/manufacturing"
        );
        const adapter = new ManufacturingAdapter(storage);

        // Calculate production continuity score
        const continuityScore =
          await adapter.calculateProductionContinuityScore(assessment);

        res.json(continuityScore);
      } catch (error) {
        console.error("Error calculating production continuity:", error);
        res
          .status(500)
          .json({ error: "Failed to calculate production continuity score" });
      }
    },
  );

  // ============================================================================
  // MANUFACTURING INTERVIEW ROUTES
  // ============================================================================

  // Get manufacturing threats for interview workflow
  app.get(
    "/api/assessments/:id/manufacturing-interview/threats",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        res.json({
          threats: MANUFACTURING_THREATS.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            typicalLikelihood: t.typicalLikelihood,
            typicalImpact: t.typicalImpact,
            asisCode: t.asisCode,
            description: t.description,
          })),
          totalThreats: MANUFACTURING_THREATS.length,
        });
      } catch (error) {
        console.error("Error fetching manufacturing threats:", error);
        res.status(500).json({ error: "Failed to fetch manufacturing threats" });
      }
    },
  );

  // Get manufacturing interview questions with section metadata
  app.get(
    "/api/assessments/:id/manufacturing-interview/questions",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const questions = getAllQuestionsFlattened();
        const stats = getQuestionnaireStats();

        const bySection: Record<string, any[]> = {};
        for (const section of MANUFACTURING_SECTIONS) {
          bySection[section] = getQuestionsBySection(section);
        }

        res.json({
          totalQuestions: stats.totalQuestions,
          sections: MANUFACTURING_SECTION_METADATA.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            order: s.order,
            questionCount: bySection[s.name]?.length || 0,
          })),
          questionsBySection: bySection,
          aiContextPrompt: getAIContextPrompt(),
        });
      } catch (error) {
        console.error("Error fetching manufacturing questions:", error);
        res.status(500).json({ error: "Failed to fetch questions" });
      }
    },
  );

  // Get manufacturing facility zones
  app.get(
    "/api/assessments/:id/manufacturing-interview/zones",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        res.json({
          zones: MANUFACTURING_ZONES,
          zoneCategories: {
            perimeter: ["perimeter", "parking_lot", "visitor_entrance"],
            production: ["production_floor", "tool_room"],
            sensitive: ["r_and_d_area", "server_room"],
            storage: ["raw_material_storage", "finished_goods_warehouse", "hazmat_storage"],
            shipping: ["loading_dock"],
            administrative: ["office_area", "break_room"],
          },
        });
      } catch (error) {
        console.error("Error fetching manufacturing zones:", error);
        res.status(500).json({ error: "Failed to fetch zones" });
      }
    },
  );

  // Calculate IP theft risk during interview
  app.post(
    "/api/assessments/:id/manufacturing-interview/calculate-ip-theft-risk",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const { score, grade, findings, strengths, categoryScores } =
          calculateOverallSecurityScore(interviewResponses);

        // IP protection level calculation
        const hasNDAs = interviewResponses.ip_2 === "yes";
        const hasDLP = interviewResponses.ip_5 === "yes";
        const hasCleanDesk = interviewResponses.ip_3 === "yes";
        const hasPhotographyProhibition = interviewResponses.production_5 === "yes";
        const hasExitInterviews = interviewResponses.ip_7 === "yes";
        const hasRDAccessControl = !(interviewResponses.ip_1a || "")
          .toLowerCase()
          .includes("no formal");

        const ipControlCount = [
          hasNDAs,
          hasDLP,
          hasCleanDesk,
          hasPhotographyProhibition,
          hasExitInterviews,
          hasRDAccessControl,
        ].filter(Boolean).length;

        let ipProtectionLevel = "concerning";
        if (ipControlCount >= 6) ipProtectionLevel = "excellent";
        else if (ipControlCount >= 5) ipProtectionLevel = "good";
        else if (ipControlCount >= 3) ipProtectionLevel = "average";
        else if (ipControlCount >= 1) ipProtectionLevel = "concerning";
        else ipProtectionLevel = "critical";

        // Insider threat risk calculation
        const incidentHistory = interviewResponses.emergency_2 || [];
        const hasInsiderHistory =
          Array.isArray(incidentHistory) &&
          (incidentHistory.includes("Employee theft") ||
            incidentHistory.includes("IP theft or suspected espionage") ||
            incidentHistory.includes("Equipment sabotage or tampering"));
        const hasInsiderProgram = interviewResponses.personnel_3 === "yes";
        const hasAccessRevocation = interviewResponses.personnel_6 === "yes";
        const hasBackgroundChecks = !(interviewResponses.personnel_1 || "")
          .toLowerCase()
          .includes("no background");
        const hasInsiderControls =
          hasInsiderProgram && hasAccessRevocation && hasBackgroundChecks;

        let insiderThreatRisk = "moderate";
        if (hasInsiderHistory && !hasInsiderControls) insiderThreatRisk = "critical";
        else if (hasInsiderHistory || !hasInsiderControls) insiderThreatRisk = "high";
        else if (!hasInsiderProgram || !hasAccessRevocation)
          insiderThreatRisk = "moderate";
        else insiderThreatRisk = "low";

        // CFATS compliance
        const hasHazmat = interviewResponses.facility_8 === "yes";
        const cfatsTier = interviewResponses.facility_8a || null;

        res.json({
          securityScore: score,
          securityGrade: grade,
          ipProtectionLevel,
          insiderThreatRisk,
          keyFindings: findings,
          strengths,
          categoryScores,
          cfatsCompliance: {
            applicable: hasHazmat,
            tier: hasHazmat ? cfatsTier : null,
          },
          components: {
            hasProductionAccessControl: interviewResponses.production_1 === "yes",
            hasIPProtectionMeasures: hasDLP || hasNDAs,
            hasDLPSystem: hasDLP,
            hasBackgroundChecks,
            hasInsiderThreatProgram: hasInsiderProgram,
            hasPhotographyProhibition,
            hasVisitorNDA: hasNDAs,
          },
        });
      } catch (error) {
        console.error("Error calculating IP theft risk:", error);
        res.status(500).json({ error: "Failed to calculate IP theft risk" });
      }
    },
  );

  // Prioritize all threats based on interview responses
  app.post(
    "/api/assessments/:id/manufacturing-interview/prioritize-threats",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const threatRisks = MANUFACTURING_THREATS.map((threat) => {
          const riskData = calculateRiskForThreat(interviewResponses, threat.id);
          return {
            id: threat.id,
            name: threat.name,
            category: threat.category,
            ...riskData,
          };
        });

        const sortedThreats = threatRisks.sort((a, b) => b.inherentRisk - a.inherentRisk);
        const highestRisks = sortedThreats.filter(
          (t) => t.riskLevel === "critical" || t.riskLevel === "high",
        );

        res.json({
          allThreats: sortedThreats,
          highestRisks,
          summary: {
            critical: sortedThreats.filter((t) => t.riskLevel === "critical").length,
            high: sortedThreats.filter((t) => t.riskLevel === "high").length,
            medium: sortedThreats.filter((t) => t.riskLevel === "medium").length,
            low: sortedThreats.filter((t) => t.riskLevel === "low").length,
          },
        });
      } catch (error) {
        console.error("Error prioritizing threats:", error);
        res.status(500).json({ error: "Failed to prioritize threats" });
      }
    },
  );

  // Get control recommendations based on interview responses
  app.post(
    "/api/assessments/:id/manufacturing-interview/get-control-recommendations",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses, priorityThreats, includeRationale = true } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const generalRecommendations = generateControlRecommendations(
          interviewResponses,
          priorityThreats?.[0],
        );

        const prioritizedControls = includeRationale
          ? getPrioritizedControlRecommendations(interviewResponses)
          : [];

        let threatSpecificControls: any[] = [];
        if (priorityThreats && priorityThreats.length > 0) {
          for (const threatId of priorityThreats) {
            const threatControls = THREAT_CONTROL_MAPPING[threatId] || [];
            threatSpecificControls.push({
              threatId,
              controls: threatControls.map((controlId: string) => ({
                controlId,
                controlName: controlId
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char: string) => char.toUpperCase()),
              })),
            });
          }
        }

        res.json({
          total: generalRecommendations.length,
          recommendations: generalRecommendations.map((controlId: string) => ({
            controlId,
            controlName: controlId
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char: string) => char.toUpperCase()),
          })),
          prioritizedControls: prioritizedControls.length > 0 ? prioritizedControls : undefined,
          threatSpecificControls:
            threatSpecificControls.length > 0 ? threatSpecificControls : undefined,
        });
      } catch (error) {
        console.error("Error getting control recommendations:", error);
        res.status(500).json({ error: "Failed to get control recommendations" });
      }
    },
  );

  // Get threat breakdown with T×V×I details
  app.post(
    "/api/assessments/:id/manufacturing-interview/get-threat-breakdown",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses, threatId } = req.body;

        if (!interviewResponses || !threatId) {
          return res
            .status(400)
            .json({ error: "interviewResponses and threatId are required" });
        }

        const threat = MANUFACTURING_THREATS.find((t) => t.id === threatId);
        if (!threat) {
          return res.status(400).json({
            error: "Invalid threatId",
            validThreats: MANUFACTURING_THREATS.map((t) => t.id),
          });
        }

        const questionMapping = QUESTION_THREAT_MAPPING[threatId] || {
          questionIds: [],
          criticalQuestions: [],
          controlQuestions: [],
        };

        const T = calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
        const V = calculateVulnerabilityFromInterview(interviewResponses, threatId);
        const I = calculateImpactFromInterview(interviewResponses, threatId);
        const inherentRisk = T * V * I;

        let riskLevel = "low";
        const normalizedRisk = (inherentRisk / 125) * 100;
        if (normalizedRisk >= 60) riskLevel = "critical";
        else if (normalizedRisk >= 40) riskLevel = "high";
        else if (normalizedRisk >= 25) riskLevel = "medium";

        res.json({
          threat: {
            id: threat.id,
            name: threat.name,
            category: threat.category,
            description: threat.description,
            asisCode: threat.asisCode,
          },
          scores: {
            threatLikelihood: T,
            vulnerability: V,
            impact: I,
            inherentRisk,
            riskLevel,
          },
          questionMapping: {
            totalQuestions: questionMapping.questionIds?.length || 0,
            criticalQuestions: questionMapping.criticalQuestions || [],
            controlQuestions: questionMapping.controlQuestions || [],
          },
          recommendedControls: THREAT_CONTROL_MAPPING[threatId] || [],
        });
      } catch (error) {
        console.error("Error getting threat breakdown:", error);
        res.status(500).json({ error: "Failed to get threat breakdown" });
      }
    },
  );

  // Generate risk scenarios using AI
  app.post(
    "/api/assessments/:id/manufacturing-interview/generate-risks-ai",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const {
          interviewResponses,
          useAI = true,
          photoFindings,
          incidentHistory,
          ipAssets,
          cfatsProfile,
          productionValue,
        } = req.body;

        const assessment = await storage.getAssessment(id);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        if (
          assessment.templateId !== "manufacturing-facility" &&
          assessment.templateId !== "manufacturing"
        ) {
          return res.status(400).json({
            error:
              "Invalid assessment type. This endpoint is for Manufacturing assessments only.",
          });
        }

        const result = await generateManufacturingRiskScenariosWithAI(
          id,
          interviewResponses,
          {
            useAI,
            photoFindings,
            incidentHistory,
            ipAssets,
            cfatsProfile,
            productionValue,
          },
        );

        res.json(result);
      } catch (error) {
        console.error("Error generating manufacturing risk scenarios:", error);
        res.status(500).json({
          error: "Failed to generate risk scenarios",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Assess a single manufacturing threat
  app.post(
    "/api/assessments/:id/manufacturing-interview/assess-single-threat",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { threatId, interviewResponses, useAI = true } = req.body;

        if (!threatId) {
          return res.status(400).json({ error: "threatId is required" });
        }

        const validThreat = MANUFACTURING_THREATS.find((t) => t.id === threatId);
        if (!validThreat) {
          return res.status(400).json({
            error: "Invalid threatId",
            validThreats: MANUFACTURING_THREATS.map((t) => t.id),
          });
        }

        const result = await assessSingleManufacturingThreat(
          threatId,
          interviewResponses,
          useAI,
        );
        res.json(result);
      } catch (error) {
        console.error("Error assessing single manufacturing threat:", error);
        res.status(500).json({
          error: "Failed to assess threat",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Generate AI narrative for manufacturing assessment
  app.post(
    "/api/assessments/:id/manufacturing-interview/generate-narrative",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { results, interviewResponses, narrativeType = "executive_summary" } =
          req.body;

        if (!results || !Array.isArray(results)) {
          return res.status(400).json({ error: "results array is required" });
        }

        const context = {
          assessmentId: id,
          interviewResponses: interviewResponses || {},
        };

        const narrative = await generateManufacturingNarrative({
          assessmentId: id,
          riskScenarios: results,
          facilityContext: context,
          narrativeType,
        });

        res.json({ narrative });
      } catch (error) {
        console.error("Error generating manufacturing narrative:", error);
        res.status(500).json({ error: "Failed to generate narrative" });
      }
    },
  );

  // Save interview responses
  app.post(
    "/api/assessments/:id/manufacturing-interview/save-responses",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { interviewResponses, generateScenarios = false } = req.body;

        const updatedAssessment = await storage.updateAssessment(id, {
          interviewResponses,
        });

        let scenarioResult = null;
        if (generateScenarios) {
          scenarioResult = await initializeRiskScenariosFromInterview(
            id,
            interviewResponses,
          );
        }

        res.json({
          success: true,
          assessmentId: id,
          savedAt: new Date().toISOString(),
          scenarioResult,
        });
      } catch (error) {
        console.error("Error saving interview responses:", error);
        res.status(500).json({ error: "Failed to save responses" });
      }
    },
  );

  // Get industry benchmarks
  app.get(
    "/api/assessments/:id/manufacturing-interview/industry-benchmarks",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        res.json({
          industryStandards: {
            asis: {
              name: "ASIS GDL-RA",
              description: "General Security Risk Assessment Guidelines",
              applicability: "All manufacturing facilities",
            },
            cfats: {
              name: "CFATS (Chemical Facility Anti-Terrorism Standards)",
              description: "DHS requirements for facilities handling chemicals of interest",
              applicability: "Facilities with hazardous materials",
              tiers: ["Tier 1 (highest risk)", "Tier 2", "Tier 3", "Tier 4"],
            },
            nist: {
              name: "NIST Manufacturing Security Guidelines",
              description: "Security framework for manufacturing operations",
              applicability: "All manufacturing facilities",
            },
            iso28000: {
              name: "ISO 28000",
              description: "Supply Chain Security Management Systems",
              applicability: "Supply chain operations",
            },
          },
          ipTheftStatistics: {
            annualCost: "$600+ billion annually in US (FBI estimate)",
            insiderInvolvement: "60%+ involves current or former employees",
          },
          securityMaturityLevels: {
            level1: { name: "Initial", typicalScore: "0-40" },
            level2: { name: "Developing", typicalScore: "41-60" },
            level3: { name: "Defined", typicalScore: "61-75" },
            level4: { name: "Managed", typicalScore: "76-90" },
            level5: { name: "Optimized", typicalScore: "91-100" },
          },
        });
      } catch (error) {
        console.error("Error fetching industry benchmarks:", error);
        res.status(500).json({ error: "Failed to fetch benchmarks" });
      }
    },
  );

  // DATACENTER FRAMEWORK ROUTES

  // Update datacenter profile (JSONB column) - explicit wrapped payload
  app.patch(
    "/api/assessments/:id/datacenter-profile",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const datacenterProfileData = req.body;

        // Validate using shared schema with safeParse
        const validationResult =
          datacenterProfileSchema.safeParse(datacenterProfileData);

        if (!validationResult.success) {
          return res.status(400).json({
            error: "Invalid datacenter profile data",
            details: validationResult.error.errors,
          });
        }

        // Update assessment with validated profile
        const updatedAssessment = await storage.updateAssessment(assessmentId, {
          datacenterProfile: validationResult.data,
        });

        if (!updatedAssessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        res.json(updatedAssessment);
      } catch (error) {
        console.error("Error updating datacenter profile:", error);
        res.status(500).json({ error: "Failed to update datacenter profile" });
      }
    },
  );

  // Get uptime reliability and compliance analysis
  app.get(
    "/api/assessments/:id/uptime-reliability",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const assessment = req.assessment; // Verified by middleware

        // Import the datacenter adapter
        const { DatacenterAdapter } = await import(
          "./services/risk-engine/adapters/datacenter"
        );
        const adapter = new DatacenterAdapter(storage);

        // Calculate uptime reliability and compliance scores
        const reliabilityScore =
          await adapter.calculateUptimeReliability(assessment);

        res.json(reliabilityScore);
      } catch (error) {
        console.error("Error calculating uptime reliability:", error);
        res
          .status(500)
          .json({ error: "Failed to calculate uptime reliability score" });
      }
    },
  );

  // Get datacenter interview threats list
  app.get(
    "/api/assessments/:id/datacenter-interview/threats",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { DATACENTER_THREATS } = await import(
          "./services/datacenter-interview-mapper"
        );

        res.json({
          threats: DATACENTER_THREATS.map((t: any) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            typicalLikelihood: t.typicalLikelihood,
            typicalImpact: t.typicalImpact,
            asisCode: t.asisCode,
            description: t.description,
          })),
          totalThreats: DATACENTER_THREATS.length,
          threatCategories: Array.from(new Set(DATACENTER_THREATS.map((t: any) => t.category))),
        });
      } catch (error) {
        console.error("Error fetching datacenter threats:", error);
        res.status(500).json({ error: "Failed to fetch datacenter threats" });
      }
    },
  );

  // Generate datacenter risk scenarios with AI (primary AI endpoint)
  app.post(
    "/api/assessments/:id/datacenter-interview/generate-risks-ai",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const {
          interviewResponses,
          useAI = true,
          photoFindings,
          incidentHistory,
          complianceRequirements,
          uptimeMetrics,
          facilityName,
        } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const assessment = req.assessment;
        if (assessment?.templateId !== "datacenter" && assessment?.facilityType !== "datacenter") {
          return res.status(400).json({
            error: "Invalid assessment type. This endpoint is for Datacenter assessments only.",
          });
        }

        const { generateDatacenterRiskScenariosWithAI } = await import(
          "./services/datacenter-ai-risk-assessment"
        );

        const result = await generateDatacenterRiskScenariosWithAI(
          assessmentId,
          interviewResponses,
          {
            useAI,
            photoFindings,
            incidentHistory,
            complianceRequirements,
            uptimeMetrics,
            facilityName,
          }
        );

        res.json(result);
      } catch (error) {
        console.error("Error generating datacenter risk scenarios:", error);
        res.status(500).json({
          error: "Failed to generate risk scenarios",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Assess single datacenter threat with AI
  app.post(
    "/api/assessments/:id/datacenter-interview/assess-single-threat",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { threatId, interviewResponses, useAI = true } = req.body;

        if (!threatId) {
          return res.status(400).json({ error: "threatId is required" });
        }

        const { DATACENTER_THREATS } = await import(
          "./services/datacenter-interview-mapper"
        );
        const { assessSingleDatacenterThreat } = await import(
          "./services/datacenter-ai-risk-assessment"
        );

        const validThreat = DATACENTER_THREATS.find((t: any) => t.id === threatId);
        if (!validThreat) {
          return res.status(400).json({
            error: "Invalid threatId",
            validThreats: DATACENTER_THREATS.map((t: any) => t.id),
          });
        }

        const result = await assessSingleDatacenterThreat(threatId, interviewResponses, { useAI });

        res.json(result);
      } catch (error) {
        console.error("Error assessing single datacenter threat:", error);
        res.status(500).json({
          error: "Failed to assess threat",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Generate datacenter narrative summary with AI
  app.post(
    "/api/assessments/:id/datacenter-interview/generate-narrative",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const { results, interviewResponses, facilityName } = req.body;

        if (!results || !Array.isArray(results)) {
          return res.status(400).json({ error: "results array is required" });
        }

        const { generateDatacenterNarrativeSummary } = await import(
          "./services/datacenter-ai-risk-assessment"
        );

        const context = {
          assessmentId,
          interviewResponses: interviewResponses || {},
          facilityName,
        };

        const narrative = await generateDatacenterNarrativeSummary(results, context);

        res.json({ narrative });
      } catch (error) {
        console.error("Error generating datacenter narrative:", error);
        res.status(500).json({ error: "Failed to generate narrative" });
      }
    },
  );

  // Calculate datacenter security score from interview responses
  app.post(
    "/api/assessments/:id/datacenter-interview/calculate-security-score",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const { calculateOverallSecurityScore, DATACENTER_THREATS } = await import(
          "./services/datacenter-interview-mapper"
        );

        const result = calculateOverallSecurityScore(interviewResponses);

        res.json({
          score: result.score,
          grade: result.grade,
          findings: result.findings,
          strengths: result.strengths,
          categoryScores: result.categoryScores,
          totalThreats: DATACENTER_THREATS.length,
        });
      } catch (error) {
        console.error("Error calculating datacenter security score:", error);
        res.status(500).json({ error: "Failed to calculate security score" });
      }
    },
  );

  // Get datacenter vulnerability breakdown for all threats
  app.post(
    "/api/assessments/:id/datacenter-interview/vulnerability-breakdown",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const {
          DATACENTER_THREATS,
          calculateVulnerabilityFromInterview,
          calculateThreatLikelihoodFromInterview,
          calculateImpactFromInterview,
        } = await import("./services/datacenter-interview-mapper");

        const breakdown = DATACENTER_THREATS.map((threat: any) => ({
          threatId: threat.id,
          threatName: threat.name,
          category: threat.category,
          vulnerability: calculateVulnerabilityFromInterview(interviewResponses, threat.id),
          threatLikelihood: calculateThreatLikelihoodFromInterview(interviewResponses, threat.id),
          impact: calculateImpactFromInterview(interviewResponses, threat.id),
        }));

        res.json({
          breakdown,
          totalThreats: DATACENTER_THREATS.length,
        });
      } catch (error) {
        console.error("Error calculating vulnerability breakdown:", error);
        res.status(500).json({ error: "Failed to calculate vulnerability breakdown" });
      }
    },
  );

  // OFFICE BUILDING FRAMEWORK ROUTES

  // Update office profile (JSONB column) - explicit wrapped payload
  app.patch(
    "/api/assessments/:id/office-profile",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const { office_profile } = req.body; // Expect wrapped payload
        
        console.log('[OFFICE-PROFILE] PATCH received:', { assessmentId, office_profile });

        // Guard against missing payload
        if (!office_profile) {
          console.log('[OFFICE-PROFILE] ERROR: Missing office_profile in body');
          return res
            .status(400)
            .json({ error: "Office profile data is required" });
        }

        // Validate using shared schema with safeParse
        const { officeProfileSchema } = await import("@shared/schema");
        const validationResult = officeProfileSchema.safeParse(office_profile);

        if (!validationResult.success) {
          console.log('[OFFICE-PROFILE] VALIDATION ERROR:', validationResult.error.errors);
          return res.status(400).json({
            error: "Invalid office profile data",
            details: validationResult.error.errors,
          });
        }

        console.log('[OFFICE-PROFILE] Validated data:', validationResult.data);

        // Update assessment with validated profile (use camelCase to match Drizzle schema)
        const updatedAssessment = await storage.updateAssessment(assessmentId, {
          officeProfile: validationResult.data,
        });
        
        console.log('[OFFICE-PROFILE] Updated assessment officeProfile:', updatedAssessment?.officeProfile);

        if (!updatedAssessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        // AUTO-GENERATE office risk scenarios after profile update (Hybrid Model)
        console.log(
          `🏢 Auto-generating office risk scenarios for assessment ${assessmentId}`,
        );

        try {
          // Create implicit assets FIRST (idempotent - only if missing)
          const existingAssets = await storage.getRiskAssets(assessmentId);
          const implicitAssetNames = [
            "Personnel",
            "Facility",
            "Data & Information",
          ];
          let assetsCreated = 0;

          for (const assetName of implicitAssetNames) {
            const exists = existingAssets.some((a) => a.name === assetName);
            if (!exists) {
              try {
                await storage.createRiskAsset({
                  assessmentId,
                  name: assetName,
                  type:
                    assetName === "Facility"
                      ? "Property"
                      : assetName === "Data & Information"
                        ? "Information"
                        : "People",
                  criticality: 3,
                  owner: "Auto-generated",
                  scope: `Implicit asset for ${assetName.toLowerCase()} risk scenarios`,
                  notes:
                    "Auto-created to support standard office building risk assessment",
                });
                assetsCreated++;
                console.log(`✓ Created implicit asset: ${assetName}`);
              } catch (assetError) {
                console.error(
                  `⚠️ Failed to create asset ${assetName}:`,
                  assetError,
                );
              }
            }
          }

          // Check if scenarios already exist (after ensuring assets exist)
          const existingScenarios =
            await storage.getRiskScenarios(assessmentId);
          if (existingScenarios.length > 0) {
            console.log(
              `⏭️  Skipping scenario generation - ${existingScenarios.length} scenarios already exist`,
            );

            // Reload assessment to include any newly created assets
            const refreshedAssessment =
              await storage.getAssessment(assessmentId);

            return res.json({
              ...refreshedAssessment,
              _scenarioGeneration: {
                success: true,
                scenariosCreated: 0,
                assetsCreated,
                scenariosSkipped: existingScenarios.length,
                summary:
                  assetsCreated > 0
                    ? `Created ${assetsCreated} implicit assets; ${existingScenarios.length} scenarios already exist`
                    : `${existingScenarios.length} scenarios already exist`,
              },
            });
          }

          // Get refreshed assets list
          const assets = await storage.getRiskAssets(assessmentId);
          const personnelAsset = assets.find((a) => a.name === "Personnel");
          const facilityAsset = assets.find((a) => a.name === "Facility");
          const dataAsset = assets.find((a) => a.name === "Data & Information");

          // Generate standard office risk scenarios with full schema-compliant fields
          const scenarios = [
            {
              assessmentId,
              assetId: personnelAsset?.id,
              asset: "Personnel",
              scenario: "Workplace Violence - Active Threat",
              threatLibraryId: null, // Will be resolved if threat lookup is needed
              threatType: "human",
              threatDescription:
                "Armed individual enters facility with intent to cause harm",
              vulnerabilityDescription:
                "Insufficient access control and emergency response protocols",
              likelihood: "low",
              impact: "catastrophic",
              riskLevel: "Medium",
              currentLikelihood: "low",
              currentImpact: "catastrophic",
              currentRiskLevel: "Medium",
              likelihoodScore: 2,
              impactScore: 5,
              inherentRisk: 10, // 2 × 5 = 10
              controlEffectiveness: 0,
              residualRisk: 10,
            },
            {
              assessmentId,
              assetId: personnelAsset?.id,
              asset: "Personnel",
              scenario: "Workplace Violence - Domestic Spillover",
              threatLibraryId: null, // Will be resolved if threat lookup is needed
              threatType: "human",
              threatDescription:
                "Personal conflict extends into workplace environment",
              vulnerabilityDescription:
                "Lack of threat assessment procedures for domestic situations",
              likelihood: "medium",
              impact: "major",
              riskLevel: "Medium",
              currentLikelihood: "medium",
              currentImpact: "major",
              currentRiskLevel: "Medium",
              likelihoodScore: 3,
              impactScore: 4,
              inherentRisk: 12, // 3 × 4 = 12
              controlEffectiveness: 0,
              residualRisk: 12,
            },
            {
              assessmentId,
              assetId: facilityAsset?.id,
              asset: "Facility",
              scenario: "Unauthorized Facility Access",
              threatLibraryId: null, // Will be resolved if threat lookup is needed
              threatType: "human",
              threatDescription: "Intruder gains access to restricted areas",
              vulnerabilityDescription:
                "Weak perimeter controls or badge system vulnerabilities",
              likelihood: "medium",
              impact: "moderate",
              riskLevel: "Medium",
              currentLikelihood: "medium",
              currentImpact: "moderate",
              currentRiskLevel: "Medium",
              likelihoodScore: 3,
              impactScore: 3,
              inherentRisk: 9, // 3 × 3 = 9
              controlEffectiveness: 0,
              residualRisk: 9,
            },
            {
              assessmentId,
              assetId: dataAsset?.id,
              asset: "Data & Information",
              scenario: "Data Breach - Physical Document Exposure",
              threatLibraryId: null, // Will be resolved if threat lookup is needed
              threatType: "operational",
              threatDescription:
                "Sensitive documents left unsecured or improperly disposed",
              vulnerabilityDescription:
                "Inadequate clean desk policy and document handling procedures",
              likelihood: "high",
              impact: "major",
              riskLevel: "High",
              currentLikelihood: "high",
              currentImpact: "major",
              currentRiskLevel: "High",
              likelihoodScore: 4,
              impactScore: 4,
              inherentRisk: 16, // 4 × 4 = 16
              controlEffectiveness: 0,
              residualRisk: 16,
            },
            {
              assessmentId,
              assetId: dataAsset?.id,
              asset: "Data & Information",
              scenario: "Social Engineering Attack",
              threatLibraryId: null, // Will be resolved if threat lookup is needed
              threatType: "human",
              threatDescription:
                "Attacker manipulates staff to gain sensitive information",
              vulnerabilityDescription:
                "Insufficient security awareness training",
              likelihood: "high",
              impact: "moderate",
              riskLevel: "Medium",
              currentLikelihood: "high",
              currentImpact: "moderate",
              currentRiskLevel: "Medium",
              likelihoodScore: 4,
              impactScore: 3,
              inherentRisk: 12, // 4 × 3 = 12
              controlEffectiveness: 0,
              residualRisk: 12,
            },
          ];

          let created = 0;
          const errors: string[] = [];

          for (const scenarioData of scenarios) {
            try {
              await storage.createRiskScenario(scenarioData);
              created++;
            } catch (scenarioError) {
              const errorMsg =
                scenarioError instanceof Error
                  ? scenarioError.message
                  : "Unknown error";
              errors.push(
                `Failed to create scenario "${scenarioData.scenario}": ${errorMsg}`,
              );
              console.error(
                `⚠️ Failed to create scenario "${scenarioData.scenario}":`,
                scenarioError,
              );
            }
          }

          console.log(
            `✅ Auto-generated ${created}/${scenarios.length} office risk scenarios`,
          );

          // Reload assessment to include freshly created assets and scenarios
          const refreshedAssessment = await storage.getAssessment(assessmentId);

          res.json({
            ...refreshedAssessment,
            _scenarioGeneration: {
              success: created > 0,
              scenariosCreated: created,
              assetsCreated,
              summary:
                created === scenarios.length
                  ? `Auto-generated ${created} standard office building risk scenarios`
                  : `Partially generated: ${created}/${scenarios.length} scenarios created`,
              errors: errors.length > 0 ? errors : undefined,
            },
          });
        } catch (genError) {
          // Scenario generation failed but profile save succeeded
          console.error("⚠️ Office scenario auto-generation failed:", genError);
          res.json(updatedAssessment);
        }
      } catch (error) {
        console.error("Error updating office profile:", error);
        res.status(500).json({ error: "Failed to update office profile" });
      }
    },
  );

  // Get office safety and data security analysis
  app.get(
    "/api/assessments/:id/office-safety",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const assessment = req.assessment; // Verified by middleware

        // Import the office adapter
        const { OfficeAdapter } = await import(
          "./services/risk-engine/adapters/office"
        );
        const adapter = new OfficeAdapter(storage);

        // Calculate office safety scores
        const safetyScore = await adapter.calculateOfficeSafety(assessment);

        res.json(safetyScore);
      } catch (error) {
        console.error("Error calculating office safety:", error);
        res
          .status(500)
          .json({ error: "Failed to calculate office safety score" });
      }
    },
  );

  // ============================================================================
  // OFFICE BUILDING INTERVIEW ROUTES (AI-POWERED)
  // ============================================================================

  // Get office threats list
  app.get(
    "/api/assessments/:id/office-interview/threats",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { OFFICE_BUILDING_THREATS } = await import(
          "./services/office-interview-risk-mapper-corrected"
        );
        
        res.json({
          threats: OFFICE_BUILDING_THREATS.map((t: any) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            description: t.description,
            typicalLikelihood: t.typicalLikelihood,
            typicalImpact: t.typicalImpact,
            asisCode: t.asisCode,
          })),
          totalThreats: OFFICE_BUILDING_THREATS.length,
        });
      } catch (error) {
        console.error("Error fetching office threats:", error);
        res.status(500).json({ error: "Failed to fetch office threats" });
      }
    },
  );

  // Generate risk scenarios from interview with AI
  app.post(
    "/api/assessments/:id/office-interview/generate-risks-ai",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = parseInt(req.params.id);
        const { interviewResponses, useAI = true, photoFindings, incidentHistory, facilityName } = req.body;

        const assessment = req.assessment;
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        // Import mapper functions
        const mapper = await import("./services/office-interview-risk-mapper-corrected");
        
        // Generate scenarios using algorithmic approach
        const result = await mapper.initializeRiskScenariosFromInterview(
          assessmentId,
          interviewResponses
        );

        res.json({
          ...result,
          mode: useAI ? "hybrid" : "algorithmic",
          aiConfidence: "medium",
        });
      } catch (error) {
        console.error("Error generating office risk scenarios:", error);
        res.status(500).json({
          error: "Failed to generate risk scenarios",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Assess single office threat
  app.post(
    "/api/assessments/:id/office-interview/assess-single-threat",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { threatId, interviewResponses } = req.body;

        if (!threatId) {
          return res.status(400).json({ error: "threatId is required" });
        }

        const validThreatIds = [
          "unauthorized_access", "workplace_violence", "theft_burglary",
          "executive_targeting", "data_breach_physical", "terrorism_bomb_threat",
          "civil_disturbance", "insider_threat", "after_hours_intrusion",
          "vehicle_ramming", "active_shooter", "corporate_espionage",
        ];

        if (!validThreatIds.includes(threatId)) {
          return res.status(400).json({
            error: "Invalid threatId",
            validOptions: validThreatIds,
          });
        }

        const mapper = await import("./services/office-interview-risk-mapper-corrected");
        
        const threatLikelihood = mapper.calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
        const vulnerability = mapper.calculateVulnerabilityFromInterview(interviewResponses, threatId);
        const impact = mapper.calculateImpactFromInterview(interviewResponses, threatId);
        const inherentRisk = threatLikelihood * vulnerability * impact;
        const normalizedScore = Math.round((inherentRisk / 125) * 100);

        res.json({
          threatId,
          threatLikelihood: { score: threatLikelihood },
          vulnerability: { score: vulnerability },
          impact: { score: impact },
          inherentRisk: {
            score: inherentRisk,
            normalizedScore,
            classification: normalizedScore >= 75 ? "critical" : normalizedScore >= 50 ? "high" : normalizedScore >= 25 ? "medium" : "low",
          },
        });
      } catch (error) {
        console.error("Error assessing single office threat:", error);
        res.status(500).json({
          error: "Failed to assess threat",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Generate narrative summary
  app.post(
    "/api/assessments/:id/office-interview/generate-narrative",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { results, interviewResponses, facilityName } = req.body;

        if (!results || !Array.isArray(results)) {
          return res.status(400).json({ error: "results array is required" });
        }

        // Generate simple narrative without AI for now
        const criticalCount = results.filter((r: any) => r.inherentRisk?.classification === "critical").length;
        const highCount = results.filter((r: any) => r.inherentRisk?.classification === "high").length;

        const narrative = `Security Assessment Summary for ${facilityName || "Office Building"}

This assessment identified ${results.length} threat scenarios requiring attention. Of these, ${criticalCount} are classified as critical risk and ${highCount} as high risk.

Key recommendations include strengthening access control measures, enhancing surveillance coverage, and implementing comprehensive emergency response procedures.

The facility should prioritize addressing critical risks immediately while developing a phased approach for medium-term improvements.`;

        res.json({ narrative });
      } catch (error) {
        console.error("Error generating office narrative:", error);
        res.status(500).json({ error: "Failed to generate narrative" });
      }
    },
  );

  // Calculate security score
  app.post(
    "/api/assessments/:id/office-interview/calculate-security-score",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const mapper = await import("./services/office-interview-risk-mapper-corrected");
        const result = mapper.calculateOverallSecurityScore(interviewResponses);

        res.json(result);
      } catch (error) {
        console.error("Error calculating security score:", error);
        res.status(500).json({ error: "Failed to calculate security score" });
      }
    },
  );

  // Get vulnerability breakdown
  app.post(
    "/api/assessments/:id/office-interview/vulnerability-breakdown",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const mapper = await import("./services/office-interview-risk-mapper-corrected");
        const { OFFICE_BUILDING_THREATS } = mapper;

        const breakdown = OFFICE_BUILDING_THREATS.map((threat: any) => ({
          threatId: threat.id,
          name: threat.name,
          category: threat.category,
          vulnerability: mapper.calculateVulnerabilityFromInterview(interviewResponses, threat.id),
          threatLikelihood: mapper.calculateThreatLikelihoodFromInterview(interviewResponses, threat.id),
          impact: mapper.calculateImpactFromInterview(interviewResponses, threat.id),
        }));

        res.json({ breakdown });
      } catch (error) {
        console.error("Error getting vulnerability breakdown:", error);
        res.status(500).json({ error: "Failed to get vulnerability breakdown" });
      }
    },
  );

  // ============================================================================
  // MANUFACTURING FACILITY INTERVIEW ROUTES (AI-POWERED)
  // ============================================================================

  // Get manufacturing threats list
  app.get(
    "/api/assessments/:id/manufacturing-interview/threats",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { MANUFACTURING_THREATS } = await import(
          "./services/manufacturing-interview-mapper"
        );
        
        res.json({
          threats: MANUFACTURING_THREATS.map((t: any) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            description: t.description,
            typicalLikelihood: t.typicalLikelihood,
            typicalImpact: t.typicalImpact,
            asisCode: t.asisCode,
          })),
          totalThreats: MANUFACTURING_THREATS.length,
        });
      } catch (error) {
        console.error("Error fetching manufacturing threats:", error);
        res.status(500).json({ error: "Failed to fetch manufacturing threats" });
      }
    },
  );

  // Generate manufacturing risk scenarios from interview with AI
  app.post(
    "/api/assessments/:id/manufacturing-interview/generate-risks-ai",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = parseInt(req.params.id);
        const { interviewResponses, useAI = true, photoFindings, incidentHistory, facilityName, ipAssets, cfatsProfile } = req.body;

        const assessment = req.assessment;
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const mapper = await import("./services/manufacturing-interview-mapper");
        
        const result = await mapper.initializeRiskScenariosFromInterview(
          assessmentId,
          interviewResponses
        );

        res.json({
          ...result,
          mode: useAI ? "hybrid" : "algorithmic",
          aiConfidence: "medium",
        });
      } catch (error) {
        console.error("Error generating manufacturing risk scenarios:", error);
        res.status(500).json({
          error: "Failed to generate risk scenarios",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Assess single manufacturing threat
  app.post(
    "/api/assessments/:id/manufacturing-interview/assess-single-threat",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { threatId, interviewResponses } = req.body;

        if (!threatId) {
          return res.status(400).json({ error: "threatId is required" });
        }

        const mapper = await import("./services/manufacturing-interview-mapper");
        const { MANUFACTURING_THREATS } = mapper;
        
        const validThreat = MANUFACTURING_THREATS.find((t: any) => t.id === threatId);
        if (!validThreat) {
          return res.status(400).json({
            error: "Invalid threatId",
            validOptions: MANUFACTURING_THREATS.map((t: any) => t.id),
          });
        }

        const threatLikelihood = mapper.calculateThreatLikelihoodFromInterview(interviewResponses, threatId);
        const vulnerability = mapper.calculateVulnerabilityFromInterview(interviewResponses, threatId);
        const impact = mapper.calculateImpactFromInterview(interviewResponses, threatId);
        const inherentRisk = threatLikelihood * vulnerability * impact;
        const normalizedScore = Math.round((inherentRisk / 125) * 100);

        res.json({
          threatId,
          threatLikelihood: { score: threatLikelihood },
          vulnerability: { score: vulnerability },
          impact: { score: impact },
          inherentRisk: {
            score: inherentRisk,
            normalizedScore,
            classification: normalizedScore >= 75 ? "critical" : normalizedScore >= 50 ? "high" : normalizedScore >= 25 ? "medium" : "low",
          },
        });
      } catch (error) {
        console.error("Error assessing single manufacturing threat:", error);
        res.status(500).json({
          error: "Failed to assess threat",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Generate manufacturing narrative summary
  app.post(
    "/api/assessments/:id/manufacturing-interview/generate-narrative",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { results, interviewResponses, facilityName } = req.body;

        if (!results || !Array.isArray(results)) {
          return res.status(400).json({ error: "results array is required" });
        }

        const criticalCount = results.filter((r: any) => r.inherentRisk?.classification === "critical").length;
        const highCount = results.filter((r: any) => r.inherentRisk?.classification === "high").length;

        const narrative = `Manufacturing Facility Security Assessment Summary for ${facilityName || "Manufacturing Facility"}

This assessment identified ${results.length} threat scenarios requiring attention. Of these, ${criticalCount} are classified as critical risk and ${highCount} as high risk.

Key recommendations include strengthening production floor access control, enhancing IP protection measures, implementing insider threat awareness programs, and ensuring CFATS compliance where applicable.

The facility should prioritize addressing critical risks immediately, particularly those related to intellectual property theft and equipment sabotage, while developing a phased approach for medium-term improvements.`;

        res.json({ narrative });
      } catch (error) {
        console.error("Error generating manufacturing narrative:", error);
        res.status(500).json({ error: "Failed to generate narrative" });
      }
    },
  );

  // Calculate manufacturing security score
  app.post(
    "/api/assessments/:id/manufacturing-interview/calculate-security-score",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const mapper = await import("./services/manufacturing-interview-mapper");
        const result = mapper.calculateOverallSecurityScore(interviewResponses);

        res.json(result);
      } catch (error) {
        console.error("Error calculating manufacturing security score:", error);
        res.status(500).json({ error: "Failed to calculate security score" });
      }
    },
  );

  // Get manufacturing vulnerability breakdown
  app.post(
    "/api/assessments/:id/manufacturing-interview/vulnerability-breakdown",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { interviewResponses } = req.body;

        if (!interviewResponses) {
          return res.status(400).json({ error: "interviewResponses is required" });
        }

        const mapper = await import("./services/manufacturing-interview-mapper");
        const { MANUFACTURING_THREATS } = mapper;

        const breakdown = MANUFACTURING_THREATS.map((threat: any) => ({
          threatId: threat.id,
          name: threat.name,
          category: threat.category,
          vulnerability: mapper.calculateVulnerabilityFromInterview(interviewResponses, threat.id),
          threatLikelihood: mapper.calculateThreatLikelihoodFromInterview(interviewResponses, threat.id),
          impact: mapper.calculateImpactFromInterview(interviewResponses, threat.id),
        }));

        res.json({ breakdown });
      } catch (error) {
        console.error("Error getting manufacturing vulnerability breakdown:", error);
        res.status(500).json({ error: "Failed to get vulnerability breakdown" });
      }
    },
  );

  // EXECUTIVE PROTECTION FRAMEWORK ROUTES

  /**
   * Calculate exposure factor from executive profile
   * E = (Public Profile × 0.4) + (Media Exposure × 0.3) + (Net Worth × 0.2) + (Geographic Risk × 0.1)
   */
  function calculateExposureFromProfile(profile: any): number {
    const publicProfileMap: Record<string, number> = {
      private: 1,
      low: 2,
      medium: 3,
      high: 4,
      very_high: 5,
    };

    const mediaExposureMap: Record<string, number> = {
      none: 1,
      low: 2,
      medium: 3,
      high: 4,
      very_high: 5,
    };

    // Map actual netWorthRange enum values to exposure scores
    const netWorthMap: Record<string, number> = {
      under_1m: 1,
      "1m_5m": 2,
      "5m_10m": 2,
      "10m_50m": 3,
      "50m_100m": 4,
      over_100m: 5,
    };

    const publicProfile = publicProfileMap[profile.publicProfile] || 3;
    const mediaExposure =
      mediaExposureMap[profile.mediaExposure || "medium"] || 3;
    const netWorth = netWorthMap[profile.netWorthRange || "10m_50m"] || 3;
    const geographicRisk = 2; // Default to low-medium (could be enhanced with crime data)

    const exposure =
      publicProfile * 0.4 +
      mediaExposure * 0.3 +
      netWorth * 0.2 +
      geographicRisk * 0.1;

    return Math.round(exposure * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calculate risk metrics from profile and scenarios
   */
  async function calculateRiskMetrics(
    assessmentId: string,
    profile: any,
    storage: any,
  ) {
    const exposureFactor = calculateExposureFromProfile(profile);

    // Get all scenarios for this assessment
    const scenarios = await storage.getRiskScenarios(assessmentId);

    // Calculate aggregate risk score
    let totalRisk = 0;
    let criticalCount = 0;
    let highCount = 0;

    for (const scenario of scenarios) {
      totalRisk += scenario.inherentRisk || 0;

      if (scenario.riskLevel === "Critical") criticalCount++;
      if (scenario.riskLevel === "High") highCount++;
    }

    // Calculate average inherent risk and normalize to 0-100 scale
    // EP: max inherentRisk is 500 (5×5×5×4 from T×V×E×I)
    const avgInherentRisk =
      scenarios.length > 0 ? totalRisk / scenarios.length : 0;
    const avgRiskScore = Math.round((avgInherentRisk / 500) * 100);

    // Determine overall risk level based on normalized score and scenario counts
    let riskLevel = "Low";
    if (criticalCount > 0 || avgRiskScore >= 75) {
      riskLevel = "Critical";
    } else if (highCount > 0 || avgRiskScore >= 50) {
      riskLevel = "High";
    } else if (avgRiskScore >= 25) {
      riskLevel = "Medium";
    }

    return {
      exposureFactor,
      riskScore: avgRiskScore,
      riskLevel,
      activeScenarioCount: scenarios.length,
    };
  }

  // Get executive profile for an assessment
  app.get(
    "/api/assessments/:id/executive-profile",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;

        // Get executive profile
        const profile =
          await storage.getExecutiveProfileByAssessment(assessmentId);

        if (!profile) {
          return res.json({
            assessment: req.assessment,
            profile: null,
            analysis: null,
          });
        }

        // Calculate risk metrics from profile and scenarios
        const analysis = await calculateRiskMetrics(
          assessmentId,
          profile,
          storage,
        );

        // Calculate TCOR for EP assessments (if any financial field is defined)
        let tcor = null;
        if (
          profile.annualProtectionBudget !== undefined ||
          profile.insuranceDeductible !== undefined ||
          profile.dailyLossOfValue !== undefined
        ) {
          const { calculateTCOR } = await import(
            "./services/risk-engine/adapters/executive-protection"
          );
          tcor = calculateTCOR({
            annualProtectionBudget: profile.annualProtectionBudget,
            insuranceDeductible: profile.insuranceDeductible,
            dailyLossOfValue: profile.dailyLossOfValue,
            netWorthRange: profile.netWorthRange,
          });
        }

        res.json({
          assessment: req.assessment,
          profile,
          analysis,
          tcor,
        });
      } catch (error) {
        console.error("Error fetching executive profile:", error);
        res.status(500).json({ error: "Failed to fetch executive profile" });
      }
    },
  );

  // Update/Create executive profile and auto-generate EP risk scenarios
  app.patch(
    "/api/assessments/:id/executive-profile",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const assessmentId = req.params.id;
        const profileData = req.body;

        // Validate executive profile data structure
        const executiveProfileSchema = z.object({
          fullName: z.string(),
          title: z.string().optional(),
          companyRole: z.string().optional(),
          publicProfile: z.string().default("medium"),
          netWorthRange: z.string().optional(),
          mediaExposure: z.string().optional(),
          currentSecurityLevel: z.string().default("minimal"),
          hasPersonalProtection: z.boolean().default(false),
          hasPanicRoom: z.boolean().default(false),
          hasArmoredVehicle: z.boolean().default(false),
          // EP-Specific TCOR Fields (coerce to number, reject NaN)
          annualProtectionBudget: z.coerce.number().nonnegative().optional(),
          insuranceDeductible: z.coerce.number().nonnegative().optional(),
          dailyLossOfValue: z.coerce.number().nonnegative().optional(),
        });

        const validatedProfile = executiveProfileSchema.parse(profileData);

        // Check if profile exists for this assessment
        const existingProfile =
          await storage.getExecutiveProfileByAssessment(assessmentId);

        let profile;
        if (existingProfile) {
          // Update existing profile
          profile = await storage.updateExecutiveProfile(
            existingProfile.id,
            validatedProfile,
          );
        } else {
          // Create new profile
          profile = await storage.createExecutiveProfile({
            assessmentId,
            ...validatedProfile,
          });
        }

        if (!profile) {
          return res
            .status(404)
            .json({ error: "Failed to save executive profile" });
        }

        // Auto-generate EP risk scenarios after profile update (non-fatal)
        console.log(
          `🛡️  Triggering EP risk scenario generation for assessment ${assessmentId}`,
        );

        try {
          const { generateExecutiveProtectionRiskScenarios } = await import(
            "./services/risk-engine/generators/executive-protection"
          );
          const scenarioResult = await generateExecutiveProtectionRiskScenarios(
            assessmentId,
            storage,
          );

          console.log(`📊 EP scenario generation result:`, scenarioResult);

          // Calculate risk metrics from profile and scenarios
          const analysis = await calculateRiskMetrics(
            assessmentId,
            profile,
            storage,
          );

          // Calculate TCOR for EP assessments (if any financial field is defined)
          let tcor = null;
          if (
            profile.annualProtectionBudget !== undefined ||
            profile.insuranceDeductible !== undefined ||
            profile.dailyLossOfValue !== undefined
          ) {
            const { calculateTCOR } = await import(
              "./services/risk-engine/adapters/executive-protection"
            );
            tcor = calculateTCOR({
              annualProtectionBudget: profile.annualProtectionBudget,
              insuranceDeductible: profile.insuranceDeductible,
              dailyLossOfValue: profile.dailyLossOfValue,
              netWorthRange: profile.netWorthRange,
            });
          }

          // Return profile with scenario generation metadata and analysis
          res.json({
            profile,
            analysis,
            tcor,
            _scenarioGeneration: scenarioResult,
          });
        } catch (genError) {
          // Scenario generation failed but profile save succeeded
          console.error("⚠️ EP scenario generation failed:", genError);

          // Still calculate metrics even if scenario generation failed
          const analysis = await calculateRiskMetrics(
            assessmentId,
            profile,
            storage,
          );

          // Return success since profile update succeeded, but include error info
          res.json({
            profile,
            analysis,
            _scenarioGeneration: {
              success: false,
              scenariosCreated: 0,
              criticalScenarios: 0,
              summary:
                "Profile updated successfully, but scenario generation failed",
              errors: [
                genError instanceof Error ? genError.message : "Unknown error",
              ],
            },
          });
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Invalid executive profile data",
            details: error.errors,
          });
        }
        console.error("Error updating executive profile:", error);
        res.status(500).json({ error: "Failed to update executive profile" });
      }
    },
  );

  app.post("/api/assessments", async (req, res) => {
    try {
      // Support both JWT (req.user) and session-based auth (req.session.userId)
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Use req.user if available (already fetched by attachTenantContext), otherwise fetch
      const user = req.user || (await storage.getUser(userId));
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
        organizationId: user.organizationId || null,
      });

      // STEP 2: Derive surveyParadigm from validated templateId
      const templateId = validatedData.templateId;
      const surveyParadigm =
        getSurveyParadigmFromTemplate(templateId) || "facility";

      // Add paradigm to validated data
      const dataWithParadigm = { ...validatedData, surveyParadigm };

      // STEP 3: Check tier limits AFTER validation
      const existingAssessments = await storage.getAllAssessments(userId);
      const tier = user.accountTier as AccountTier;

      if (!canCreateAssessment(tier, existingAssessments.length)) {
        return res.status(403).json({
          error: getUpgradeMessage(tier, "assessment"),
          needsUpgrade: true,
        });
      }

      // STEP 4: Create assessment with validated + enriched data
      const assessment = await storage.createAssessment(dataWithParadigm);

      // Auto-populate template questions (templateId is guaranteed to exist here)
      if (templateId) {
        try {
          const templateQuestions =
            await storage.getTemplateQuestions(templateId);

          if (templateQuestions.length > 0) {
            // Copy template questions to the correct table based on paradigm
            if (surveyParadigm === "executive") {
              // For executive paradigm, copy to assessmentQuestions table
              const assessmentQuestions: InsertAssessmentQuestion[] =
                templateQuestions.map((tq) => ({
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
                  evidence: null,
                }));

              await storage.bulkCreateAssessmentQuestions(assessmentQuestions);
              console.log(
                `✓ Auto-populated ${assessmentQuestions.length} assessment questions from template: ${templateId}`,
              );
            } else {
              // For facility paradigm, copy to facilitySurveyQuestions table (existing behavior)
              const facilityQuestions: InsertFacilitySurveyQuestion[] =
                templateQuestions.map((tq) => ({
                  assessmentId: assessment.id,
                  templateQuestionId: tq.questionId, // FIX: Use questionId (string) not id (UUID) for JOIN matching
                  category: tq.category,
                  subcategory: tq.subcategory ?? null,
                  question: tq.question,
                  bestPractice: tq.bestPractice ?? null,
                  rationale: tq.rationale ?? null,
                  importance: tq.importance ?? null,
                  orderIndex: tq.orderIndex,
                  type: tq.type ?? "yes-no",
                  options: tq.options ?? null, // Copy options for checklist questions
                  conditionalOnQuestionId: tq.conditionalOnQuestionId ?? null, // Copy conditional logic
                  showWhenAnswer: tq.showWhenAnswer ?? null, // Copy conditional logic
                  riskDirection: tq.riskDirection ?? "positive", // Copy risk direction (default to positive)
                  response: null,
                  notes: null,
                  evidence: null,
                  recommendations: null,
                  standard: null,
                }));

              await storage.bulkCreateFacilityQuestions(facilityQuestions);
              console.log(
                `✓ Auto-populated ${facilityQuestions.length} survey questions from template: ${templateId}`,
              );
            }
          }
        } catch (templateError) {
          console.error(
            `Error auto-populating template questions:`,
            templateError,
          );
          // Don't fail the assessment creation if template population fails
        }
      }

      // Auto-create facility zones from template suggestions
      if (templateId && assessment.siteId) {
        try {
          const template = ASSESSMENT_TEMPLATES.find(
            (t) => t.id === templateId,
          );

          if (template?.suggestedZones && template.suggestedZones.length > 0) {
            // Get existing zones for this site to avoid duplicates
            const existingZones = await storage.getFacilityZonesBySite(
              assessment.siteId,
            );
            const existingZoneNames = existingZones.map((z) =>
              z.name.toLowerCase(),
            );

            // Create zones that don't already exist
            const zonesToCreate = template.suggestedZones.filter(
              (sz) => !existingZoneNames.includes(sz.name.toLowerCase()),
            );

            for (const suggestedZone of zonesToCreate) {
              await storage.createFacilityZone({
                siteId: assessment.siteId,
                name: suggestedZone.name,
                zoneType: suggestedZone.zoneType,
                securityLevel: suggestedZone.securityLevel,
                description: suggestedZone.description || null,
                floorNumber: null,
                accessRequirements: null,
              });
            }

            if (zonesToCreate.length > 0) {
              console.log(
                `✓ Auto-created ${zonesToCreate.length} facility zones from template: ${templateId}`,
              );
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
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating assessment:", error);
      res.status(500).json({ error: "Failed to create assessment" });
    }
  });

  app.put(
    "/api/assessments/:id",
    verifyAssessmentOwnership,
    async (req, res) => {
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
    },
  );

  app.delete(
    "/api/assessments/:id",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const deleted = await storage.deleteAssessment(id);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting assessment:", error);
        res.status(500).json({ error: "Failed to delete assessment" });
      }
    },
  );

  // Facility Survey routes
  app.get(
    "/api/assessments/:id/facility-survey",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        console.log(`[LOAD DEBUG] Fetching facility-survey for assessment: ${id}`);
        const questions = await storage.getFacilitySurveyQuestions(id);
        const withResponses = questions.filter(q => q.response !== null && q.response !== undefined && q.response !== '');
        console.log(`[LOAD DEBUG] Total questions: ${questions.length}, with responses: ${withResponses.length}`);
        if (withResponses.length > 0) {
          console.log(`[LOAD DEBUG] Sample response:`, JSON.stringify(withResponses[0]));
        }
        res.json(questions);
      } catch (error) {
        console.error("Error fetching facility survey:", error);
        res.status(500).json({ error: "Failed to fetch facility survey" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/facility-survey",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { questions } = req.body;

        if (!Array.isArray(questions)) {
          return res.status(400).json({ error: "Questions must be an array" });
        }

        // Validate each question
        const validatedQuestions = questions.map((q) =>
          insertFacilitySurveyQuestionSchema.parse({ ...q, assessmentId: id }),
        );

        const result = await storage.bulkUpsertFacilityQuestions(
          id,
          validatedQuestions,
        );

        // Update assessment status to facility-survey when facility survey is saved
        const completedQuestions = result.filter(
          (q) => q.response !== null && q.response !== undefined,
        ).length;
        const progress = (completedQuestions / result.length) * 100;

        if (progress >= 80) {
          await storage.updateAssessment(id, {
            status: "facility-survey",
            facilitySurveyCompleted: true,
            facilitySurveyCompletedAt: new Date(),
          });
        }

        res.json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Invalid facility survey data",
            details: error.errors,
          });
        }
        console.error("Error saving facility survey:", error);
        res.status(500).json({ error: "Failed to save facility survey" });
      }
    },
  );

  // Executive Interview routes
  app.get(
    "/api/assessments/:id/executive-interview/questions",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const questions = await storage.getAllExecutiveInterviewQuestions();
        res.json(questions);
      } catch (error) {
        console.error("Error fetching executive interview questions:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch executive interview questions" });
      }
    },
  );

  app.get(
    "/api/assessments/:id/executive-interview/responses",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const responses = await storage.getExecutiveInterviewResponses(id);
        res.json(responses);
      } catch (error) {
        console.error("Error fetching executive interview responses:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch executive interview responses" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/executive-interview/responses",
    verifyAssessmentOwnership,
    async (req, res) => {
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
          textResponse: textResponse || null,
        });

        const response =
          await storage.upsertExecutiveInterviewResponse(validatedResponse);
        res.json(response);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid response data", details: error.errors });
        }
        console.error("Error saving executive interview response:", error);
        res
          .status(500)
          .json({ error: "Failed to save executive interview response" });
      }
    },
  );

  // EP Interview Risk Calculation Routes (using ep-interview-mapper)
  
  // Get EP threats list
  app.get(
    "/api/assessments/:id/ep-interview/threats",
    verifyAssessmentOwnership,
    async (_req, res) => {
      try {
        res.json({
          threats: EP_THREATS,
          controlMapping: EP_THREAT_CONTROL_MAPPING,
        });
      } catch (error) {
        console.error("Error fetching EP threats:", error);
        res.status(500).json({ error: "Failed to fetch EP threats" });
      }
    },
  );

  // Calculate EP risk for a specific threat
  app.post(
    "/api/assessments/:id/ep-interview/calculate-risk",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const epRiskSchema = z.object({
          interviewResponses: z.record(z.any()),
          threatId: z.string().min(1),
        });
        
        const validated = epRiskSchema.safeParse(req.body);
        if (!validated.success) {
          return res.status(400).json({ 
            error: "Invalid request body", 
            details: validated.error.errors 
          });
        }
        
        const { interviewResponses, threatId } = validated.data;
        const riskResult = calculateEPThreatRisk(interviewResponses, threatId);

        res.json({
          threatId,
          ...riskResult,
        });
      } catch (error) {
        console.error("Error calculating EP risk:", error);
        res.status(500).json({ error: "Failed to calculate EP risk" });
      }
    },
  );

  // Calculate all EP risks from interview responses
  app.post(
    "/api/assessments/:id/ep-interview/calculate-all-risks",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        
        const epAllRisksSchema = z.object({
          interviewResponses: z.record(z.any()),
        });
        
        const validated = epAllRisksSchema.safeParse(req.body);
        if (!validated.success) {
          return res.status(400).json({ 
            error: "Invalid request body", 
            details: validated.error.errors 
          });
        }
        
        const { interviewResponses } = validated.data;

        // Calculate exposure factor
        const exposureFactor = calculateExposureFactor(interviewResponses);

        // Calculate risk for each threat
        const riskResults = EP_THREATS.map((threat) => {
          const risk = calculateEPThreatRisk(interviewResponses, threat.id);
          return {
            threatId: threat.id,
            threatName: threat.name,
            category: threat.category,
            ...risk,
          };
        });

        // Sort by normalized risk (highest first)
        riskResults.sort((a, b) => b.normalizedRisk - a.normalizedRisk);

        // Count risk levels
        const riskCounts = {
          critical: riskResults.filter((r) => r.riskLevel === "critical").length,
          high: riskResults.filter((r) => r.riskLevel === "high").length,
          medium: riskResults.filter((r) => r.riskLevel === "medium").length,
          low: riskResults.filter((r) => r.riskLevel === "low").length,
        };

        res.json({
          assessmentId: id,
          exposureFactor,
          riskCounts,
          risks: riskResults,
        });
      } catch (error) {
        console.error("Error calculating all EP risks:", error);
        res.status(500).json({ error: "Failed to calculate EP risks" });
      }
    },
  );

  // Get EP control recommendations for a threat
  app.post(
    "/api/assessments/:id/ep-interview/control-recommendations",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const epControlSchema = z.object({
          interviewResponses: z.record(z.any()),
          threatId: z.string().min(1),
        });
        
        const validated = epControlSchema.safeParse(req.body);
        if (!validated.success) {
          return res.status(400).json({ 
            error: "Invalid request body", 
            details: validated.error.errors 
          });
        }
        
        const { interviewResponses, threatId } = validated.data;
        const recommendations = generateEPControlRecommendations(interviewResponses, threatId);

        res.json({
          threatId,
          recommendedControls: recommendations,
        });
      } catch (error) {
        console.error("Error generating EP control recommendations:", error);
        res.status(500).json({ error: "Failed to generate control recommendations" });
      }
    },
  );

  // Generate EP risk scenarios from interview
  app.post(
    "/api/assessments/:id/ep-interview/generate-scenarios",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        
        const epScenariosSchema = z.object({
          interviewResponses: z.record(z.any()),
        });
        
        const validated = epScenariosSchema.safeParse(req.body);
        if (!validated.success) {
          return res.status(400).json({ 
            error: "Invalid request body", 
            details: validated.error.errors 
          });
        }
        
        const { interviewResponses } = validated.data;
        
        // Use string ID since assessment IDs are UUIDs
        const result = await generateEPRiskScenarios(parseInt(id) || 0, interviewResponses);

        res.json(result);
      } catch (error) {
        console.error("Error generating EP risk scenarios:", error);
        res.status(500).json({ error: "Failed to generate EP risk scenarios" });
      }
    },
  );

  // Assessment Questions routes (for executive paradigm objective assessment questions)
  app.get(
    "/api/assessments/:id/assessment-questions",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const questions = await storage.getAssessmentQuestions(id);
        
        // Get assessment to find template
        const assessment = await storage.getAssessment(id);
        let templateQuestions: any[] = [];
        if (assessment?.templateId) {
          templateQuestions = await storage.getTemplateQuestions(assessment.templateId);
        }
        
        // Enrich questions with options from template_questions
        const enrichedQuestions = questions.map((q) => {
          const match = templateQuestions.find(tq => 
            tq.id === q.templateQuestionId || tq.questionId === q.questionId
          );
          if (match?.options) {
            return { ...q, options: match.options };
          }
          return q;
        });
        
        res.json(enrichedQuestions);
      } catch (error) {
        console.error("Error fetching assessment questions:", error);
        res.status(500).json({ error: "Failed to fetch assessment questions" });
      }
    },
  );

  app.patch(
    "/api/assessments/:id/assessment-questions/:questionId",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { questionId } = req.params;

        // Validate: Only allow updating response, notes, and evidence fields
        // Response can be string, number, boolean, null, OR array of strings (for checkbox/multi-select questions)
        const allowedUpdateSchema = z.object({
          response: z
            .union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())])
            .optional(),
          notes: z.string().nullable().optional(),
          evidence: z.array(z.string()).nullable().optional(),
        });

        const updateData = allowedUpdateSchema.parse(req.body);

        const updated = await storage.updateAssessmentQuestion(
          questionId,
          updateData,
        );

        if (!updated) {
          return res.status(404).json({ error: "Question not found" });
        }

        res.json(updated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid update data", details: error.errors });
        }
        console.error("Error updating assessment question:", error);
        res.status(500).json({ error: "Failed to update assessment question" });
      }
    },
  );

  // Auto-generate risk scenarios from interview responses
  app.post(
    "/api/assessments/:id/generate-scenarios-from-interview",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;

        console.log(
          `🚀 Starting auto-generation of risk scenarios for assessment ${id}`,
        );

        // Import the auto-generation service
        const { autoGenerateScenariosFromInterview } = await import(
          "./services/auto-generate-scenarios"
        );

        // Run auto-generation
        const result = await autoGenerateScenariosFromInterview(id, storage);

        if (!result.success) {
          return res.status(400).json({
            error: "Failed to generate scenarios",
            details: result.errors,
          });
        }

        // Return success with details
        res.json({
          success: true,
          threatsCreated: result.threatsCreated,
          criticalThreats: result.criticalThreats,
          overallRiskLevel: result.overallRiskLevel,
          summary: result.summary,
          warnings: result.errors, // Include warnings even on success
        });
      } catch (error) {
        console.error(
          "Error in generate-scenarios-from-interview endpoint:",
          error,
        );
        res.status(500).json({
          error: "Internal server error during scenario generation",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Auto-generate warehouse risk scenarios from warehouse profile + facility survey
  app.post(
    "/api/assessments/:id/generate-warehouse-scenarios",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;

        console.log(
          `🏭 Starting warehouse risk scenario generation for assessment ${id}`,
        );

        // Import the warehouse generator
        const { generateWarehouseRiskScenarios } = await import(
          "./services/risk-engine/generators/warehouse"
        );

        // Run scenario generation
        const result = await generateWarehouseRiskScenarios(id, storage);

        if (!result.success) {
          return res.status(400).json({
            error: "Failed to generate warehouse scenarios",
            details: result.errors,
          });
        }

        // Return success with details
        res.json({
          success: true,
          scenariosCreated: result.scenariosCreated,
          criticalScenarios: result.criticalScenarios,
          summary: result.summary,
          warnings: result.errors, // Include warnings even on success
        });
      } catch (error) {
        console.error("Error in generate-warehouse-scenarios endpoint:", error);
        res.status(500).json({
          error: "Internal server error during warehouse scenario generation",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // Asset Bridge route - Extract assets from facility survey for Phase 2
  app.post(
    "/api/assessments/:id/extract-assets",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;

        // Get the facility survey questions for this assessment
        const facilityQuestions = await storage.getFacilitySurveyQuestions(id);

        if (facilityQuestions.length === 0) {
          return res
            .status(400)
            .json({ error: "No facility survey data found" });
        }

        // Extract assets from facility survey responses
        const extractedAssets: any[] = [];

        // Map facility survey categories to risk assets
        const assetMappings: Record<
          string,
          { name: string; type: string; description: string }
        > = {
          lighting: {
            name: "Lighting Systems",
            type: "Infrastructure",
            description:
              "Facility lighting infrastructure including perimeter, parking, and emergency lighting",
          },
          surveillance: {
            name: "Surveillance Systems",
            type: "Technology",
            description:
              "CCTV cameras, monitoring equipment, and video surveillance infrastructure",
          },
          "access-control": {
            name: "Access Control Systems",
            type: "Technology",
            description:
              "Door locks, card readers, visitor management, and entry point security",
          },
          barriers: {
            name: "Physical Barriers",
            type: "Infrastructure",
            description:
              "Perimeter fencing, walls, gates, and structural security barriers",
          },
          "intrusion-detection": {
            name: "Intrusion Detection Systems",
            type: "Technology",
            description:
              "Alarm systems, motion sensors, and perimeter detection equipment",
          },
        };

        // Analyze facility survey responses and extract assets
        for (const question of facilityQuestions) {
          if (question.response && question.category) {
            const mapping = assetMappings[question.category];
            if (mapping) {
              // Check if this asset type is already extracted
              const existingAsset = extractedAssets.find(
                (a) => a.name === mapping.name,
              );

              if (!existingAsset) {
                extractedAssets.push({
                  assessmentId: id,
                  name: mapping.name,
                  type: mapping.type,
                  description: mapping.description,
                  source: "facility_survey",
                  sourceId: question.id,
                  criticality: "medium", // Default, can be customized later
                });
              }
            }
          }
        }

        // Add custom asset placeholder for user-defined assets
        extractedAssets.push({
          assessmentId: id,
          name: "Custom Assets",
          type: "Custom",
          description: "User-defined assets specific to this facility",
          source: "custom",
          sourceId: null,
          criticality: "medium",
        });

        // Validate and save the extracted assets using the robust upsert method
        const validatedAssets = extractedAssets.map((asset) =>
          insertRiskAssetSchema.parse(asset),
        );

        const savedAssets = await storage.bulkUpsertRiskAssets(
          id,
          validatedAssets,
        );

        res.json({
          message: "Assets extracted successfully from facility survey",
          extractedCount: savedAssets.length,
          assets: savedAssets,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid asset data", details: error.errors });
        }
        console.error("Error extracting assets:", error);
        res
          .status(500)
          .json({ error: "Failed to extract assets from facility survey" });
      }
    },
  );

  // Risk Assets routes
  app.get(
    "/api/assessments/:id/risk-assets",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const assets = await storage.getRiskAssets(id);
        res.json(assets);
      } catch (error) {
        console.error("Error fetching risk assets:", error);
        res.status(500).json({ error: "Failed to fetch risk assets" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/risk-assets",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const assetData = insertRiskAssetSchema.parse({
          ...req.body,
          assessmentId: id,
        });
        const result = await storage.createRiskAsset(assetData);
        res.status(201).json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid asset data", details: error.errors });
        }
        console.error("Error creating risk asset:", error);
        res.status(500).json({ error: "Failed to create risk asset" });
      }
    },
  );

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

  app.post(
    "/api/assessments/:id/risk-assets/bulk",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { assets } = req.body;

        if (!Array.isArray(assets)) {
          return res.status(400).json({ error: "Assets must be an array" });
        }

        const validatedAssets = assets.map((asset) =>
          insertRiskAssetSchema.parse({ ...asset, assessmentId: id }),
        );

        const result = await storage.bulkUpsertRiskAssets(id, validatedAssets);
        res.json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid assets data", details: error.errors });
        }
        console.error("Error bulk upserting assets:", error);
        res.status(500).json({ error: "Failed to bulk upsert assets" });
      }
    },
  );

  // Risk Scenarios routes
  app.get(
    "/api/assessments/:id/risk-scenarios",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const scenarios = await storage.getRiskScenarios(id);

        // Lazy migration: Convert legacy 5-25 scale scenarios to normalized 0-100 scale
        const migratedScenarios = await Promise.all(
          scenarios.map(async (scenario) => {
            // Detect legacy data: inherentRisk <= 25 AND residualRisk <= 25 AND impactScore <= 5
            // The additional residualRisk check ensures we don't reprocess already-normalized low-risk scenarios
            const isLegacyData =
              (scenario.inherentRisk ?? 0) <= 25 &&
              (scenario.residualRisk ?? 0) <= 25 &&
              (scenario.impactScore ?? 5) <= 5;

            if (isLegacyData && scenario.id) {
              // Convert old 1-25 scale to normalized 0-100 scale
              const oldInherentScore = scenario.inherentRisk ?? 9;
              const oldResidualScore =
                scenario.residualRisk ?? oldInherentScore;

              const normalizedInherentRisk = Math.round(
                (oldInherentScore / 25) * 100,
              );
              const normalizedResidualRisk = Math.round(
                (oldResidualScore / 25) * 100,
              );

              // Determine risk level based on 0-100 thresholds
              let riskLevel = "Low";
              if (normalizedResidualRisk >= 75) riskLevel = "Critical";
              else if (normalizedResidualRisk >= 50) riskLevel = "High";
              else if (normalizedResidualRisk >= 25) riskLevel = "Medium";

              // Update scenario in database with normalized values
              const updatedScenario = {
                ...scenario,
                inherentRisk: normalizedInherentRisk,
                residualRisk: normalizedResidualRisk,
                riskLevel,
              };

              console.log(
                `[Migration] Scenario ${scenario.id}: ${oldInherentScore}/${oldResidualScore} (1-25) → ${normalizedInherentRisk}/${normalizedResidualRisk} (0-100), level: ${riskLevel}`,
              );

              await storage.updateRiskScenario(scenario.id, updatedScenario);
              return updatedScenario;
            }

            return scenario;
          }),
        );

        res.json(migratedScenarios);
      } catch (error) {
        console.error("Error fetching risk scenarios:", error);
        res.status(500).json({ error: "Failed to fetch risk scenarios" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/risk-scenarios",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const scenarioData = insertRiskScenarioSchema.parse({
          ...req.body,
          assessmentId: id,
        });

        // Automatic risk calculation (Task 9)
        const {
          calculateInherentRisk,
          calculateControlEffectiveness,
          calculateResidualRiskNBS,
        } = await import("../shared/riskCalculations");

        // Use numeric scores if provided, otherwise default to 3
        const likelihoodScore = scenarioData.likelihoodScore ?? 3;
        const impactScore = scenarioData.impactScore ?? 3;

        // Calculate inherent risk (L × I)
        const inherentRisk = calculateInherentRisk(
          likelihoodScore,
          impactScore,
        );

        // Calculate control effectiveness if threatLibraryId is provided
        let residualRisk = inherentRisk;
        let controlEffectiveness = 0;
        if (scenarioData.threatLibraryId) {
          const surveyResponses =
            await storage.getSurveyResponsesWithControlWeights(
              id,
              scenarioData.threatLibraryId,
            );
          controlEffectiveness = calculateControlEffectiveness(surveyResponses);
          residualRisk = calculateResidualRiskNBS(
            inherentRisk,
            controlEffectiveness,
          );
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
          return res
            .status(400)
            .json({ error: "Invalid scenario data", details: error.errors });
        }
        console.error("Error creating risk scenario:", error);
        res.status(500).json({ error: "Failed to create risk scenario" });
      }
    },
  );

  // Generate risk scenarios from interview data
  app.post(
    "/api/assessments/:id/risk-scenarios/generate",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id: assessmentId } = req.params;
        const { forceRegenerate } = req.body;

        // Check if risk scenarios already exist
        const existingScenarios = await storage.getRiskScenarios(assessmentId);

        if (existingScenarios.length > 0 && !forceRegenerate) {
          return res.status(409).json({
            error: "Risk scenarios already exist for this assessment",
            message:
              "Set forceRegenerate: true to delete existing scenarios and regenerate",
            existingCount: existingScenarios.length,
          });
        }

        // Delete existing scenarios if forceRegenerate is true
        if (existingScenarios.length > 0 && forceRegenerate) {
          await storage.bulkUpsertRiskScenarios(assessmentId, []); // Deletes all existing
          console.log(
            `[RiskScenarios] Deleted ${existingScenarios.length} existing scenarios for assessment ${assessmentId}`,
          );
        }

        // Import and call the risk scenario generator
        const { generateRiskScenariosForAssessment } = await import(
          "./services/office-interview-risk-mapper-corrected"
        );
        const result = await generateRiskScenariosForAssessment(assessmentId);

        if (!result.success) {
          return res.status(400).json({
            error: "Failed to generate risk scenarios",
            message: "No interview responses found for this assessment",
          });
        }

        res.status(201).json({
          success: true,
          message: `Generated ${result.generatedScenarios} risk scenarios`,
          ...result,
        });
      } catch (error) {
        console.error("Error generating risk scenarios:", error);
        res.status(500).json({ error: "Failed to generate risk scenarios" });
      }
    },
  );

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
      const {
        calculateInherentRisk,
        calculateControlEffectiveness,
        calculateResidualRiskNBS,
      } = await import("../shared/riskCalculations");

      const likelihoodScore =
        updateData.likelihoodScore ?? resource.likelihoodScore ?? 3;
      const impactScore = updateData.impactScore ?? resource.impactScore ?? 3;
      const threatLibraryId =
        updateData.threatLibraryId ?? resource.threatLibraryId;

      // Recalculate inherent risk
      const inherentRisk = calculateInherentRisk(likelihoodScore, impactScore);

      // Recalculate control effectiveness
      let residualRisk = inherentRisk;
      let controlEffectiveness = 0;
      if (threatLibraryId) {
        const surveyResponses =
          await storage.getSurveyResponsesWithControlWeights(
            resource.assessmentId,
            threatLibraryId,
          );
        controlEffectiveness = calculateControlEffectiveness(surveyResponses);
        residualRisk = calculateResidualRiskNBS(
          inherentRisk,
          controlEffectiveness,
        );
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
      const surveyQuestions = await storage.getFacilitySurveyQuestions(
        scenario.assessmentId,
      );
      const surveyResponses: Record<string, any> | null =
        surveyQuestions && surveyQuestions.length > 0
          ? surveyQuestions.reduce(
              (acc, q) => {
                // Production data may have questionId field (from template_questions.questionId like "dock_4")
                // Fall back to template UUID, category, or record ID
                const questionData = q as any; // Type assertion to access runtime fields
                const key =
                  questionData.questionId || // Primary: questionId from template ("dock_4", "perimeter_1")
                  q.templateQuestionId || // Fallback 1: template UUID
                  q.category || // Fallback 2: category name
                  q.id; // Fallback 3: record UUID

                if (q.response && key) {
                  // Extract value from response JSONB - handle both simple and complex formats
                  let value = q.response;
                  if (typeof q.response === "object" && q.response !== null) {
                    // Try to extract nested value/text/answer/optionId fields from JSONB
                    const responseObj = q.response as any;
                    value =
                      responseObj.value ||
                      responseObj.text ||
                      responseObj.answer ||
                      responseObj.optionId ||
                      responseObj.selected ||
                      q.response; // Fallback to full object
                  }
                  acc[key] = value;
                }
                return acc;
              },
              {} as Record<string, any>,
            )
          : null;

      // Generate AI narrative using template-aware factory
      const { generateRiskNarrative } = await import(
        "./services/ai/narrative-generator"
      );
      const narrative = await generateRiskNarrative(
        scenario,
        assessment,
        surveyResponses,
      );

      // Update only the threatDescription field to avoid corrupting other data
      const updatedScenario = await storage.updateRiskScenario(id, {
        threatDescription: narrative,
      });

      console.log(
        `✅ Generated and saved AI narrative for scenario: ${scenario.scenario}`,
      );

      res.json({
        success: true,
        narrative,
        updatedScenario,
      });
    } catch (error) {
      console.error("❌ Error generating risk narrative:", error);
      res.status(500).json({
        error: "Failed to generate AI narrative",
        message: error instanceof Error ? error.message : "Unknown error",
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

  app.post(
    "/api/assessments/:id/risk-scenarios/bulk",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { scenarios } = req.body;

        if (!Array.isArray(scenarios)) {
          return res.status(400).json({ error: "Scenarios must be an array" });
        }

        const validatedScenarios = scenarios.map((scenario) =>
          insertRiskScenarioSchema.parse({ ...scenario, assessmentId: id }),
        );

        const result = await storage.bulkUpsertRiskScenarios(
          id,
          validatedScenarios,
        );
        res.json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid scenarios data", details: error.errors });
        }
        console.error("Error bulk upserting scenarios:", error);
        res.status(500).json({ error: "Failed to bulk upsert scenarios" });
      }
    },
  );

  // Task 11: Risk Matrix endpoint - returns scenarios grouped by risk level for heatmap
  app.get(
    "/api/assessments/:id/risk-matrix",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const scenarios = await storage.getRiskScenarios(id);

        // Group scenarios by likelihood (1-5) and impact (1-5) for 5x5 matrix
        const matrix: { [key: string]: typeof scenarios } = {};

        scenarios.forEach((scenario) => {
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
            critical: scenarios.filter((s) => (s.residualRisk ?? 0) >= 20)
              .length,
            high: scenarios.filter(
              (s) => (s.residualRisk ?? 0) >= 12 && (s.residualRisk ?? 0) < 20,
            ).length,
            medium: scenarios.filter(
              (s) => (s.residualRisk ?? 0) >= 6 && (s.residualRisk ?? 0) < 12,
            ).length,
            low: scenarios.filter((s) => (s.residualRisk ?? 0) < 6).length,
          },
        });
      } catch (error) {
        console.error("Error fetching risk matrix:", error);
        res.status(500).json({ error: "Failed to fetch risk matrix" });
      }
    },
  );

  // Task 12: Cascading recalculation - recalculates all scenarios when survey answers change
  app.post(
    "/api/assessments/:id/recalc-controls",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const scenarios = await storage.getRiskScenarios(id);

        const {
          calculateInherentRisk,
          calculateControlEffectiveness,
          calculateResidualRiskNBS,
        } = await import("../shared/riskCalculations");

        // Recalculate each scenario
        const updatedScenarios = await Promise.all(
          scenarios.map(async (scenario) => {
            const likelihoodScore = scenario.likelihoodScore ?? 3;
            const impactScore = scenario.impactScore ?? 3;

            // Recalculate inherent risk
            const inherentRisk = calculateInherentRisk(
              likelihoodScore,
              impactScore,
            );

            // Recalculate control effectiveness if threat is specified
            let residualRisk = inherentRisk;
            let controlEffectiveness = 0;
            if (scenario.threatLibraryId) {
              const surveyResponses =
                await storage.getSurveyResponsesWithControlWeights(
                  id,
                  scenario.threatLibraryId,
                );
              controlEffectiveness =
                calculateControlEffectiveness(surveyResponses);
              residualRisk = calculateResidualRiskNBS(
                inherentRisk,
                controlEffectiveness,
              );
            }

            // Update the scenario with new calculations
            return await storage.updateRiskScenario(scenario.id, {
              inherentRisk,
              controlEffectiveness,
              residualRisk,
            });
          }),
        );

        res.json({
          updated: updatedScenarios.length,
          scenarios: updatedScenarios,
        });
      } catch (error) {
        console.error("Error recalculating controls:", error);
        res.status(500).json({ error: "Failed to recalculate controls" });
      }
    },
  );

  // Treatment Plans routes
  app.get(
    "/api/assessments/:id/treatment-plans",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const plans = await storage.getTreatmentPlans(id);
        res.json(plans);
      } catch (error) {
        console.error("Error fetching treatment plans:", error);
        res.status(500).json({ error: "Failed to fetch treatment plans" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/treatment-plans",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const planData = insertTreatmentPlanSchema.parse({
          ...req.body,
          assessmentId: id,
        });
        const result = await storage.createTreatmentPlan(planData);
        res.status(201).json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Invalid treatment plan data",
            details: error.errors,
          });
        }
        console.error("Error creating treatment plan:", error);
        res.status(500).json({ error: "Failed to create treatment plan" });
      }
    },
  );

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

  app.post(
    "/api/assessments/:id/treatment-plans/bulk",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { plans } = req.body;

        if (!Array.isArray(plans)) {
          return res.status(400).json({ error: "Plans must be an array" });
        }

        const validatedPlans = plans.map((plan) =>
          insertTreatmentPlanSchema.parse({ ...plan, assessmentId: id }),
        );

        const result = await storage.bulkUpsertTreatmentPlans(
          id,
          validatedPlans,
        );
        res.json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Invalid treatment plans data",
            details: error.errors,
          });
        }
        console.error("Error bulk upserting treatment plans:", error);
        res
          .status(500)
          .json({ error: "Failed to bulk upsert treatment plans" });
      }
    },
  );

  // Vulnerabilities routes
  app.get(
    "/api/assessments/:id/vulnerabilities",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const vulnerabilities = await storage.getVulnerabilities(id);
        res.json(vulnerabilities);
      } catch (error) {
        console.error("Error fetching vulnerabilities:", error);
        res.status(500).json({ error: "Failed to fetch vulnerabilities" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/vulnerabilities",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const vulnerabilityData = insertVulnerabilitySchema.parse({
          ...req.body,
          assessmentId: id,
        });
        const result = await storage.createVulnerability(vulnerabilityData);
        res.status(201).json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Invalid vulnerability data",
            details: error.errors,
          });
        }
        console.error("Error creating vulnerability:", error);
        res.status(500).json({ error: "Failed to create vulnerability" });
      }
    },
  );

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
  app.get(
    "/api/assessments/:id/controls",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const controls = await storage.getControls(id);
        res.json(controls);
      } catch (error) {
        console.error("Error fetching controls:", error);
        res.status(500).json({ error: "Failed to fetch controls" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/controls",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const controlData = insertControlSchema.parse({
          ...req.body,
          assessmentId: id,
        });
        const result = await storage.createControl(controlData);
        res.status(201).json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid control data", details: error.errors });
        }
        console.error("Error creating control:", error);
        res.status(500).json({ error: "Failed to create control" });
      }
    },
  );

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
      const { assessmentId, riskScenarioId, vulnerabilityId, ...updateData } =
        req.body;
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
  app.get(
    "/api/assessments/:id/questions",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const questions = await storage.getAssessmentQuestions(id);
        res.json(questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: "Failed to fetch questions" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/questions/bulk",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { questions } = req.body;

        if (!Array.isArray(questions)) {
          return res.status(400).json({ error: "Questions must be an array" });
        }

        // Validate each question
        const validatedQuestions = questions.map((q) =>
          insertAssessmentQuestionSchema.parse({ ...q, assessmentId: id }),
        );

        const result = await storage.bulkUpsertQuestions(
          id,
          validatedQuestions,
        );

        // Update assessment status to risk-assessment when ASIS questions are saved
        await storage.updateAssessment(id, {
          status: "risk-assessment",
          riskAssessmentCompleted: true,
          riskAssessmentCompletedAt: new Date(),
        });

        res.json(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid question data", details: error.errors });
        }
        console.error("Error saving questions:", error);
        res.status(500).json({ error: "Failed to save questions" });
      }
    },
  );

  // Facility Survey Questions routes
  app.get(
    "/api/assessments/:id/facility-survey-questions",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const questions = await storage.getFacilitySurveyQuestions(id);
        
        // Get assessment to find template
        const assessment = await storage.getAssessment(id);
        let templateQuestions: any[] = [];
        if (assessment?.templateId) {
          templateQuestions = await storage.getTemplateQuestions(assessment.templateId);
        }
        
        // Enrich questions with options from template_questions
        const enrichedQuestions = questions.map((q) => {
          const match = templateQuestions.find(tq => 
            tq.id === q.templateQuestionId || tq.questionId === q.questionId
          );
          if (match?.options) {
            return { ...q, options: match.options };
          }
          return q;
        });
        
        res.json(enrichedQuestions);
      } catch (error) {
        console.error("Error fetching facility survey questions:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch facility survey questions" });
      }
    },
  );

  app.patch(
    "/api/assessments/:id/facility-survey-questions/:questionId",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id: assessmentId, questionId } = req.params;
        const updateData = req.body;

        console.log(
          "PATCH facility-survey-questions - Received payload:",
          JSON.stringify(updateData, null, 2),
        );

        // Sanitize: don't allow changing assessmentId or templateQuestionId
        const { assessmentId: _, templateQuestionId, ...safeData } = updateData;

        const updated = await storage.updateFacilitySurveyQuestion(
          questionId,
          safeData,
        );

        if (!updated) {
          return res.status(404).json({ error: "Question not found" });
        }

        console.log(
          "PATCH facility-survey-questions - Saved successfully:",
          questionId,
        );
        res.json(updated);
      } catch (error) {
        console.error("Error updating facility survey question:", error);
        res.status(500).json({ error: "Failed to update question" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/facility-survey-questions",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const questionData = req.body;

        console.log(
          "POST facility-survey-questions - Received payload:",
          JSON.stringify(questionData, null, 2),
        );

        const validatedQuestion = insertFacilitySurveyQuestionSchema.parse({
          ...questionData,
          assessmentId: id,
        });

        const created =
          await storage.createFacilitySurveyQuestion(validatedQuestion);

        console.log(
          "POST facility-survey-questions - Created successfully:",
          created.id,
        );
        res.status(201).json(created);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error(
            "POST facility-survey-questions - Zod validation failed:",
            error.errors,
          );
          return res
            .status(400)
            .json({ error: "Invalid question data", details: error.errors });
        }
        console.error("Error creating facility survey question:", error);
        res.status(500).json({ error: "Failed to create question" });
      }
    },
  );

  // AI Risk Analysis routes
  app.post(
    "/api/assessments/:id/analyze",
    verifyAssessmentOwnership,
    async (req, res) => {
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
            needsUpgrade: true,
          });
        }

        const { id } = req.params;
        const assessment = await storage.getAssessmentWithQuestions(id);

        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        // Check for enhanced risk assessment data (assets and scenarios)
        const hasEnhancedData =
          assessment.riskAssets &&
          assessment.riskAssets.length > 0 &&
          assessment.riskScenarios &&
          assessment.riskScenarios.length > 0;

        // Check for facility survey questions
        const hasFacilitySurvey =
          assessment.facilityQuestions &&
          assessment.facilityQuestions.length > 0;

        // Check for legacy assessment questions
        const hasLegacyData =
          assessment.questions && assessment.questions.length > 0;

        if (!hasEnhancedData && !hasFacilitySurvey && !hasLegacyData) {
          return res.status(400).json({
            error:
              "Assessment has no data to analyze. Please complete either the facility survey or the enhanced risk assessment.",
          });
        }

        // Generate AI analysis
        const analysis = await openaiService.analyzeSecurityRisks(assessment);

        // Save risk insights to storage
        const savedInsights = await storage.bulkCreateRiskInsights(
          analysis.insights,
        );

        // Calculate risk level based on insights
        const criticalCount = savedInsights.filter(
          (i) => i.severity === "critical",
        ).length;
        const highCount = savedInsights.filter(
          (i) => i.severity === "high",
        ).length;

        let riskLevel = "low";
        if (criticalCount > 0) riskLevel = "critical";
        else if (highCount > 2) riskLevel = "high";
        else if (
          highCount > 0 ||
          savedInsights.filter((i) => i.severity === "medium").length > 3
        )
          riskLevel = "medium";

        // Update assessment with risk level, executive summary, and completed status
        await storage.updateAssessment(id, {
          riskLevel,
          executiveSummary: analysis.executiveSummary,
          status: "completed",
          completedAt: new Date(),
        });

        res.json({
          overallRiskScore: analysis.overallRiskScore,
          riskLevel,
          insights: savedInsights,
          executiveSummary: analysis.executiveSummary,
        });
      } catch (error) {
        console.error("Error analyzing assessment:", error);
        res.status(500).json({ error: "Failed to analyze assessment" });
      }
    },
  );

  app.get(
    "/api/assessments/:id/insights",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const insights = await storage.getRiskInsights(id);
        res.json(insights);
      } catch (error) {
        console.error("Error fetching insights:", error);
        res.status(500).json({ error: "Failed to fetch insights" });
      }
    },
  );

  // Reports routes
  app.get(
    "/api/assessments/:id/reports",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const reports = await storage.getReports(id);
        res.json(reports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
      }
    },
  );

  app.post(
    "/api/assessments/:id/reports",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { type, title, format } = req.body;

        if (!type || !title || !format) {
          return res
            .status(400)
            .json({ error: "Type, title, and format are required" });
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
          status: "generating",
        });

        const report = await storage.createReport(reportData);

        // Generate report content asynchronously
        try {
          const content = await openaiService.generateReportContent(
            assessment,
            type,
          );

          // Update report with generated content
          await storage.updateReport(report.id, {
            status: "ready",
            generatedAt: new Date(),
            filePath: `/reports/${report.id}.${format}`,
            fileSize: `${Math.round(content.length / 1024)}KB`,
          });

          const updatedReport = await storage.getReport(report.id);
          res.status(201).json(updatedReport);
        } catch (error) {
          await storage.updateReport(report.id, { status: "error" });
          throw error;
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid report data", details: error.errors });
        }
        console.error("Error generating report:", error);
        res.status(500).json({ error: "Failed to generate report" });
      }
    },
  );

  // PDF Report Generation endpoint
  app.post(
    "/api/assessments/:id/generate-report",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        // Support both session and JWT authentication
        const userId = req.session?.userId;
        if (!userId) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const { id } = req.params;

        console.log(`📊 Starting PDF generation for assessment ${id}...`);

        // Generate PDF report with template-specific features
        const pdfPath = await generateAssessmentReport(id, userId);

        // Read the generated PDF
        const fs = await import("fs/promises");
        const pdfBuffer = await fs.readFile(pdfPath);

        // Send PDF as download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="security-assessment-${id}.pdf"`,
        );
        res.setHeader("Content-Length", pdfBuffer.length.toString());
        res.send(pdfBuffer);

        // Clean up temp file after sending
        setTimeout(async () => {
          try {
            await fs.unlink(pdfPath);
            console.log(`🗑️  Cleaned up temporary PDF: ${pdfPath}`);
          } catch (error) {
            console.error("Error cleaning up PDF:", error);
          }
        }, 5000);
      } catch (error) {
        console.error("Error generating PDF report:", error);
        res.status(500).json({
          error: "Failed to generate PDF report",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  // HTML Preview endpoint - returns the same HTML template used for PDF generation
  app.get(
    "/api/assessments/:id/preview-report-html",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        // Support both session and JWT authentication
        const userId = req.session?.userId;
        if (!userId) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const { id } = req.params;

        console.log(`👁️ Generating HTML preview for assessment ${id}...`);

        // Fetch assessment with authorization check
        const assessment = await db
          .select()
          .from(assessments)
          .where(and(eq(assessments.id, id), eq(assessments.userId, userId)))
          .limit(1)
          .then((rows) => rows[0]);

        if (!assessment) {
          return res
            .status(404)
            .json({ error: "Assessment not found or access denied" });
        }

        // Fetch risk scenarios ordered by severity
        const risks = await db
          .select()
          .from(riskScenarios)
          .where(eq(riskScenarios.assessmentId, id))
          .orderBy(desc(riskScenarios.inherentRisk));

        // Fetch photo evidence
        const photos: any[] = [];

        // Use AI-generated Executive Summary from assessment record or generate fallback
        // Uses the same fetchExecutiveSummary function as PDF generation for parity
        const { fetchExecutiveSummary } = await import(
          "./services/reporting/pdf-generator"
        );
        const executiveSummary =
          assessment.executiveSummary || (await fetchExecutiveSummary(id));

        // Calculate template-specific metrics
        const { calculateTemplateMetrics } = await import(
          "./services/reporting/template-metrics"
        );
        const templateMetrics = calculateTemplateMetrics(assessment, risks);

        // Render the same HTML used for PDF generation
        const { renderReportHTML } = await import("./templates/master-report");
        const htmlContent = await renderReportHTML({
          assessment,
          risks,
          photos,
          executiveSummary,
          templateMetrics,
        });

        // Return HTML content for iframe preview
        res.setHeader("Content-Type", "text/html");
        res.send(htmlContent);
      } catch (error) {
        console.error("Error generating HTML preview:", error);
        res.status(500).json({
          error: "Failed to generate preview",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  app.get(
    "/api/reports/:id/download",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const { id } = req.params;
        const report = await storage.getReport(id);

        if (!report) {
          return res.status(404).json({ error: "Report not found" });
        }

        if (report.status !== "ready") {
          return res
            .status(400)
            .json({ error: "Report is not ready for download" });
        }

        // In a real implementation, you would serve the actual file
        // For now, return report metadata
        res.json({
          id: report.id,
          title: report.title,
          format: report.format,
          downloadUrl: `/api/reports/${id}/download`,
          message: "Report download would be available here",
        });
      } catch (error) {
        console.error("Error downloading report:", error);
        res.status(500).json({ error: "Failed to download report" });
      }
    },
  );

  // Evidence Upload/Download/Delete routes
  app.post(
    "/api/assessments/:id/evidence",
    verifyAssessmentOwnership,
    upload.fields([{ name: "photo", maxCount: 1 }]),
    async (req, res) => {
      try {
        const { questionId, questionType } = req.body;

        if (!questionId || !questionType) {
          return res
            .status(400)
            .json({ error: "questionId and questionType are required" });
        }

        if (!["facility", "assessment"].includes(questionType)) {
          return res
            .status(400)
            .json({ error: "questionType must be 'facility' or 'assessment'" });
        }

        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
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
          questionId,
        );

        if (questionType === "facility") {
          const question = await storage.getFacilitySurveyQuestion(questionId);
          if (!question || question.assessmentId !== assessmentId) {
            await objectStorageService.deleteEvidence(evidencePath);
            return res.status(404).json({ error: "Question not found" });
          }

          const currentEvidence = question.evidence || [];
          if (currentEvidence.length >= 10) {
            await objectStorageService.deleteEvidence(evidencePath);
            return res
              .status(400)
              .json({ error: "Maximum 10 evidence photos per question" });
          }

          const updatedQuestion = await storage.appendFacilityQuestionEvidence(
            questionId,
            evidencePath,
          );

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
            return res
              .status(400)
              .json({ error: "Maximum 10 evidence photos per question" });
          }

          const updatedQuestion =
            await storage.appendAssessmentQuestionEvidence(
              questionId,
              evidencePath,
            );

          if (!updatedQuestion) {
            await objectStorageService.deleteEvidence(evidencePath);
            return res.status(500).json({ error: "Failed to update question" });
          }
        }

        res.json({
          success: true,
          evidencePath,
          filename: file.originalname,
        });
      } catch (error: any) {
        console.error("Error uploading evidence:", error);
        if (error.message === "Only image files are allowed") {
          return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to upload evidence" });
      }
    },
  );

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

      const assessmentId = metadata.metadata?.assessmentId as
        | string
        | undefined;
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

  app.delete(
    "/api/assessments/:id/evidence",
    verifyAssessmentOwnership,
    async (req, res) => {
      try {
        const { questionId, questionType, evidencePath } = req.body;

        if (!questionId || !questionType || !evidencePath) {
          return res.status(400).json({
            error: "questionId, questionType, and evidencePath are required",
          });
        }

        if (!["facility", "assessment"].includes(questionType)) {
          return res
            .status(400)
            .json({ error: "questionType must be 'facility' or 'assessment'" });
        }

        const assessmentId = req.params.id;

        if (questionType === "facility") {
          const question = await storage.getFacilitySurveyQuestion(questionId);
          if (!question || question.assessmentId !== assessmentId) {
            return res.status(404).json({ error: "Question not found" });
          }

          const currentEvidence = question.evidence || [];
          const updatedEvidence = currentEvidence.filter(
            (e) => e !== evidencePath,
          );

          await storage.updateFacilitySurveyQuestion(questionId, {
            evidence: updatedEvidence,
          });
        } else {
          const question = await storage.getAssessmentQuestion(questionId);
          if (!question || question.assessmentId !== assessmentId) {
            return res.status(404).json({ error: "Question not found" });
          }

          const currentEvidence = question.evidence || [];
          const updatedEvidence = currentEvidence.filter(
            (e) => e !== evidencePath,
          );

          await storage.updateAssessmentQuestion(questionId, {
            evidence: updatedEvidence,
          });
        }

        const objectStorageService = new ObjectStorageService();
        await objectStorageService.deleteEvidence(evidencePath);

        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting evidence:", error);
        res.status(500).json({ error: "Failed to delete evidence" });
      }
    },
  );

  // Statistics/Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // Support both JWT (req.user) and session-based auth (req.session.userId)
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const assessments = await storage.getAllAssessments(userId);

      const stats = {
        totalAssessments: assessments.length,
        activeAssessments: assessments.filter((a) => a.status === "in-progress")
          .length,
        completedThisMonth: assessments.filter((a) => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return (
            a.status === "completed" &&
            a.completedAt &&
            new Date(a.completedAt) > monthAgo
          );
        }).length,
        averageRiskScore:
          assessments.length > 0
            ? assessments.reduce((sum, a) => {
                const score =
                  a.riskLevel === "critical"
                    ? 9
                    : a.riskLevel === "high"
                      ? 7
                      : a.riskLevel === "medium"
                        ? 5
                        : 3;
                return sum + score;
              }, 0) / assessments.length
            : 0,
        riskDistribution: {
          low: assessments.filter((a) => a.riskLevel === "low").length,
          medium: assessments.filter((a) => a.riskLevel === "medium").length,
          high: assessments.filter((a) => a.riskLevel === "high").length,
          critical: assessments.filter((a) => a.riskLevel === "critical")
            .length,
        },
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // ==========================================
  // Report Generation Routes (Phase 3)
  // ==========================================

  // Import report generation services
  const {
    generateReport,
    saveGeneratedReport,
    getGeneratedReports,
    getGeneratedReport,
    getAllRecipes,
    getRecipe,
  } = await import("./services/reporting/report-generator");
  const { isAnthropicConfigured } = await import(
    "./services/anthropic-service"
  );

  // Check if Anthropic API is configured (public - no auth needed)
  app.get("/api/reports/status", async (_req, res) => {
    try {
      const configured = isAnthropicConfigured();
      res.json({
        anthropicConfigured: configured,
        message: configured
          ? "Ready to generate reports"
          : "Anthropic API key not configured",
      });
    } catch (error) {
      console.error("Error checking report status:", error);
      res.status(500).json({ error: "Failed to check report status" });
    }
  });

  // Get all available report recipes (global config - no tenant context needed)
  app.get("/api/reports/recipes", async (_req, res) => {
    try {
      const recipes = await getAllRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ error: "Failed to fetch report recipes" });
    }
  });

  // Get a specific recipe (global config - no tenant context needed)
  app.get("/api/reports/recipes/:recipeId", async (req, res) => {
    try {
      const { recipeId } = req.params;
      const recipe = await getRecipe(recipeId);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ error: "Failed to fetch recipe" });
    }
  });

  // Generate a new report for an assessment (protected - requires org permission + assessment ownership)
  app.post(
    "/api/assessments/:id/reports/generate",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { recipeId } = req.body;
        const organizationId = req.organizationId;

        if (!recipeId) {
          return res.status(400).json({ error: "recipeId is required" });
        }

        // Verify the assessment belongs to the user's organization
        if (!organizationId) {
          return res
            .status(403)
            .json({ error: "Organization context required" });
        }
        const tenantStorage = new TenantStorage(db as any, organizationId);
        const assessment = await tenantStorage.getAssessment(id);
        if (!assessment) {
          return res
            .status(404)
            .json({ error: "Assessment not found or access denied" });
        }

        if (!isAnthropicConfigured()) {
          return res.status(503).json({
            error: "Report generation unavailable",
            message: "Anthropic API key is not configured",
          });
        }

        console.log(
          `[API] Generating report for assessment ${id} with recipe ${recipeId}`,
        );

        const result = await generateReport(id, recipeId);

        // Get userId from session if available
        const userId = req.session?.userId;
        const savedReportId = await saveGeneratedReport(result, userId);

        res.json({
          reportId: savedReportId,
          recipeId: result.recipeId,
          assessmentId: result.assessmentId,
          generatedAt: result.generatedAt,
          sectionsGenerated: result.sections.length,
          totalTokensUsed: result.totalTokensUsed,
          totalNarrativeWords: result.totalNarrativeWords,
          sections: result.sections.map((s) => ({
            id: s.id,
            title: s.title,
            order: s.order,
            hasNarrative: !!s.narrativeContent,
            hasTable: !!s.tableContent,
            wordCount: s.generationMetadata?.wordCount,
          })),
          generationLog: result.generationLog,
        });
      } catch (error) {
        console.error("Error generating report:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ error: "Failed to generate report", message });
      }
    },
  );

  // Get all generated reports for an assessment (protected - requires org permission + assessment ownership)
  app.get(
    "/api/assessments/:id/reports",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const { id } = req.params;
        const organizationId = req.organizationId;

        // Verify the assessment belongs to the user's organization
        if (!organizationId) {
          return res
            .status(403)
            .json({ error: "Organization context required" });
        }
        const tenantStorage = new TenantStorage(db as any, organizationId);
        const assessment = await tenantStorage.getAssessment(id);
        if (!assessment) {
          return res
            .status(404)
            .json({ error: "Assessment not found or access denied" });
        }

        const reports = await getGeneratedReports(id);
        res.json(reports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
      }
    },
  );

  // Get a specific generated report (protected - requires org permission + assessment ownership)
  app.get(
    "/api/assessments/:id/reports/:reportId",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const { id, reportId } = req.params;
        const organizationId = req.organizationId;

        // Verify the assessment belongs to the user's organization
        if (!organizationId) {
          return res
            .status(403)
            .json({ error: "Organization context required" });
        }
        const tenantStorage = new TenantStorage(db as any, organizationId);
        const assessment = await tenantStorage.getAssessment(id);
        if (!assessment) {
          return res
            .status(404)
            .json({ error: "Assessment not found or access denied" });
        }

        const report = await getGeneratedReport(reportId);
        if (!report) {
          return res.status(404).json({ error: "Report not found" });
        }

        // Additional check: ensure report belongs to the requested assessment
        if (report.assessmentId !== id) {
          return res
            .status(404)
            .json({ error: "Report not found for this assessment" });
        }

        res.json(report);
      } catch (error) {
        console.error("Error fetching report:", error);
        res.status(500).json({ error: "Failed to fetch report" });
      }
    },
  );

  // Import PDF generator for report PDF endpoints
  const { generateReportPDF } = await import(
    "./services/reporting/pdf-generator"
  );

  // Generate and download PDF from existing report (protected)
  app.post(
    "/api/assessments/:id/reports/:reportId/pdf",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const { id, reportId } = req.params;
        const organizationId = req.organizationId;

        // Verify the assessment belongs to the user's organization
        if (!organizationId) {
          return res
            .status(403)
            .json({ error: "Organization context required" });
        }
        const tenantStorage = new TenantStorage(db as any, organizationId);
        const assessment = await tenantStorage.getAssessment(id);
        if (!assessment) {
          return res
            .status(404)
            .json({ error: "Assessment not found or access denied" });
        }

        // Fetch the generated report
        const report = await getGeneratedReport(reportId);
        if (!report) {
          return res.status(404).json({ error: "Report not found" });
        }

        if (report.assessmentId !== id) {
          return res
            .status(404)
            .json({ error: "Report not found for this assessment" });
        }

        // Reconstruct the GeneratedReportResult from stored data with robust defaults
        const dataSnapshot = (report.dataSnapshot as any) || {};
        const reportResult = {
          recipeId: report.recipeId,
          assessmentId: report.assessmentId,
          generatedAt: report.generatedAt || new Date(),
          sections: dataSnapshot?.sections || [],
          dataSnapshot: {
            assessmentType: dataSnapshot?.assessmentType || "unknown",
            principal: dataSnapshot?.principal || null,
            facility: dataSnapshot?.facility || null,
            riskScores: dataSnapshot?.riskScores || { overallScore: 0 },
            threatDomains: dataSnapshot?.threatDomains || [],
            generatedAt:
              dataSnapshot?.generatedAt || report.generatedAt || new Date(),
            ...dataSnapshot,
          },
          generationLog: (report.generationLog as any[]) || [],
          totalTokensUsed: 0,
          totalNarrativeWords: 0,
        };

        // Determine template type based on report type
        const templateType =
          report.reportType === "comprehensive"
            ? "comprehensive"
            : "executive-summary";

        console.log(`[API] Generating PDF for report ${reportId}`);
        const pdfBuffer = await generateReportPDF(
          reportResult as any,
          templateType as "executive-summary" | "comprehensive",
        );

        // Set response headers for PDF download
        const fileName = `report-${reportId.substring(0, 8)}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`,
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        res.send(pdfBuffer);
      } catch (error) {
        console.error("Error generating PDF:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ error: "Failed to generate PDF", message });
      }
    },
  );

  // Generate report and immediately return PDF (one-step) (protected)
  app.post(
    "/api/assessments/:id/reports/generate-pdf",
    requireOrganizationPermission,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { recipeId } = req.body;
        const organizationId = req.organizationId;

        if (!recipeId) {
          return res.status(400).json({ error: "recipeId is required" });
        }

        // Verify the assessment belongs to the user's organization
        if (!organizationId) {
          return res
            .status(403)
            .json({ error: "Organization context required" });
        }
        const tenantStorage = new TenantStorage(db as any, organizationId);
        const assessment = await tenantStorage.getAssessment(id);
        if (!assessment) {
          return res
            .status(404)
            .json({ error: "Assessment not found or access denied" });
        }

        if (!isAnthropicConfigured()) {
          return res.status(503).json({
            error: "Report generation unavailable",
            message: "Anthropic API key is not configured",
          });
        }

        console.log(
          `[API] Generating report and PDF for assessment ${id} with recipe ${recipeId}`,
        );

        // Generate the report
        const result = await generateReport(id, recipeId);

        // Save to database
        const userId = req.session?.userId;
        const savedReportId = await saveGeneratedReport(result, userId);

        // Determine template type based on recipe
        const recipe = await getRecipe(recipeId);
        const templateType =
          recipe?.reportType === "comprehensive"
            ? "comprehensive"
            : "executive-summary";

        // Generate PDF
        const pdfBuffer = await generateReportPDF(
          result,
          templateType as "executive-summary" | "comprehensive",
        );

        // Set response headers for PDF download
        const fileName = `report-${savedReportId.substring(0, 8)}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`,
        );
        res.setHeader("Content-Length", pdfBuffer.length);
        res.setHeader("X-Report-Id", savedReportId);

        res.send(pdfBuffer);
      } catch (error) {
        console.error("Error generating report PDF:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json({ error: "Failed to generate report PDF", message });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;

  // GET facility survey questions for an assessment
  app.get(
    "/api/assessments/:id/facility-survey",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        // Get all facility survey questions for this assessment from database
        const questions = await storage.getFacilitySurveyQuestions(
          parseInt(id),
        );

        res.json(questions);
      } catch (error) {
        console.error("Error fetching facility survey questions:", error);
        res.status(500).json({ error: "Failed to fetch survey questions" });
      }
    },
  );
}
