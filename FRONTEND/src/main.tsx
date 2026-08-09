import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthProvider from "./context/Auth/AuthContext.jsx";
import { initAnalytics } from "./lib/analytics";

initAnalytics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
