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
