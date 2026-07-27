import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import { profile } from "../data/profile";
import Icon from "./Icon";

const navigationLinks = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "About",
    to: "/about",
  },
  {
    label: "Projects",
    to: "/projects",
  },
  {
    label: "Archive",
    to: "/projects/archive",
  },
];

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function Navigation() {
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();

  const menuButtonRef =
    useRef<HTMLButtonElement>(null);

  const overlayRef =
    useRef<HTMLElement>(null);

  const wasOpenRef = useRef(false);

  const closeMenu = () => {
    setOpen(false);
  };

  /*
   * Close the navigation automatically whenever
   * React Router changes to another page.
   */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /*
   * Prevent the page behind the menu from scrolling.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /*
   * Handle keyboard focus and Escape closing.
   */
  useEffect(() => {
    if (!open) {
      /*
       * Return keyboard focus to the menu button
       * after the menu has closed.
       */
      if (wasOpenRef.current) {
        window.requestAnimationFrame(() => {
          menuButtonRef.current?.focus();
        });
      }

      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;

    const overlay = overlayRef.current;
    const menuButton = menuButtonRef.current;

    if (!overlay || !menuButton) {
      return;
    }

    const getFocusableElements = () => {
      const overlayElements = Array.from(
        overlay.querySelectorAll<HTMLElement>(
          focusableSelector,
        ),
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !==
            "true",
      );

      /*
       * The fixed close button is outside the
       * overlay element, so include it manually.
       */
      return [
        menuButton,
        ...overlayElements,
      ];
    };

    const focusFrame =
      window.requestAnimationFrame(() => {
        menuButton.focus();
      });

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        getFocusableElements();

      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      /*
       * Shift + Tab from the first element
       * moves focus to the final menu element.
       */
      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      /*
       * Tab from the last element returns focus
       * to the close button.
       */
      if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.cancelAnimationFrame(
        focusFrame,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  return (
    <>
      <Link
        className="site-mark"
        to="/"
        aria-label="Go to homepage"
        onClick={closeMenu}
      >
        SP
      </Link>

      <button
        ref={menuButtonRef}
        className={`menu-button ${
          open
            ? "menu-button--open"
            : ""
        }`}
        type="button"
        aria-label={
          open
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={open}
        aria-controls="primary-navigation-dialog"
        onClick={() => {
          setOpen(
            (currentOpen) =>
              !currentOpen,
          );
        }}
      >
        <Icon
          name={open ? "close" : "menu"}
          size={24}
        />
      </button>

      <aside
        ref={overlayRef}
        id="primary-navigation-dialog"
        className={`navigation-overlay ${
          open
            ? "navigation-overlay--open"
            : ""
        }`}
        role="dialog"
        aria-modal={
          open ? "true" : undefined
        }
        aria-hidden={!open}
        aria-label="Website navigation"
        onMouseDown={(event) => {
          /*
           * Close only when the dark backdrop
           * itself was clicked.
           *
           * Clicking inside the menu content
           * will not close it accidentally.
           */
          if (
            event.target ===
            event.currentTarget
          ) {
            closeMenu();
          }
        }}
      >
        <div className="navigation-overlay__inner">
          <p className="eyebrow">
            Navigate
          </p>

          <nav aria-label="Primary navigation">
            {navigationLinks.map(
              (link, index) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? "navigation-link navigation-link--active"
                      : "navigation-link"
                  }
                  tabIndex={open ? 0 : -1}
                  onClick={closeMenu}
                >
                  <span aria-hidden="true">
                    {String(
                      index + 1,
                    ).padStart(2, "0")}
                  </span>

                  {link.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="navigation-overlay__footer">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              onClick={closeMenu}
            >
              GitHub
            </a>

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              onClick={closeMenu}
            >
              LinkedIn
            </a>

            {profile.email ? (
              <a
                href={`mailto:${profile.email}`}
                tabIndex={open ? 0 : -1}
                onClick={closeMenu}
              >
                Email
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}