import { Link } from "react-router-dom";
import ButtonLink from "../components/ButtonLink";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import Monogram from "../components/Monogram";
import PageTitle from "../components/PageTitle";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { profile } from "../data/profile";
import { projects } from "../data/projects";

const sections = ["home", "about", "projects", "contact"];

export default function HomePage() {
  const featuredProject = projects.find((project) => project.featured) ?? projects[0];

  return (
    <main className="home-page">
      <PageTitle title="Sankhya Patra — Full-Stack Developer" description="Portfolio of Sankhya Patra featuring SplitVerse, DevArena and selected web and mobile work." />
      <nav className="section-dots" aria-label="Homepage sections">
        {sections.map((section, index) => (
          <a key={section} href={`#${section}`} aria-label={`Go to ${section} section`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
          </a>
        ))}
      </nav>

      <section className="snap-section hero-section" id="home">
        <div className="page-shell hero-grid">
          <Reveal className="hero-copy">
            <p className="eyebrow">{profile.name}</p>
            <h1>{profile.role}</h1>
            <p className="hero-copy__intro">{profile.intro}</p>
            <div className="button-row">
              <ButtonLink to="/projects" icon="arrow">View Projects</ButtonLink>
              <ButtonLink to="#contact" variant="secondary">Contact Me</ButtonLink>
            </div>
          </Reveal>
          <Reveal className="hero-art" delay={180}>
            <Monogram />
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
            <Monogram compact />
          </Reveal>
          <Reveal className="feature-copy" delay={100}>
            <SectionHeading
              eyebrow="About"
              title="Building products that solve real problems."
              description="A short introduction to my work, technical focus and development journey."
            />
            <ButtonLink to="/about" icon="arrow">Learn More</ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="snap-section feature-section feature-section--project" id="projects">
        <div className="page-shell feature-grid">
          <Reveal className="feature-visual project-feature-visual">
            <img src={featuredProject.visual} alt={`${featuredProject.title} preview`} />
          </Reveal>
          <Reveal className="feature-copy" delay={100}>
            <SectionHeading
              eyebrow="Selected work"
              title={featuredProject.title}
              description={featuredProject.summary}
            />
            <div className="button-row">
              <ButtonLink to={`/projects/${featuredProject.slug}`} icon="arrow">Case Study</ButtonLink>
              <ButtonLink to="/projects" variant="secondary">All Projects</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="snap-section contact-section" id="contact">
        <div className="page-shell contact-layout">
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h2>Let’s build something thoughtful.</h2>
            <p>{profile.availability}</p>
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
              <Link to="/projects">
                <Icon name="arrow" />
                <span>View projects</span>
              </Link>
            </div>
          </Reveal>
        </div>
        <Footer />
      </section>
    </main>
  );
}
