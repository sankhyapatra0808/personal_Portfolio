import ButtonLink from "../components/ButtonLink";
import Footer from "../components/Footer";
import Monogram from "../components/Monogram";
import PageTitle from "../components/PageTitle";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { experience, profile, skillGroups } from "../data/profile";

export default function AboutPage() {
  return (
    <main id="main-content" className="inner-page" tabIndex={-1}>
      <PageTitle
        title="About — Sankhya Patra"
        description="About Sankhya Patra, a full-stack developer focused on React, TypeScript, Node.js and practical product engineering."
      />
      <section className="inner-hero">
        <div className="page-shell inner-hero__grid">
          <Reveal className="inner-hero__visual">
            <Monogram />
          </Reveal>
          <Reveal className="inner-hero__copy" delay={120}>
            <p className="eyebrow">About me</p>
            <h1>Developer, product thinker and continuous learner.</h1>
            <p>{profile.about}</p>
            <div className="button-row">
              {profile.resumeUrl ? (
                <ButtonLink to={profile.resumeUrl} download icon="download">
                  Download Resume
                </ButtonLink>
              ) : null}
              <ButtonLink to="/projects" variant="secondary">
                View Work
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="content-section">
        <div className="page-shell">
          <Reveal>
            <SectionHeading
              eyebrow="Capabilities"
              title="A practical full-stack toolkit."
              description="The portfolio itself uses the same focused frontend foundation as SplitVerse Website: React, TypeScript, Vite, React Router and handcrafted CSS."
            />
          </Reveal>
          <div className="skills-grid">
            {skillGroups.map((group, index) => (
              <Reveal
                className="skill-card"
                delay={index * 80}
                key={group.title}
              >
                <span className="skill-card__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{group.title}</h3>
                <p>{group.summary}</p>
                <ul className="tag-list">
                  {group.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section content-section--soft">
        <div className="page-shell timeline-layout">
          <Reveal>
            <SectionHeading
              eyebrow="Journey"
              title="Experience through building."
            />
          </Reveal>
          <div className="timeline">
            {experience.map((item, index) => (
              <Reveal
                className="timeline-item"
                delay={index * 90}
                key={`${item.title}-${item.period}`}
              >
                <div className="timeline-item__period">{item.period}</div>
                <div>
                  <h3>{item.title}</h3>
                  <h4>{item.organisation}</h4>
                  <p>{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="quote-section">
        <div className="page-shell">
          <Reveal>
            <blockquote>
              “Good software should make a difficult process feel obvious.”
            </blockquote>
            <p>— A principle behind my product work</p>
          </Reveal>
        </div>
      </section>
      <Footer />
    </main>
  );
}
