import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initCloud, watchProgress } from "./lib/cloud.js";
import { subscribe } from "./lib/store.js";
import "./styles.css";

initCloud();
watchProgress(subscribe);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
