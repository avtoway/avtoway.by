import { formatPrice } from "../lib/parse";

export default function Price({
  value,
  from,
  currency = "BYN",
  className = "",
}: {
  value?: number;
  from?: boolean;
  currency?: string;
  className?: string;
}) {
  const text = formatPrice(value, { from, currency });
  if (!text) return null;
  return <span className={className}>{text}</span>;
}
