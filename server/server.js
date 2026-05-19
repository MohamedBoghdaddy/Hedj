import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import cookieParser from "cookie-parser";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import commerceRoutes from "./routes/commerceRoutes.js";
import employeeRoutes from "./routes/employeeroutes.js";
import productRoutes from "./routes/productsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import erpRoutes from "./routes/erpRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 4000,
  SESSION_SECRET = "hedj-demo-session-secret",
  FRONTEND_URL,
  CORS_ORIGIN = "http://localhost:3000",
  NODE_ENV = "development",
} = process.env;

const getMongoConfig = () => {
  const mongoUri = process.env.MONGO_URI?.trim();
  const mongoUrl = process.env.MONGO_URL?.trim();

  if (mongoUri) return { source: "MONGO_URI", uri: mongoUri };
  if (mongoUrl) return { source: "MONGO_URL", uri: mongoUrl };
  return { source: null, uri: "" };
};

const mongoConfig = getMongoConfig();
const MONGO_CONNECTION_STRING = mongoConfig.uri;
const MONGO_SERVER_SELECTION_TIMEOUT_MS = 5000;
const MONGO_CONNECT_TIMEOUT_MS = 10000;
const MONGO_CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
  connectTimeoutMS: MONGO_CONNECT_TIMEOUT_MS,
};

const isProduction = NODE_ENV === "production";
const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads") });
const MongoDBStore = connectMongoDBSession(session);

const allowedOrigins = [
  CORS_ORIGIN,
  FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://hedj.netlify.app",
].filter(Boolean);

const redactMongoUri = (uri) => {
  if (!uri) return "(not set)";

  try {
    const parsed = new URL(uri);
    const credentials =
      parsed.username || parsed.password ? "<credentials>@" : "";
    return `${parsed.protocol}//${credentials}${parsed.host}${parsed.pathname}`;
  } catch {
    const scheme = uri.match(/^mongodb(?:\+srv)?:\/\//i)?.[0] || "mongodb://";
    const withoutScheme = uri.replace(/^mongodb(?:\+srv)?:\/\//i, "");
    const withoutAuth = withoutScheme.replace(/^[^@/]+@/, "<credentials>@");
    return `${scheme}${withoutAuth.split(/[?#]/)[0]}`;
  }
};

const isSrvMongoUri = MONGO_CONNECTION_STRING.startsWith("mongodb+srv://");

const formatMongoError = (error) => {
  const rawMessage = error?.reason?.message || error?.message || String(error);
  const safeMessage = MONGO_CONNECTION_STRING
    ? rawMessage
        .split(MONGO_CONNECTION_STRING)
        .join(redactMongoUri(MONGO_CONNECTION_STRING))
    : rawMessage;

  if (
    isSrvMongoUri &&
    /querySrv|queryTxt|SRV|TXT|ENOTFOUND|ENODATA|ECONNREFUSED|ETIMEOUT/i.test(
      safeMessage,
    )
  ) {
    return `${safeMessage}. Atlas mongodb+srv connection strings require DNS SRV/TXT resolution. If this network blocks SRV lookups, use the MongoDB Atlas standard non-SRV mongodb:// connection string.`;
  }

  return safeMessage;
};

const logMongoConfig = () => {
  if (process.env.MONGO_URI?.trim() && process.env.MONGO_URL?.trim()) {
    console.info(
      "MongoDB config: MONGO_URI and MONGO_URL are both set; using MONGO_URI.",
    );
  }

  if (!MONGO_CONNECTION_STRING) {
    console.warn(
      "MongoDB config: no connection string found. Checked MONGO_URI first, then MONGO_URL.",
    );
    return;
  }

  console.info(
    `MongoDB config: using ${mongoConfig.source} (${redactMongoUri(
      MONGO_CONNECTION_STRING,
    )}).`,
  );

  // mongodb+srv Atlas URIs require DNS SRV/TXT resolution for _mongodb._tcp.<cluster-host>.
  if (isSrvMongoUri) {
    console.info(
      "MongoDB config: mongodb+srv detected; this environment must allow DNS SRV/TXT lookups.",
    );
  }
};

const databaseUnavailablePayload = () => ({
  success: false,
  message:
    "MongoDB is unavailable. Database-backed endpoints are temporarily disabled.",
});

const requireMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json(databaseUnavailablePayload());
};

const isMongoUnavailableError = (error = {}) => {
  const message = error.message || "";
  return (
    [
      "MongoNetworkError",
      "MongoServerSelectionError",
      "MongoTopologyClosedError",
    ].includes(error.name) ||
    /bufferCommands|not connected|server selection|topology|connection/i.test(
      message,
    )
  );
};

const createSessionStore = async () => {
  if (!MONGO_CONNECTION_STRING) return null;

  return new Promise((resolve) => {
    let settled = false;
    let initializing = true;
    let store;

    const finish = (nextStore) => {
      if (settled) return;
      settled = true;
      initializing = false;
      resolve(nextStore);
    };

    try {
      store = new MongoDBStore(
        {
          uri: MONGO_CONNECTION_STRING,
          collection: "sessions",
          connectionOptions: MONGO_CONNECT_OPTIONS,
        },
        (error) => {
          if (error) {
            console.warn(
              `MongoDB session store unavailable: ${formatMongoError(error)}`,
            );
            if (!isProduction) {
              console.warn(
                "Development server will continue with the in-memory session store.",
              );
            }
            finish(null);
            return;
          }

          console.info("MongoDB session store connected.");
          finish(store);
        },
      );

      store.on("error", (error) => {
        if (initializing) return;
        const message = `MongoDB session store warning: ${formatMongoError(error)}`;
        if (isProduction) console.error(message);
        else console.warn(message);
      });
    } catch (error) {
      console.warn(
        `MongoDB session store setup failed: ${formatMongoError(error)}`,
      );
      if (!isProduction) {
        console.warn(
          "Development server will continue with the in-memory session store.",
        );
      }
      finish(null);
    }
  });
};

const configureApp = ({ mongoConnected, sessionStore }) => {
  app.locals.mongoAvailable = mongoConnected;
  app.locals.mongoMode = mongoConnected ? "mongo" : "demo";
  app.locals.mongoUriSource = mongoConfig.source;

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(morgan(isProduction ? "tiny" : "dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS policy violation"));
        }
      },
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    }),
  );
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore || undefined,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.post("/upload", upload.single("photo"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    return res.status(201).json({ file: req.file });
  });

  app.use("/api", commerceRoutes);
  app.use("/api/employees", requireMongoConnection, employeeRoutes);
  app.use("/api/products", requireMongoConnection, productRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/erp", erpRoutes);

  app.get("/", (req, res) => {
    res.json({
      message: `Hedj API is running in ${app.locals.mongoMode} mode`,
      mongo: {
        available: app.locals.mongoAvailable,
        source: app.locals.mongoUriSource,
      },
    });
  });

  app.use("/api", (req, res) => {
    res.status(404).json({
      success: false,
      message: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    if (isMongoUnavailableError(err)) {
      return res.status(503).json(databaseUnavailablePayload());
    }

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  });
};

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

const connectDB = async () => {
  logMongoConfig();

  if (!MONGO_CONNECTION_STRING) {
    console.warn(
      "Running Hedj API with in-memory demo data. Database-backed auth routes will return HTTP 503.",
    );
    return false;
  }

  try {
    await mongoose.connect(MONGO_CONNECTION_STRING, MONGO_CONNECT_OPTIONS);
    console.log(`Connected to MongoDB Atlas using ${mongoConfig.source}.`);
    return true;
  } catch (error) {
    console.error(
      `Failed to connect to MongoDB Atlas using ${mongoConfig.source}: ${formatMongoError(
        error,
      )}`,
    );
    console.warn(
      "Continuing in demo/fallback mode. Database-backed auth routes will return HTTP 503.",
    );
    return false;
  }
};

mongoose.connection.on("connected", () => {
  app.locals.mongoAvailable = true;
  app.locals.mongoMode = "mongo";
});

mongoose.connection.on("disconnected", () => {
  app.locals.mongoAvailable = false;
  app.locals.mongoMode = "demo";
  if (MONGO_CONNECTION_STRING) {
    console.warn(
      "MongoDB disconnected. Database-backed endpoints will return HTTP 503 until MongoDB reconnects.",
    );
  }
});

const bootstrap = async () => {
  const mongoConnected = await connectDB();
  const sessionStore = mongoConnected ? await createSessionStore() : null;
  configureApp({ mongoConnected, sessionStore });
  startServer();
};

bootstrap();
