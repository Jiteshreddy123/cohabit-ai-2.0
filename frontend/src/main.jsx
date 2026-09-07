import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initDemoSession } from "./api/authApi";

// ── Demo / Auto Session ───────────────────────────────────────────────────────
// Auto-authenticates against the backend so users and judges skip login smoothly.
await initDemoSession();
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
);