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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 4000,
  MONGO_URL: RAW_MONGO_URL,
  MONGO_URI,
  SESSION_SECRET = "hedj-demo-session-secret",
  CORS_ORIGIN = "http://localhost:3000",
  NODE_ENV = "development",
} = process.env;

const MONGO_URL = RAW_MONGO_URL || MONGO_URI;

const isProduction = NODE_ENV === "production";
const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads") });
const MongoDBStore = connectMongoDBSession(session);

const sessionStore = MONGO_URL
  ? new MongoDBStore({ uri: MONGO_URL, collection: "sessions" })
  : null;

if (sessionStore) {
  sessionStore.on("error", (error) => {
    console.error("Session store error:", error);
  });
}

const allowedOrigins = [
  CORS_ORIGIN,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://hedj.netlify.app",
].filter(Boolean);

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
  })
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
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  return res.status(201).json({ file: req.file });
});

app.use("/api", commerceRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: `Hedj API is running in ${MONGO_URL ? "mongo" : "demo"} mode`,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

const connectDB = async () => {
  if (!MONGO_URL) {
    console.warn("MONGO_URL is not set. Running Hedj API with in-memory demo data.");
    startServer();
    return;
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
    startServer();
  } catch (error) {
    console.error("Database connection error:", error);
    if (isProduction) {
      process.exit(1);
    }
    console.warn("Continuing in demo mode because MongoDB is unreachable in development.");
    startServer();
  }
};

connectDB();
