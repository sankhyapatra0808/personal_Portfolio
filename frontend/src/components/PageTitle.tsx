import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type PageTitleProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

const defaultSocialImage =
  "/og-image.png";

function setMetaByName(
  name: string,
  content: string,
) {
  let element =
    document.head.querySelector<HTMLMetaElement>(
      `meta[name="${name}"]`,
    );

  if (!element) {
    element =
      document.createElement("meta");

    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute(
    "content",
    content,
  );
}

function setMetaByProperty(
  property: string,
  content: string,
) {
  let element =
    document.head.querySelector<HTMLMetaElement>(
      `meta[property="${property}"]`,
    );

  if (!element) {
    element =
      document.createElement("meta");

    element.setAttribute(
      "property",
      property,
    );

    document.head.appendChild(element);
  }

  element.setAttribute(
    "content",
    content,
  );
}

function setCanonicalUrl(
  canonicalUrl: string,
) {
  let element =
    document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

  if (!element) {
    element =
      document.createElement("link");

    element.setAttribute(
      "rel",
      "canonical",
    );

    document.head.appendChild(element);
  }

  element.setAttribute(
    "href",
    canonicalUrl,
  );
}

function createAbsoluteUrl(
  value: string,
  siteUrl: string,
) {
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const normalizedValue =
    value.startsWith("/")
      ? value
      : `/${value}`;

  return `${siteUrl}${normalizedValue}`;
}

export default function PageTitle({
  title,
  description,
  path,
  image = defaultSocialImage,
  type = "website",
  noIndex = false,
}: PageTitleProps) {
  const location = useLocation();

  useEffect(() => {
    const configuredSiteUrl =
      import.meta.env.VITE_SITE_URL?.trim();

    const siteUrl = (
      configuredSiteUrl ||
      window.location.origin
    ).replace(/\/$/, "");

    const routePath =
      path || location.pathname || "/";

    const normalizedPath =
      routePath === "/"
        ? "/"
        : routePath.startsWith("/")
          ? routePath
          : `/${routePath}`;

    const canonicalUrl =
      `${siteUrl}${normalizedPath}`;

    const socialImageUrl =
      createAbsoluteUrl(
        image,
        siteUrl,
      );

    document.title = title;

    setMetaByName(
      "description",
      description,
    );

    setMetaByName(
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large",
    );

    setCanonicalUrl(canonicalUrl);

    setMetaByProperty(
      "og:title",
      title,
    );

    setMetaByProperty(
      "og:description",
      description,
    );

    setMetaByProperty(
      "og:type",
      type,
    );

    setMetaByProperty(
      "og:url",
      canonicalUrl,
    );

    setMetaByProperty(
      "og:image",
      socialImageUrl,
    );

    setMetaByProperty(
      "og:image:secure_url",
      socialImageUrl,
    );

    setMetaByProperty(
      "og:image:alt",
      title,
    );

    setMetaByName(
      "twitter:card",
      "summary_large_image",
    );

    setMetaByName(
      "twitter:title",
      title,
    );

    setMetaByName(
      "twitter:description",
      description,
    );

    setMetaByName(
      "twitter:image",
      socialImageUrl,
    );

    setMetaByName(
      "twitter:image:alt",
      title,
    );
  }, [
    description,
    image,
    location.pathname,
    noIndex,
    path,
    title,
    type,
  ]);

  return null;
}