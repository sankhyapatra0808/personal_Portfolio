import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ButtonLink from "../components/ButtonLink";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import PageTitle from "../components/PageTitle";
import Reveal from "../components/Reveal";
import OptimizedImage from "../components/OptimizedImage";
import { projects } from "../data/projects";
import {
  fetchLatestSplitVerseApkUrl,
  SPLITVERSE_LATEST_RELEASE_PAGE,
} from "../lib/githubReleases";
import NotFoundPage from "./NotFoundPage";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  const [atBottom, setAtBottom] = useState(false);
  const [mobileApkUrl, setMobileApkUrl] = useState(
    SPLITVERSE_LATEST_RELEASE_PAGE,
  );

  useEffect(() => {
    const update = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;
      setAtBottom(bottom);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Resolve the APK for the latest published stable release. Never keep a
  // versioned asset URL in the portfolio, and fall back to the releases page.
  useEffect(() => {
    if (slug !== "splitverse-mobile") return;

    const controller = new AbortController();
    void fetchLatestSplitVerseApkUrl(controller.signal)
      .then((url) => {
        if (!controller.signal.aborted && url) setMobileApkUrl(url);
      })
      .catch(() => {
        // The fallback opens the latest releases page if GitHub is unreachable.
      });

    return () => controller.abort();
  }, [slug]);

  if (!project) return <NotFoundPage />;

  const toggleScroll = () => {
    window.scrollTo({
      top: atBottom ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <main
      id="main-content"
      className="inner-page project-detail-page"
      tabIndex={-1}
    >
      <PageTitle
        title={`${project.title} — Sankhya Patra`}
        description={project.summary}
        path={`/projects/${project.slug}`}
        image={project.visual}
      />
      <Link className="back-link" to="/projects">
        <Icon name="back" /> Back to projects
      </Link>
      <button
        className="scroll-toggle"
        type="button"
        onClick={toggleScroll}
        aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}
      >
        <span
          className={
            atBottom
              ? "scroll-toggle__arrow scroll-toggle__arrow--up"
              : "scroll-toggle__arrow"
          }
        >
          ↓
        </span>
      </button>

      <section className="project-detail-hero">
        <div className="page-shell project-detail-grid">
          <Reveal className="project-facts">
            <div>
              <p className="eyebrow">Project</p>
              <h1>{project.title}</h1>
            </div>
            <div className="project-fact">
              <span>Year</span>
              <strong>{project.year}</strong>
            </div>
            <div className="project-fact">
              <span>Development period</span>
              <strong>{project.period}</strong>
            </div>
            <div className="project-fact">
              <span>My role</span>
              <strong>{project.role}</strong>
            </div>
            <div className="project-fact">
              <span>Technology</span>
              <strong>{project.tech.join(", ")}</strong>
            </div>
            <div className="button-row">
              {project.preview ? (
                <ButtonLink
                  to={
                    project.slug === "splitverse-mobile"
                      ? mobileApkUrl
                      : project.preview
                  }
                  external
                  icon="external"
                >
                  {project.previewLabel ?? "Live Preview"}
                </ButtonLink>
              ) : null}

              {project.code ? (
                <ButtonLink
                  to={project.code}
                  external
                  variant="secondary"
                  icon="github"
                >
                  {project.codeLabel ?? "Source Code"}
                </ButtonLink>
              ) : null}
            </div>
          </Reveal>
          <Reveal className="project-description" delay={100}>
            <p className="eyebrow">Description</p>
            {project.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="project-highlights">
              <h2>Highlights</h2>
              <ul>
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className={
          project.slug === "splitverse-mobile"
            ? "project-gallery project-gallery--mobile"
            : "project-gallery"
        }
      >
        <div className="page-shell">
          {project.gallery.map((image, index) => (
            <Reveal
              className="project-gallery__item"
              delay={index * 90}
              key={image}
            >
              <OptimizedImage
                src={image}
                alt={`${project.title} project screen ${index + 1}`}
              />
            </Reveal>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
