import React from "react";
import { createRoot } from "react-dom"; // Import createRoot function from react-dom
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = createRoot(document.getElementById("root")); // Use createRoot function

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
