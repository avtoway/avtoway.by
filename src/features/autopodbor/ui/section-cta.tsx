import ServiceCta from "./service-cta";

export default function SectionCta({
  label,
  slug,
  hint,
}: {
  label: string;
  slug?: string;
  hint?: string;
}) {
  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 text-center sm:flex-row sm:justify-center sm:gap-4 sm:text-left">
        {hint && <p className="text-sm text-zinc-500">{hint}</p>}
        <ServiceCta
          slug={slug}
          label={label}
          variant="primary"
          className="w-full shrink-0 sm:w-auto"
        />
      </div>
    </div>
  );
}
