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
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

const MongoDBStore = connectMongoDBSession(session);
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8000;

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
app.use(morgan("dev")); // Logs requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔗 CORS Setup
const allowedOrigins = [process.env.CORS_ORIGIN || "http://localhost:3000"];
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
      secure: process.env.NODE_ENV === "production",
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
    secure: process.env.NODE_ENV === "production",
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
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// 🛠️ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.message);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});


