import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initDemoSession } from "./api/authApi";

// ── Demo / Auto Session Bootstrap ─────────────────────────────────────────────
// Auto-authenticates against backend for smooth demo review
initDemoSession().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
  );
});