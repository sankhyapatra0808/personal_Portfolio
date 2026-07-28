import OptimizedImage from "./OptimizedImage";

type MonogramProps = {
  src: string;
  alt: string;
  compact?: boolean;
  priority?: boolean;
};

export default function Monogram({
  src,
  alt,
  compact = false,
  priority = false,
}: MonogramProps) {
  return (
    <figure
      className={`profile-portrait ${
        compact ? "profile-portrait--compact" : ""
      }`}
    >
      <OptimizedImage
        className="profile-portrait__image"
        src={src}
        alt={alt}
        width={1200}
        height={1500}
        priority={priority}
      />

      <span
        className="profile-portrait__accent"
        aria-hidden="true"
      />

      <figcaption className="profile-portrait__label">
        Sankhya Patra
      </figcaption>
    </figure>
  );
}
