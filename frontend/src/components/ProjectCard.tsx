import { Link } from "react-router-dom";
import type { Project } from "../data/projects";
import Icon from "./Icon";
import Reveal from "./Reveal";
import OptimizedImage from "./OptimizedImage";

type ProjectCardProps = {
  project: Project;
  index?: number;
};

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <Reveal delay={Math.min(index * 80, 320)}>
      <Link className="project-card" to={`/projects/${project.slug}`}>
        <div className="project-card__image-wrap">
          <OptimizedImage
            className="project-card__image"
            src={project.visual}
            alt={`${project.title} interface preview`}
          />
          <span className="project-card__index">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="project-card__content">
          <div className="project-card__meta">
            <span className="project-status-badge">{project.status}</span>
            <span className="project-card__period">{project.period}</span>
          </div>
          <p className="eyebrow">{project.eyebrow}</p>
          <div className="project-card__title-row">
            <h3>{project.title}</h3>
            <Icon name="arrow" />
          </div>
          <p>{project.summary}</p>
          <p className="project-card__role">{project.role}</p>
          <ul className="tag-list" aria-label={`${project.title} technologies`}>
            {project.tech.slice(0, 6).map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </div>
      </Link>
    </Reveal>
  );
}
