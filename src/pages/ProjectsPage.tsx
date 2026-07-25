import { useMemo, useState } from "react";
import ButtonLink from "../components/ButtonLink";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { categories, projects, type ProjectCategory } from "../data/projects";

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("All");
  const featured = projects.find((project) => project.featured) ?? projects[0];

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((project) =>
      project.category.includes(activeCategory as ProjectCategory),
    );
  }, [activeCategory]);

  return (
    <main className="inner-page projects-page">
      <PageTitle
        title="Projects — Sankhya Patra"
        description="Selected web and mobile projects by Sankhya Patra, including SplitVerse and DevArena."
      />
      <section className="projects-hero">
        <div className="page-shell">
          <Reveal>
            <p className="eyebrow">Projects</p>
            <h1>Selected products, systems and interfaces.</h1>
            <p className="projects-hero__intro">
              Four projects that represent my work across full-stack web
              development, mobile engineering and product-focused frontend
              design.
            </p>
          </Reveal>
          <Reveal className="featured-project" delay={100}>
            <div className="featured-project__media">
              <img
                src={featured.visual}
                alt={`${featured.title} preview`}
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="featured-project__content">
              <p className="eyebrow">Featured project</p>

              <h2>{featured.title}</h2>

              <p>{featured.summary}</p>

              <ButtonLink to={`/projects/${featured.slug}`} icon="arrow">
                Read Case Study
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="content-section">
        <div className="page-shell">
          <Reveal>
            <SectionHeading eyebrow="Project index" title="Explore the work." />
          </Reveal>
          <div className="filter-row" role="group" aria-label="Filter projects">
            {categories.map((category) => (
              <button
                className={
                  activeCategory === category
                    ? "filter-button filter-button--active"
                    : "filter-button"
                }
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="projects-grid">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
          <div className="archive-callout">
            <p>Prefer a compact project list?</p>
            <ButtonLink to="/projects/archive" variant="secondary" icon="arrow">
              Open Archive
            </ButtonLink>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
