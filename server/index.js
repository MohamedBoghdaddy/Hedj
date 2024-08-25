import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import dotenv  from "dotenv"
import cors from "cors"
import session from 'express-session';
import emproute from "./routes/employeeroutes.js";


dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const MongoDBStore = connectMongoDBSession(session);
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

// Middleware
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// Configure session middleware
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

const createToken = (_id, res) => {
  const token = jwt.sign({ _id }, JWT_SECRET, { expiresIn: "3d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  });
  return token;
};

// Environment variables
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error(
    "MongoDB connection string (MONGO_URL) is not defined in the environment variables."
  );
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });



app.use('/api', emproute);