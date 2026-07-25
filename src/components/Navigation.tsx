import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { profile } from "../data/profile";
import Icon from "./Icon";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Archive", to: "/projects/archive" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Link className="site-mark" to="/" aria-label="Go to homepage">
        SP
      </Link>
      <button
        className={`menu-button ${open ? "menu-button--open" : ""}`}
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name={open ? "close" : "menu"} size={24} />
      </button>
      <aside
        className={`navigation-overlay ${open ? "navigation-overlay--open" : ""}`}
        aria-hidden={!open}
      >
        <div className="navigation-overlay__inner">
          <p className="eyebrow">Navigate</p>
          <nav aria-label="Primary navigation">
            {links.map((link, index) => (
              <NavLink
                className={({ isActive }: { isActive: boolean }) =>
                  isActive
                    ? "navigation-link navigation-link--active"
                    : "navigation-link"
                }
                key={link.to}
                to={link.to}
                tabIndex={open ? 0 : -1}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="navigation-overlay__footer">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
            >
              LinkedIn
            </a>
            {profile.email ? (
              <a href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1}>
                Email
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
