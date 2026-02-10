import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const scrollContainers = document.querySelectorAll<HTMLElement>("[data-scroll-container]");
    scrollContainers.forEach((container) => {
      container.scrollTop = 0;
    });
  }, [pathname, search]);

  return null;
}
