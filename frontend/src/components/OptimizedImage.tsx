import type {
  ComponentPropsWithoutRef,
} from "react";

type OptimizedImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  | "alt"
  | "loading"
  | "decoding"
  | "fetchPriority"
> & {
  alt: string;
  priority?: boolean;
};

export default function OptimizedImage({
  alt,
  priority = false,
  className,
  ...imageProps
}: OptimizedImageProps) {
  return (
    <img
      {...imageProps}
      className={[
        "optimized-image",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      alt={alt}
      loading={
        priority ? "eager" : "lazy"
      }
      decoding="async"
      fetchPriority={
        priority ? "high" : "auto"
      }
    />
  );
}