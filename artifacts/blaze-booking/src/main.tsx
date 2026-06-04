import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// When deployed to Vercel, set VITE_API_URL to your API server URL.
// Leave unset when running locally (relative /api paths work via proxy).
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl.replace(/\/+$/, ""));
}

createRoot(document.getElementById("root")!).render(<App />);
