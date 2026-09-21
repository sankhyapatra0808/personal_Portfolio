import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  /*
   * React calls this when a descendant component
   * throws an error while rendering.
   */
  static getDerivedStateFromError():
    AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  /*
   * This records the real error in the browser console.
   * Visitors only see the safe fallback message.
   */
  componentDidCatch(
    error: Error,
    errorInformation: ErrorInfo,
  ) {
    console.error(
      "Portfolio application error:",
      error,
      errorInformation,
    );
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          id="main-content"
          className="error-boundary"
          tabIndex={-1}
        >
          <section
            className="error-boundary__card"
            role="alert"
            aria-live="assertive"
          >
            <p className="eyebrow">
              Application error
            </p>

            <p
              className="error-boundary__code"
              aria-hidden="true"
            >
              500
            </p>

            <h1>
              Something went wrong.
            </h1>

            <p className="error-boundary__description">
              The page could not be displayed because
              an unexpected application error occurred.
              Reload the website or return to the
              homepage.
            </p>

            <div className="button-row">
              <button
                className="button button--primary"
                type="button"
                onClick={this.handleReload}
              >
                Reload page
              </button>

              <a
                className="button button--secondary"
                href="/"
              >
                Return home
              </a>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}