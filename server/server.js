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
import employeeRoutes from "./routes/employeeroutes.js";
import productRoutes from "./routes/productsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

const MongoDBStore = connectMongoDBSession(session);
const { JWT_SECRET, SESSION_SECRET, MONGO_URL, NODE_ENV, CORS_ORIGIN } =
  process.env;
const PORT = process.env.PORT || 8000;

// 🌍 Define if Running Locally or in Production
const isProduction = NODE_ENV === "production";
const allowedOrigins = [CORS_ORIGIN || "http://localhost:3000"];

if (!MONGO_URL) {
  console.error("❌ MongoDB connection string (MONGO_URL) is missing.");
  process.exit(1);
}

// Configure MongoDB session store
const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: "sessions",
});

store.on("error", (error) => {
  console.error("❌ Session store error:", error);
});

// 🔒 Security & Middleware
app.use(helmet()); // Security headers
app.use(morgan(isProduction ? "tiny" : "dev")); // Use less logging in production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔗 CORS Setup
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

// Call function to connect to DB
connectDB();

// 📌 Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);

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
