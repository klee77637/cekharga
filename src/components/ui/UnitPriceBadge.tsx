import { PriceBand } from "@/lib/unit-price/calculator";

interface UnitPriceBadgeProps {
  band: PriceBand;
  className?: string;
}

export default function UnitPriceBadge({ band, className = "" }: UnitPriceBadgeProps) {
  let label = "Mahal";
  let badgeClass = "badge-mahal";

  if (band === "hemat") {
    label = "Paling Hemat";
    badgeClass = "badge-hemat";
  } else if (band === "sedang") {
    label = "Menengah";
    badgeClass = "badge-sedang";
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {label}
    </span>
  );
}
