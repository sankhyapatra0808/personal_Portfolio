import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import RouteProgress from "./components/RouteProgress";
import AboutPage from "./pages/AboutPage";
import ArchivePage from "./pages/ArchivePage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectsPage from "./pages/ProjectsPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RouteProgress />
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/archive" element={<ArchivePage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
