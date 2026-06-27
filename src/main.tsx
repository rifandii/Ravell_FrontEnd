import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GlobalProvider } from "./context/GlobalContext.tsx";
import { HelmetProvider } from "react-helmet-async";

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
if (typeof window !== 'undefined' && "serviceWorker" in navigator && isProd) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered successfully with scope: ", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registration failed: ", error);
      });
  });
}

