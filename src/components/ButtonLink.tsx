import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

type ButtonLinkProps = PropsWithChildren<{
  to: string;
  variant?: "primary" | "secondary" | "text";
  external?: boolean;
  download?: boolean;
  icon?: "arrow" | "download" | "external" | "github" | "mail";
}>;

export default function ButtonLink({
  children,
  to,
  variant = "primary",
  external = false,
  download = false,
  icon,
}: ButtonLinkProps) {
  const className = `button button--${variant}`;
  const content = (
    <>
      <span>{children}</span>
      {icon ? <Icon name={icon} size={18} /> : null}
    </>
  );

  if (external || download || to.startsWith("mailto:") || to.startsWith("#")) {
    return (
      <a
        className={className}
        href={to}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        download={download || undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link className={className} to={to}>
      {content}
    </Link>
  );
}
