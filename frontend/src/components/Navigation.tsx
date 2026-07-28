import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
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

const HOME_TRANSITION_DURATION = 650;

const SITE_MARK_STEP_DURATION = 58;

const siteMarkNameSteps = [
  {
    first: "S",
    last: "P",
  },
  {
    first: "Sa",
    last: "Pa",
  },
  {
    first: "San",
    last: "Pat",
  },
  {
    first: "Sank",
    last: "Patr",
  },
  {
    first: "Sankh",
    last: "Patra",
  },
  {
    first: "Sankhy",
    last: "Patra",
  },
  {
    first: "Sankhya",
    last: "Patra",
  },
] as const;

type HomeTransitionPhase =
  | "idle"
  | "waiting"
  | "opening"
  | "closing";

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

  const [siteMarkStep, setSiteMarkStep] =
    useState(0);

  const [siteMarkHovered, setSiteMarkHovered] =
    useState(false);

  const [homeTransitionPhase, setHomeTransitionPhase] =
    useState<HomeTransitionPhase>("idle");

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const menuButtonRef =
    useRef<HTMLButtonElement>(null);

  const overlayRef =
    useRef<HTMLElement>(null);

  const wasOpenRef = useRef(false);

  const homeTransitionTimersRef =
    useRef<number[]>([]);

  const siteMarkAnimationTimerRef =
    useRef<number | null>(null);

  const siteMarkStepRef =
    useRef(0);

  const closeMenu = () => {
    setOpen(false);
  };

  const updateSiteMarkStep = (
    nextStep: number,
  ) => {
    siteMarkStepRef.current = nextStep;
    setSiteMarkStep(nextStep);
  };

  const clearSiteMarkAnimation = () => {
    if (
      siteMarkAnimationTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        siteMarkAnimationTimerRef.current,
      );

      siteMarkAnimationTimerRef.current =
        null;
    }
  };

  const animateSiteMarkTo = (
    targetStep: number,
  ) => {
    clearSiteMarkAnimation();

    const runNextStep = () => {
      const currentStep =
        siteMarkStepRef.current;

      if (currentStep === targetStep) {
        siteMarkAnimationTimerRef.current =
          null;
        return;
      }

      const direction =
        targetStep > currentStep ? 1 : -1;

      const nextStep =
        currentStep + direction;

      updateSiteMarkStep(nextStep);

      if (nextStep !== targetStep) {
        siteMarkAnimationTimerRef.current =
          window.setTimeout(
            runNextStep,
            SITE_MARK_STEP_DURATION,
          );
      } else {
        siteMarkAnimationTimerRef.current =
          null;
      }
    };

    runNextStep();
  };

  const handleSiteMarkMouseEnter = () => {
    if (homeTransitionPhase !== "idle") {
      return;
    }

    setSiteMarkHovered(true);

    animateSiteMarkTo(
      siteMarkNameSteps.length - 1,
    );
  };

  const handleSiteMarkMouseLeave = () => {
    setSiteMarkHovered(false);
    clearSiteMarkAnimation();
    updateSiteMarkStep(0);
  };

  const resetSiteMark = () => {
    setSiteMarkHovered(false);
    clearSiteMarkAnimation();
    updateSiteMarkStep(0);
  };

  const clearHomeTransitionTimers = () => {
    homeTransitionTimersRef.current.forEach(
      (timerId) => {
        window.clearTimeout(timerId);
      },
    );

    homeTransitionTimersRef.current = [];
  };

  const scheduleHomeTransitionStep = (
    callback: () => void,
    delay: number,
  ) => {
    const timerId = window.setTimeout(
      callback,
      delay,
    );

    homeTransitionTimersRef.current.push(
      timerId,
    );
  };

  const scrollToHomepageTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    const homePage =
      document.querySelector<HTMLElement>(
        ".home-page",
      );

    homePage?.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    document
      .getElementById("home")
      ?.scrollIntoView({
        behavior: "auto",
        block: "start",
        inline: "nearest",
      });
  };

  const startHomepageTransition = () => {
    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const transitionDuration =
      prefersReducedMotion
        ? 20
        : HOME_TRANSITION_DURATION;

    setHomeTransitionPhase("opening");

    scheduleHomeTransitionStep(() => {
      navigate("/", {
        replace: pathname === "/",
      });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToHomepageTop();

          setHomeTransitionPhase(
            "closing",
          );

          scheduleHomeTransitionStep(
            () => {
              setHomeTransitionPhase(
                "idle",
              );
            },
            transitionDuration,
          );
        });
      });
    }, transitionDuration);
  };

  const handleSiteMarkClick = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();

    if (homeTransitionPhase !== "idle") {
      return;
    }

    resetSiteMark();
    clearHomeTransitionTimers();

    if (open) {
      const prefersReducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

      setHomeTransitionPhase("waiting");
      closeMenu();

      scheduleHomeTransitionStep(
        startHomepageTransition,
        prefersReducedMotion
          ? 20
          : HOME_TRANSITION_DURATION,
      );

      return;
    }

    startHomepageTransition();
  };

  useEffect(() => {
    return () => {
      homeTransitionTimersRef.current.forEach(
        (timerId) => {
          window.clearTimeout(timerId);
        },
      );

      if (
        siteMarkAnimationTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          siteMarkAnimationTimerRef.current,
        );
      }
    };
  }, []);

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
        className={`site-mark ${
          siteMarkHovered
            ? "site-mark--expanded"
            : ""
        } ${
          homeTransitionPhase !== "idle"
            ? "site-mark--transitioning"
            : ""
        }`}
        to="/"
        aria-label="Go to the top of the homepage"
        aria-disabled={
          homeTransitionPhase !== "idle"
        }
        onMouseEnter={
          handleSiteMarkMouseEnter
        }
        onMouseLeave={
          handleSiteMarkMouseLeave
        }
        onClick={handleSiteMarkClick}
      >
        <span
          className="site-mark__label"
          aria-hidden="true"
        >
          <span>
            {
              siteMarkNameSteps[
                siteMarkStep
              ].first
            }
          </span>

          <span>
            {
              siteMarkNameSteps[
                siteMarkStep
              ].last
            }
          </span>
        </span>
      </Link>

      <div
        className={`home-transition-overlay ${
          homeTransitionPhase !== "idle"
            ? "home-transition-overlay--active"
            : ""
        } ${
          homeTransitionPhase === "opening"
            ? "home-transition-overlay--open"
            : ""
        }`}
        aria-hidden="true"
      />

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