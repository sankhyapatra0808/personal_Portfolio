import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ButtonLink from "../components/ButtonLink";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import PageTitle from "../components/PageTitle";
import Reveal from "../components/Reveal";
import { projects } from "../data/projects";
import NotFoundPage from "./NotFoundPage";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const update = () => {
      const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      setAtBottom(bottom);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!project) return <NotFoundPage />;

  const toggleScroll = () => {
    window.scrollTo({ top: atBottom ? 0 : document.documentElement.scrollHeight, behavior: "smooth" });
  };

  return (
    <main className="inner-page project-detail-page">
      <PageTitle title={`${project.title} — Sankhya Patra`} description={project.summary} />
      <Link className="back-link" to="/projects"><Icon name="back" /> Back to projects</Link>
      <button className="scroll-toggle" type="button" onClick={toggleScroll} aria-label={atBottom ? "Scroll to top" : "Scroll to bottom"}>
        <span className={atBottom ? "scroll-toggle__arrow scroll-toggle__arrow--up" : "scroll-toggle__arrow"}>↓</span>
      </button>

      <section className="project-detail-hero">
        <div className="page-shell project-detail-grid">
          <Reveal className="project-facts">
            <div>
              <p className="eyebrow">Project</p>
              <h1>{project.title}</h1>
            </div>
            <div className="project-fact">
              <span>Year</span><strong>{project.year}</strong>
            </div>
            <div className="project-fact">
              <span>Technology</span><strong>{project.tech.join(", ")}</strong>
            </div>
            <div className="button-row">
              {project.preview ? <ButtonLink to={project.preview} external icon="external">Live Preview</ButtonLink> : null}
              {project.code ? <ButtonLink to={project.code} external variant="secondary" icon="github">Source Code</ButtonLink> : null}
            </div>
          </Reveal>
          <Reveal className="project-description" delay={100}>
            <p className="eyebrow">Description</p>
            {project.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="project-highlights">
              <h2>Highlights</h2>
              <ul>
                {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="project-gallery">
        <div className="page-shell">
          {project.gallery.map((image, index) => (
            <Reveal className="project-gallery__item" delay={index * 90} key={image}>
              <img src={image} alt={`${project.title} project screen ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} />
            </Reveal>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
