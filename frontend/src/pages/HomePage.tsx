import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ButtonLink from "../components/ButtonLink";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import Monogram from "../components/Monogram";
import PageTitle from "../components/PageTitle";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import OptimizedImage from "../components/OptimizedImage";
import homePortrait from "../assets/profile/sankhya-home.webp";
import aboutPortrait from "../assets/profile/sankhya-about.webp";
import { profile } from "../data/profile";
import { projects } from "../data/projects";
import ContactForm from "../components/ContactForm";

const sections = ["home", "about", "projects", "contact"] as const;

type HomeSection = (typeof sections)[number];

export default function HomePage() {
  const featuredProject =
    projects.find((project) => project.featured) ?? projects[0];

  const [activeSection, setActiveSection] = useState<HomeSection>("home");

  // Intersection Observer

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          );

        const mostVisibleSection = visibleEntries[0];

        if (!mostVisibleSection) {
          return;
        }

        setActiveSection(mostVisibleSection.target.id as HomeSection);
      },
      {
        root: null,
        rootMargin: "-12% 0px -28% 0px",
        threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
      },
    );

    sectionElements.forEach((sectionElement) => {
      observer.observe(sectionElement);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main id="main-content" className="home-page" tabIndex={-1}>
      <PageTitle
        title="Sankhya Patra — Full-Stack & Mobile Developer"
        description="Portfolio of Sankhya Patra, a full-stack and mobile developer building secure, responsive and practical products including SplitVerse and DevArena."
        path="/"
      />
      <nav
        className={`section-dots ${
          activeSection === "contact" ? "section-dots--light" : ""
        }`}
        aria-label="Homepage sections"
      >
        {sections.map((section, index) => {
          const isActive = activeSection === section;

          return (
            <a
              key={section}
              href={`#${section}`}
              className={
                isActive ? "section-dot section-dot--active" : "section-dot"
              }
              aria-current={isActive ? "location" : undefined}
              aria-label={`Go to ${section} section`}
              onClick={() => setActiveSection(section)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
            </a>
          );
        })}
      </nav>

      <section className="snap-section hero-section" id="home">
        <div className="page-shell hero-grid">
          <Reveal className="hero-copy">
            <p className="eyebrow">{profile.name}</p>
            <h1>{profile.role}</h1>
            <p className="hero-copy__intro">{profile.intro}</p>
            <div className="button-row">
              <ButtonLink to="/projects" icon="arrow">
                View Projects
              </ButtonLink>
              <ButtonLink to="#contact" variant="secondary">
                Contact Me
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal className="hero-art" delay={180}>
            <Monogram
              src={homePortrait}
              alt="Professional portrait of Sankhya Patra"
              priority
            />
          </Reveal>
        </div>
        <a className="scroll-cue" href="#about">
          <span>Scroll</span>
          <i />
        </a>
      </section>

      <section className="snap-section feature-section" id="about">
        <div className="page-shell feature-grid">
          <Reveal className="feature-visual">
            <Monogram
              src={aboutPortrait}
              alt="Sankhya Patra working at a laptop in a professional workspace"
              compact
            />
          </Reveal>
          <Reveal className="feature-copy" delay={100}>
            <SectionHeading
              eyebrow="About"
              title="Building products that solve real problems."
              description="A short introduction to my work, technical focus and development journey."
            />
            <ButtonLink to="/about" icon="arrow">
              Learn More
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="snap-section home-project-section" id="projects">
        <div className="page-shell home-project-showcase">
          <Reveal className="home-project-showcase__media">
            <div className="home-project-showcase__image-wrap">
              <OptimizedImage
                src={featuredProject.visual}
                alt={`${featuredProject.title} interface preview`}
              />
            </div>
          </Reveal>

          <Reveal className="home-project-showcase__content" delay={100}>
            <p className="eyebrow">Featured Project</p>

            <div className="home-project-showcase__meta">
              <span className="project-status-badge">
                {featuredProject.status}
              </span>
              <span>{featuredProject.period}</span>
            </div>

            <h2>{featuredProject.title}</h2>

            <span
              className="home-project-showcase__divider"
              aria-hidden="true"
            />

            <p className="home-project-showcase__summary">
              {featuredProject.summary}
            </p>

            <div className="button-row">
              <ButtonLink to={`/projects/${featuredProject.slug}`} icon="arrow">
                Case Study
              </ButtonLink>

              <ButtonLink to="/projects" variant="secondary">
                All Projects
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="snap-section contact-section" id="contact">
        <div className="page-shell contact-layout contact-layout--form">
          <Reveal className="contact-copy">
            <p className="eyebrow">Contact</p>

            <h2>Let’s build something thoughtful.</h2>

            <p className="contact-copy__description">{profile.availability}</p>

            <div className="contact-links">
              {profile.email ? (
                <a href={`mailto:${profile.email}`}>
                  <Icon name="mail" />
                  <span>{profile.email}</span>
                </a>
              ) : null}

              <a href={profile.github} target="_blank" rel="noreferrer">
                <Icon name="github" />
                <span>GitHub</span>
              </a>

              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <Icon name="linkedin" />
                <span>LinkedIn</span>
              </a>

              <Link to="/projects">
                <Icon name="arrow" />
                <span>View projects</span>
              </Link>
            </div>
          </Reveal>

          <Reveal className="contact-form-reveal" delay={120}>
            <ContactForm />
          </Reveal>
        </div>

        <div className="contact-section__footer">
          <Footer />
        </div>
      </section>
    </main>
  );
}
