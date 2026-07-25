import { profile } from "../data/profile";

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <p>Designed and developed by {profile.name}.</p>
        <p>React · TypeScript · Vite · CSS</p>
      </div>

      <div className="footer__links">
        <a href={profile.github} target="_blank" rel="noreferrer">
          GitHub
        </a>

        <a href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>

        {profile.email ? (
          <a href={`mailto:${profile.email}`}>Email</a>
        ) : null}
      </div>
    </footer>
  );
}