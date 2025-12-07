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

// Database readiness state - starts false, set true after initialization
let dbReady = false;

// IMMEDIATE health endpoint - responds before database is ready
// This allows Replit's health check to pass during cold starts
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    db: dbReady ? 'connected' : 'initializing',
    timestamp: new Date().toISOString()
  });
});

// VERY FIRST: Log EVERY single request to the server, no filtering
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`🚀 [RAW] ${req.method} ${req.path} Origin: ${req.headers.origin || 'none'}`);
  }
  next();
});

// Always trust proxy - Replit runs behind HTTPS proxy in all environments
// This is REQUIRED for secure cookies and session persistence
app.set('trust proxy', 1);

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

// Replit runs behind a proxy with HTTPS, even in development
console.log("🍪 Cookie config: secure=true, sameSite=none (Replit cross-origin webview)");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

// Database initialization function with retry logic
async function initializeDatabase(pgPool: pg.Pool): Promise<void> {
  const maxRetries = 5;
  
  // Step 1: Verify database connection
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pgPool.query('SELECT 1');
      console.log('✅ Database connection verified');
      break;
    } catch (error: any) {
      console.log(`⏳ Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries) {
        throw new Error('Could not connect to database after max retries');
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  // Step 2: Create session table with retry
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL,
          CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        ) WITH (OIDS=FALSE);
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
      `);
      console.log('✅ Session table verified');
      break;
    } catch (error: any) {
      console.log(`⏳ Session table creation attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries) {
        throw new Error('Could not create session table after max retries');
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Main async initialization
(async () => {
  // Create PostgreSQL pool with SSL for Neon
  const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Add error handler to prevent unhandled pool errors from crashing the app
  pgPool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });

  // Start server FIRST - before database initialization
  // This allows health checks to pass immediately
  const port = parseInt(process.env.PORT || '5000', 10);
  const { createServer } = await import('http');
  const httpServer = createServer(app);
  
  httpServer.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // THEN initialize database in background after server is listening
    initializeDatabase(pgPool)
      .then(async () => {
        dbReady = true;
        console.log('✅ Database initialization complete');
        
        // NOW set up session middleware after database is ready
        const PgSession = ConnectPgSimple(session);
        app.use(
          session({
            store: new PgSession({
              pool: pgPool,
              tableName: 'session',
              createTableIfMissing: false, // We already created it
            }),
            secret: process.env.SESSION_SECRET!,
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
        
        // Register all routes after database is ready
        await registerRoutes(app);
        
        // Error handler
        app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
          const status = err.status || err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          res.status(status).json({ message });
          console.error('Error:', err);
        });
        
        // Setup Vite in development or serve static in production
        if (app.get("env") === "development") {
          await setupVite(app, httpServer);
        } else {
          serveStatic(app);
        }
        
        console.log('✅ Application fully initialized');
      })
      .catch(err => {
        console.error('❌ Database initialization failed:', err);
        // Don't crash - health checks continue working
      });
  });
})();
