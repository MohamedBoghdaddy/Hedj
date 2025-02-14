import React from "react";
import { createRoot } from "react-dom"; // Import createRoot function from react-dom
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";
import { ShopContextProvider } from "./context/productContext";
import DashboardProvider from "./context/DashboardContext";
const root = createRoot(document.getElementById("root")); // Use createRoot function

root.render(
  <React.StrictMode>
    <AuthProvider>
      <DashboardProvider> 
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
      </DashboardProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
