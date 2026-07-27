import ButtonLink from "../components/ButtonLink";
import PageTitle from "../components/PageTitle";

export default function NotFoundPage() {
  return (
    <main id="main-content" className="not-found-page" tabIndex={-1}>
      <PageTitle title="Page Not Found — Sankhya Patra" />
      <p className="eyebrow">404</p>
      <h1>This page does not exist.</h1>
      <p>The link may be outdated, or the page may have moved.</p>
      <ButtonLink to="/" icon="arrow">
        Return Home
      </ButtonLink>
    </main>
  );
}
