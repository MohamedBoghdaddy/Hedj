import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
// import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import emproute from "./routes/employeeroutes.js";
import mongo from "mongodb";

// dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const URL = process.env.MONGOURL;

// Middleware setup
app.use(bodyParser.json());
const uri =
  "mongodb+srv://hagar123:hagora96@cluster0.vc587sd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(
  cors({
    origin: "http://localhost:3000", // React app's address
    credentials: true,
  })
);

app.use(
  session({
    secret: "yourSecretKey", // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using https
  })
);

// Mongoose setup
mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => console.log("DB connection error:", error));

// MongoDB setup using native MongoDB driver
const client = new mongo.MongoClient(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const users = [
  { name: "John Doe", age: 28, email: "john.doe@example.com" },
  { name: "Jane Smith", age: 35, email: "jane.smith@example.com" },
  { name: "Alice Johnson", age: 24, email: "alice.johnson@example.com" },
  { name: "Bob Brown", age: 42, email: "bob.brown@example.com" },
];

// Insert users when server starts
async function insertUsers() {
  try {
    await client.connect();
    const db = client.db("test");
    await db.collection("users").insertMany(users);
    console.log("Users inserted successfully");
  } catch (err) {
    console.error("Error inserting users:", err);
  }
}

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const result = await client.db("test").collection("users").insertOne(user);
    res
      .status(201)
      .json({ message: "User created", userId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.use("/api", emproute);

async function startServer() {
  try {
    await client.connect();
    await insertUsers();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

startServer();
