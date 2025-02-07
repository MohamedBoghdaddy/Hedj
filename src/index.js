import React from "react";
import { createRoot } from "react-dom"; // Import createRoot function from react-dom
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";
import { ShopContextProvider } from "./context/productContext";
const root = createRoot(document.getElementById("root")); // Use createRoot function

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
