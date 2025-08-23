
/**
 * ScrollToTop
 * Automatically scrolls to the top of the page on route change.
 * Should be placed inside <Router>, above <Routes>.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
