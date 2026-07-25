import { Link } from "react-router-dom";
import type { Project } from "../data/projects";
import Icon from "./Icon";
import Reveal from "./Reveal";

type ProjectCardProps = {
  project: Project;
  index?: number;
};

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <Reveal delay={Math.min(index * 80, 320)}>
      <Link className="project-card" to={`/projects/${project.slug}`}>
        <div className="project-card__image-wrap">
          <img className="project-card__image" src={project.visual} alt={`${project.title} interface preview`} />
          <span className="project-card__index">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="project-card__content">
          <p className="eyebrow">{project.eyebrow}</p>
          <div className="project-card__title-row">
            <h3>{project.title}</h3>
            <Icon name="arrow" />
          </div>
          <p>{project.summary}</p>
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
