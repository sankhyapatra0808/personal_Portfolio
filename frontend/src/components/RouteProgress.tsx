import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteProgress() {
  const { pathname } = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 420);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return <div className={`route-progress ${active ? "route-progress--active" : ""}`} />;
}
