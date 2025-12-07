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

// Health endpoint - simple, synchronous, always returns 200
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Always trust proxy - Replit runs behind HTTPS proxy in all environments
app.set('trust proxy', 1);

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create PostgreSQL pool with SSL for Neon
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Add error handler to prevent unhandled pool errors from crashing the app
pgPool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Configure session middleware with PostgreSQL store BEFORE server starts
// Let connect-pg-simple handle table creation with its built-in lazy initialization
const PgSession = ConnectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'session',
      createTableIfMissing: true, // Let the library handle table creation
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    proxy: true,
  })
);

// Attach tenant context after session middleware
app.use(attachTenantContext);

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`🚀 [RAW] ${req.method} ${req.path} Origin: ${req.headers.origin || 'none'}`);
  }
  
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

console.log("🍪 Cookie config: secure=true, sameSite=none (Replit cross-origin webview)");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

// Main async initialization - register routes then start listening
(async () => {
  // Register all routes BEFORE starting server
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error('Error:', err);
  });

  // Setup Vite in development or serve static in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server AFTER all middleware and routes are registered
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
