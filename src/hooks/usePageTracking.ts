import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Wait a brief moment to ensure react-helmet updates the document title
    const handle = setTimeout(() => {
      if (window.gtag) {
        window.gtag("event", "page_view", {
          page_path: location.pathname + location.search,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    }, 100);

    return () => clearTimeout(handle);
  }, [location]);
};
