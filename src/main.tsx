import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GlobalProvider } from "./context/GlobalContext.tsx";
import { HelmetProvider } from "react-helmet-async";

// Legacy Vite entry point. Production uses Next.js, but this path remains for
// fallback comparison through npm run dev:vite/build:vite.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </GlobalProvider>
  </StrictMode>
);

const isProd = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD) || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');
// Register the service worker only for production legacy builds to avoid stale caches during local work.
if (typeof window !== 'undefined' && "serviceWorker" in navigator && isProd) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => {
        console.error("Service Worker registration failed: ", error);
      });
  });
}

