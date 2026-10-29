import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { FaqSchema, ServiceSchema } from "@/shared/ui/json-ld";
import LandingHero from "./landing-hero";
import LandingLeadForm from "./landing-lead-form";
import LandingIcon from "./icon";
import {
  ACCENTS,
  CtaBand,
  DirectionCard,
  Faq,
  FeatureGrid,
  LandingSection,
  PriceGrid,
  SectionHeading,
  Steps,
  StickyCta,
  type LandingAccent,
} from "./landing-ui";
import type {
  LandingAudienceItem,
  LandingComparisonSide,
  LandingContent,
  LandingSectionContent,
} from "@/entities/service-landing/service-landing.types";

function HeroTitle({ content }: { content: LandingContent }) {
  const { titleBefore, titleAccent, titleAfter } = content.hero;
  return (
    <>
      {titleBefore} <span className="text-primary">{titleAccent}</span>
      {titleAfter && (
        <>
          <br className="hidden sm:block" />
          {titleAfter.split("\n").map((line, index) => (
            <span key={`${line}-${index}`}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </>
      )}
    </>
  );
}

function AudienceCard({ item }: { item: LandingAudienceItem }) {
  const tone = ACCENTS[item.accent];
  const button =
    item.accent === "amber"
      ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
      : item.accent === "blue"
        ? "border border-blue-400/30 bg-blue-500/10 text-blue-200 hover:border-blue-300/50 hover:text-white"
        : "bg-primary text-white hover:bg-primary-dark";

  return (
    <div className={`rounded-3xl border ${tone.badge} bg-gradient-to-br from-zinc-900 via-zinc-900/60 to-zinc-950 p-6 sm:p-8`}>
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tone.icon}`}>
        <LandingIcon name={item.icon} className="h-5 w-5" />
      </span>
      <p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.badge.split(" ").find(value => value.startsWith("text-")) ?? "text-zinc-300"}`}>
        {item.eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
      <ul className="mt-5 space-y-3 text-sm text-zinc-400">
        {item.bullets.map(bullet => (
          <li key={bullet} className="flex gap-2.5">
            <span className="mt-0.5">
              <LandingIcon name="check" className="h-4 w-4" />
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <a
        href={item.ctaHref}
        className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5 ${button}`}
      >
        {item.ctaLabel}
        <LandingIcon name="arrow-right" className="h-4 w-4" />
      </a>
    </div>
  );
}

function ComparisonCard({ side }: { side: LandingComparisonSide }) {
  const tone = ACCENTS[side.accent];
  return (
    <div className={`rounded-3xl border ${side.accent === "blue" ? "border-blue-500/20" : "border-zinc-800"} bg-zinc-900/30 p-6 sm:p-8`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.badge.split(" ").find(value => value.startsWith("text-")) ?? "text-zinc-500"}`}>
        {side.eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-bold text-white">{side.title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-zinc-500">
        {side.bullets.map(bullet => (
          <li key={bullet} className="flex gap-2.5">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${side.accent === "blue" ? "bg-blue-400" : "bg-zinc-700"}`} />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionBody({ section }: { section: LandingSectionContent }) {
  switch (section.type) {
    case "features":
      return <FeatureGrid items={section.items} accent={section.accent} columns={section.columns} />;
    case "steps":
      return <Steps items={section.items} accent={section.accent} columns={section.columns} />;
    case "prices":
      return <PriceGrid items={section.items} note={section.note} accent={section.accent} />;
    case "directions":
      return (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map(item => (
            <DirectionCard
              key={item.country}
              country={item.country}
              flag={item.flag}
              text={item.text}
              meta={item.meta}
              accent={item.accent}
            />
          ))}
        </div>
      );
    case "audience":
      return (
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {section.items.map(item => <AudienceCard key={item.title} item={item} />)}
        </div>
      );
    case "comparison":
      return (
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <ComparisonCard side={section.left} />
          <ComparisonCard side={section.right} />
        </div>
      );
    default:
      return null;
  }
}

export default function LandingPageView({
  slug,
  content,
  phone,
}: {
  slug: string;
  content: LandingContent;
  phone: string | null;
}) {
  const heroAccent: LandingAccent = content.hero.accent;
  const leadAccent = content.lead.accent;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <ServiceSchema
        name={content.schemaName}
        description={content.schemaDescription}
        url={`/services/${slug}`}
      />
      <BreadcrumbSchema items={content.breadcrumbs} />
      <FaqSchema items={content.faq} />

      <LandingHero
        badge={content.hero.badge}
        title={<HeroTitle content={content} />}
        subtitle={content.hero.subtitle}
        primaryLabel={content.hero.primaryLabel}
        secondaryLabel={content.hero.secondaryLabel}
        secondaryHref={content.hero.secondaryHref}
        phone={phone}
        stats={content.hero.stats}
        chips={content.hero.chips}
        icon={content.hero.icon}
        accent={heroAccent}
        breadcrumbs={content.breadcrumbs}
        visualLabel={content.hero.visualLabel}
        statusLabel={content.hero.statusLabel}
      />

      {content.sections.map(section => (
        <LandingSection
          key={section.id}
          id={section.id}
          className={section.spacing === "compact" ? "pt-0" : ""}
        >
          <SectionHeading
            badge={section.badge}
            title={section.title}
            subtitle={section.subtitle}
            accent={section.accent}
          />
          <SectionBody section={section} />
        </LandingSection>
      ))}

      <CtaBand
        title={content.cta.title}
        text={content.cta.text}
        primaryLabel={content.cta.primaryLabel}
        phone={phone}
        accent={content.cta.accent}
      />

      <LandingSection>
        <SectionHeading
          badge={content.faqHeading.badge}
          title={content.faqHeading.title}
          subtitle={content.faqHeading.subtitle}
          accent={content.faqHeading.accent}
        />
        <Faq items={content.faq} accent={content.faqHeading.accent} />
      </LandingSection>

      <LandingSection className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{content.leadPrep.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{content.leadPrep.title}</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-400">
              {content.leadPrep.bullets.map(item => (
                <li key={item} className="flex gap-2.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${ACCENTS[content.leadPrep.accent].glow}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/60 px-5 text-sm font-medium text-white transition hover:border-zinc-500"
              >
                <LandingIcon name="phone" className="h-4 w-4 text-primary" />
                {phone}
              </a>
            )}
            <p className="mt-4 text-xs leading-relaxed text-zinc-600">{content.leadPrep.note}</p>
          </div>

          <LandingLeadForm
            topic={content.lead.topic}
            serviceSlug={slug}
            title={content.lead.title}
            description={content.lead.description}
            commentPlaceholder={content.lead.commentPlaceholder}
            submitLabel={content.lead.submitLabel}
            accent={leadAccent}
            phone={phone}
          />
        </div>
      </LandingSection>

      <StickyCta phone={phone} formLabel={content.stickyLabel} />
    </div>
  );
}
