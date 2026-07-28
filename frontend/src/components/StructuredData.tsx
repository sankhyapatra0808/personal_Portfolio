import { useEffect } from "react";
import { profile } from "../data/profile";
import { projects } from "../data/projects";

const structuredDataElementId = "portfolio-structured-data";

function createAbsoluteUrl(value: string, siteUrl: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

export default function StructuredData() {
  useEffect(() => {
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

    const siteUrl = (configuredSiteUrl || window.location.origin).replace(
      /\/$/,
      "",
    );

    const personId = `${siteUrl}/#person`;
    const websiteId = `${siteUrl}/#website`;
    const profilePageId = `${siteUrl}/#profile-page`;
    const projectListId = `${siteUrl}/projects#project-list`;

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": personId,
          name: profile.name,
          url: `${siteUrl}/`,
          image: `${siteUrl}/og-image.png`,
          jobTitle: profile.role,
          description: profile.about,
          email: profile.email,
          homeLocation: {
            "@type": "Country",
            name: profile.location,
          },
          affiliation: {
            "@type": "CollegeOrUniversity",
            name: "KIIT, Bhubaneswar",
          },
          sameAs: [profile.github, profile.linkedin],
          knowsAbout: [
            "React",
            "TypeScript",
            "JavaScript",
            "Node.js",
            "Express",
            "React Native",
            "Expo",
            "PostgreSQL",
            "Firebase",
            "Responsive web design",
            "Mobile application development",
          ],
        },
        {
          "@type": "WebSite",
          "@id": websiteId,
          url: `${siteUrl}/`,
          name: "Sankhya Patra Portfolio",
          description:
            "Portfolio of Sankhya Patra, a full-stack developer building practical web and mobile products.",
          creator: {
            "@id": personId,
          },
          inLanguage: "en-IN",
        },
        {
          "@type": "ProfilePage",
          "@id": profilePageId,
          url: `${siteUrl}/`,
          name: "Sankhya Patra — Full-Stack & Mobile Developer",
          description:
            "Professional portfolio and selected software projects by Sankhya Patra.",
          isPartOf: {
            "@id": websiteId,
          },
          mainEntity: {
            "@id": personId,
          },
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: `${siteUrl}/og-image.png`,
            width: 1200,
            height: 630,
          },
        },
        {
          "@type": "ItemList",
          "@id": projectListId,
          url: `${siteUrl}/projects`,
          name: "Software projects by Sankhya Patra",
          numberOfItems: projects.length,
          itemListElement: projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "SoftwareSourceCode",
              name: project.title,
              description: project.summary,
              url: `${siteUrl}/projects/${project.slug}`,
              image: createAbsoluteUrl(project.visual, siteUrl),
              codeRepository: project.code,
              programmingLanguage: project.tech,
              dateCreated: project.year,
              creator: {
                "@id": personId,
              },
            },
          })),
        },
      ],
    };

    let script = document.getElementById(
      structuredDataElementId,
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = structuredDataElementId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(structuredData);

    return () => {
      script?.remove();
    };
  }, []);

  return null;
}
