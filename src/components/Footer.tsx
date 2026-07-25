import { profile } from "../data/profile";

export default function Footer() {
  return (
    <footer className="footer">
      <p>Designed and developed by {profile.name}.</p>
      <p>React · TypeScript · Vite · CSS</p>
    </footer>
  );
}
