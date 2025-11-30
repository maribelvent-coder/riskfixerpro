import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import pg from "pg";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { loadFlagsFromEnv } from "@shared/featureFlags";
import { attachTenantContext } from "./tenantMiddleware";

// Initialize feature flags from environment variables
loadFlagsFromEnv();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const app = express();

// Always trust proxy - Replit runs behind HTTPS proxy in all environments
// This is REQUIRED for secure cookies and session persistence
app.set('trust proxy', 1);

// FIRST middleware: Log ALL incoming requests before any processing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`🌐 INCOMING REQUEST: ${req.method} ${req.path} from ${req.ip}`);
  }
  next();
});

// CORS middleware - handle preflight OPTIONS requests for cross-origin requests
// This is needed because Replit's webview may be considered cross-origin
app.use((req, res, next) => {
  // Allow requests from any origin in development
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`🌐 CORS PREFLIGHT: ${req.path}`);
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create PostgreSQL session store
const PgSession = ConnectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Add error handler to prevent unhandled pool errors from crashing the app
pgPool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // Pool will automatically try to reconnect
});

// Environment-aware cookie configuration
// Development: relaxed settings for local browser testing
// Production: strict settings for cross-site/iframe contexts (Replit webview)
const isDevelopment = process.env.NODE_ENV === 'development';

// Configure session middleware with PostgreSQL store
app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      secure: !isDevelopment, // false in dev (allows HTTP), true in prod (requires HTTPS)
      httpOnly: true,
      sameSite: isDevelopment ? 'lax' : 'none', // 'lax' in dev, 'none' in prod for cross-site
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    proxy: true, // Trust the reverse proxy (Replit provides HTTPS)
  })
);

// Attach tenant context after session middleware
app.use(attachTenantContext);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
