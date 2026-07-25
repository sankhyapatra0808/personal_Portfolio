type MonogramProps = {
  compact?: boolean;
};

export default function Monogram({ compact = false }: MonogramProps) {
  return (
    <div className={`monogram ${compact ? "monogram--compact" : ""}`} aria-label="SP monogram artwork">
      <div className="monogram__orbit monogram__orbit--one" />
      <div className="monogram__orbit monogram__orbit--two" />
      <span>SP</span>
      <small>Sankhya Patra</small>
    </div>
  );
}
