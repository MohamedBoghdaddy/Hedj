import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";



// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(express.json()); // For parsing JSON bodies

// // MongoDB connection
// mongoose
//   .connect("mongodb://localhost:27017/loginSignupDB", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((error) => console.error("MongoDB connection error:", error));

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });npm



const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
