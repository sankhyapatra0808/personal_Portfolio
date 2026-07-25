import { useEffect, useRef, useState, type PropsWithChildren } from "react";

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const reference = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = reference.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.14 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={reference}
      className={`reveal ${visible ? "reveal--visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
