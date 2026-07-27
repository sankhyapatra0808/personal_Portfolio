import { lazy, Suspense, useEffect, type MouseEvent } from "react";
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

function handleSkipToMain(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();

  const mainContent = document.getElementById("main-content");

  if (!mainContent) {
    console.warn('Skip link target "#main-content" was not found.');

    return;
  }

  /*
   * Prefer the first page heading because focusing the
   * complete <main> element often produces no visible
   * change, especially on the homepage.
   */
  const focusTarget =
    mainContent.querySelector<HTMLElement>("[data-skip-target], h1, h2") ??
    mainContent;

  const alreadyHadTabIndex = focusTarget.hasAttribute("tabindex");

  if (!alreadyHadTabIndex) {
    focusTarget.setAttribute("tabindex", "-1");
  }

  /*
   * Focus first without allowing the browser to perform
   * a separate automatic jump.
   */
  focusTarget.focus({
    preventScroll: true,
  });

  /*
   * scrollIntoView also works with the homepage's
   * internal .home-page scroll container.
   */
  focusTarget.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
    inline: "nearest",
  });

  /*
   * Brief visual confirmation that the skip action
   * successfully reached the content.
   */
  focusTarget.classList.add("skip-target--active");

  window.setTimeout(() => {
    focusTarget.classList.remove("skip-target--active");

    /*
     * Remove only the temporary tabindex that this
     * function added. Preserve existing tabindex values.
     */
    if (!alreadyHadTabIndex) {
      focusTarget.removeAttribute("tabindex");
    }
  }, 1000);

  /*
   * Keep the meaningful fragment in the URL without
   * causing another browser jump.
   */
  window.history.replaceState(null, "", "#main-content");
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content" onClick={handleSkipToMain}>
        Skip to main content
      </a>

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
