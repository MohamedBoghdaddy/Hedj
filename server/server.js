import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Import Routes
import employeeRoutes from "./routes/employeeroutes.js";
import productRoutes from "./routes/productsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

// ✅ Convert __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Environment Variables
dotenv.config();

// ✅ Initialize Express App
const app = express();
const upload = multer({ dest: "uploads/" });

const MongoDBStore = connectMongoDBSession(session);

// ✅ Load Environment Variables with Defaults
const {
  JWT_SECRET = "default_jwt_secret",
  SESSION_SECRET = "default_session_secret",
  MONGO_URL = "mongodb://localhost:27017/hedj",
  NODE_ENV = "development",
  CORS_ORIGIN = "http://localhost:3000",
  PORT = 8000,
} = process.env;

// 🌍 Check if Running in Production
const isProduction = NODE_ENV === "production";

// ✅ Define Allowed Origins for CORS
const allowedOrigins = [
  CORS_ORIGIN, // ✅ Render Frontend URL from .env
  "http://localhost:3000", // ✅ Local Frontend
];

if (!MONGO_URL) {
  console.error("❌ MongoDB connection string (MONGO_URL) is missing.");
  process.exit(1);
}

// ✅ Configure MongoDB Session Store
const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: "sessions",
});

store.on("error", (error) => {
  console.error("❌ Session store error:", error);
});

// 🔒 Security & Middleware
app.use(helmet()); // Security headers
app.use(morgan(isProduction ? "tiny" : "dev")); // Reduce logs in production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔗 CORS Setup (Supports Multiple Origins)
app.use(
  cors({
    origin: (origin, callback) => {
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

// 🛠️ Session Configuration
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: isProduction, // Secure cookies only in production
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// 🔑 JWT Token Creation
const createToken = (_id, res) => {
  const token = jwt.sign({ _id }, JWT_SECRET, { expiresIn: "3d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return token;
};

// 🚀 Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // 🌍 Start Server Only After DB Connection
    app.listen(PORT, () =>
      console.log(
        `🚀 Server running on ${isProduction ? "Render" : "localhost"} at port ${PORT}`
      )
    );
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};

// ✅ Call function to connect to DB
connectDB();

// 📌 API Routes (Versioned)
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/settings", settingsRoutes);

// 📂 Serve Static Files (Uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.json({
    message: `Hedj API is running on ${isProduction ? "Render" : "localhost"} 🚀`,
  });
});

// 🛠️ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.message);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});
