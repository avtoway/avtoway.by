export default function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
}: {
  badge?: string;
  title?: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  if (!title) return null;
  const alignment = align === "left" ? "text-left items-start" : "text-center items-center mx-auto";

  return (
    <div className={`mb-10 flex max-w-3xl flex-col sm:mb-14 ${alignment}`}>
      {badge && (
        <span className="mb-4 inline-flex rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
          {badge}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
