export type LandingAccent = "red" | "blue" | "amber" | "emerald";

export interface LandingBreadcrumb {
  label: string;
  href?: string;
}

export interface LandingStat {
  value: string;
  label: string;
}

export interface LandingHeroContent {
  badge: string;
  titleBefore: string;
  titleAccent: string;
  titleAfter?: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  icon: string;
  accent: LandingAccent;
  visualLabel?: string;
  statusLabel?: string;
  stats: LandingStat[];
  chips: string[];
}

export interface LandingFeatureItem {
  icon: string;
  title: string;
  text: string;
}

export interface LandingStepItem {
  title: string;
  text: string;
  meta?: string;
}

export interface LandingPriceItem {
  title: string;
  price: string;
  unit?: string;
  note?: string;
  badge?: string;
}

export interface LandingDirectionItem {
  country: string;
  flag: string;
  text: string;
  meta: string;
  accent: LandingAccent;
}

export interface LandingAudienceItem {
  icon: string;
  eyebrow: string;
  title: string;
  text: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  accent: LandingAccent;
}

export interface LandingComparisonSide {
  eyebrow: string;
  title: string;
  bullets: string[];
  accent: LandingAccent;
}

interface LandingSectionBase {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  accent?: LandingAccent;
  spacing?: "default" | "compact";
}

export interface LandingFeaturesSection extends LandingSectionBase {
  type: "features";
  columns?: 2 | 3 | 4;
  items: LandingFeatureItem[];
}

export interface LandingStepsSection extends LandingSectionBase {
  type: "steps";
  columns?: 3 | 4 | 5;
  items: LandingStepItem[];
}

export interface LandingPricesSection extends LandingSectionBase {
  type: "prices";
  note?: string;
  items: LandingPriceItem[];
}

export interface LandingDirectionsSection extends LandingSectionBase {
  type: "directions";
  items: LandingDirectionItem[];
}

export interface LandingAudienceSection extends LandingSectionBase {
  type: "audience";
  items: LandingAudienceItem[];
}

export interface LandingComparisonSection extends LandingSectionBase {
  type: "comparison";
  left: LandingComparisonSide;
  right: LandingComparisonSide;
}

export type LandingSectionContent =
  | LandingFeaturesSection
  | LandingStepsSection
  | LandingPricesSection
  | LandingDirectionsSection
  | LandingAudienceSection
  | LandingComparisonSection;

export interface LandingFaqItem {
  question: string;
  answer: string;
}

export interface LandingContent {
  breadcrumbs: LandingBreadcrumb[];
  schemaName: string;
  schemaDescription: string;
  hero: LandingHeroContent;
  sections: LandingSectionContent[];
  faqHeading: {
    badge?: string;
    title: string;
    subtitle?: string;
    accent?: LandingAccent;
  };
  faq: LandingFaqItem[];
  cta: {
    title: string;
    text: string;
    primaryLabel: string;
    accent?: LandingAccent;
  };
  leadPrep: {
    eyebrow: string;
    title: string;
    bullets: string[];
    note: string;
    accent: LandingAccent;
  };
  lead: {
    topic: string;
    title: string;
    description: string;
    commentPlaceholder: string;
    submitLabel: string;
    accent: LandingAccent;
  };
  stickyLabel: string;
}

export interface ServiceLanding {
  id: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle?: string;
  ogDescription?: string;
  content: LandingContent;
  isActive: boolean;
  updatedAt: string;
}

export interface ServiceLandingSummary {
  slug: string;
  seoTitle: string;
  isActive: boolean;
  updatedAt: string;
}
