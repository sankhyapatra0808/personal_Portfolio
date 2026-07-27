import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import RouteProgress from "./components/RouteProgress";
import HomePage from "./pages/HomePage";

/*
 * HomePage remains a normal import because it is the
 * first page visitors see.
 *
 * The remaining pages are loaded only when their route
 * is opened.
 */
const AboutPage = lazy(() => import("./pages/AboutPage"));

const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));

const ArchivePage = lazy(() => import("./pages/ArchivePage"));

const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

function PageLoader() {
  return (
    <div
      className="page-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <span className="page-loader__spinner" aria-hidden="true" />

      <p>Loading page...</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RouteProgress />
      <Navigation />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/projects" element={<ProjectsPage />} />

          <Route path="/projects/archive" element={<ArchivePage />} />

          <Route path="/projects/:slug" element={<ProjectDetailPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
