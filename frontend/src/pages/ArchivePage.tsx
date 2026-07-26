import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import PageTitle from "../components/PageTitle";
import Reveal from "../components/Reveal";
import { projects } from "../data/projects";

export default function ArchivePage() {
  return (
    <main className="inner-page archive-page">
      <PageTitle title="Project Archive — Sankhya Patra" description="A compact archive of projects by Sankhya Patra." />
      <section className="archive-section">
        <div className="page-shell">
          <Reveal>
            <p className="eyebrow">Archive</p>
            <h1>All projects.</h1>
            <p className="archive-intro">A compact view of the work currently included in this portfolio.</p>
          </Reveal>
          <div className="archive-table" role="table" aria-label="Project archive">
            <div className="archive-row archive-row--header" role="row">
              <span>Year</span><span>Project</span><span>Status</span><span>Built with</span><span>Open</span>
            </div>
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 60}>
                <Link className="archive-row" role="row" to={`/projects/${project.slug}`}>
                  <span>{project.year}</span>
                  <strong>{project.title}</strong>
                  <span className="archive-status">{project.status}</span>
                  <span className="archive-tech">{project.tech.slice(0, 5).join(" · ")}</span>
                  <Icon name="arrow" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
