/* ─── Автоподбор: доменные типы (без Prisma) ─── */

export interface AutoPodborSettings {
  id: string;
  isActive: boolean;
  heroBadge?: string;
  heroTitle: string;
  heroHighlight?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroImageAlt?: string;
  priceFrom?: number;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  viber?: string;
  address?: string;
  workingHours?: string;
  yearsExperience?: number;
  carsChecked?: number;
  citiesCount?: number;
  guaranteeDays?: number;
  avgSavings?: number;
  reportTime?: string;
  expertName?: string;
  expertRole?: string;
  expertQuote?: string;
  expertPhoto?: string;
  expertFacts?: string;
  disclaimer?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  noindex: boolean;
  updatedAt: string;
}

export interface AutoPodborSection {
  id: string;
  key: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  isActive: boolean;
  sortOrder: number;
}

export type TariffGroup = "rb" | "abroad" | "extra";

export interface AutoPodborTariff {
  id: string;
  slug: string;
  groupName: string;
  title: string;
  subtitle?: string;
  description?: string;
  price?: number;
  priceFrom: boolean;
  currency: string;
  unit?: string;
  duration?: string;
  includes?: string;
  badge?: string;
  icon: string;
  image?: string;
  ctaLabel: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface AutoPodborStep {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export type FeatureType = "risk" | "advantage" | "guarantee" | "trust";

export interface AutoPodborFeature {
  id: string;
  type: string;
  title: string;
  description?: string;
  icon: string;
  stat?: string;
  sortOrder: number;
  isActive: boolean;
}

export type CheckCategory = "body" | "engine" | "chassis" | "electronics" | "interior" | "legal";

export interface AutoPodborCheckItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  isCritical: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface AutoPodborCase {
  id: string;
  slug: string;
  title: string;
  brand?: string;
  model?: string;
  year?: number;
  budget?: number;
  purchasePrice?: number;
  tradeAmount?: number;
  days?: number;
  city?: string;
  task?: string;
  found?: string;
  result?: string;
  photos?: string;
  mainPhoto?: string;
  completedAt?: string;
  isActive: boolean;
  sortOrder: number;
}

export type ReviewSource = "site" | "yandex" | "google" | "telegram";

export interface AutoPodborReview {
  id: string;
  name: string;
  city?: string;
  car?: string;
  rating: number;
  text: string;
  source: string;
  sourceUrl?: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface AutoPodborFaq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AutoPodborGalleryItem {
  id: string;
  section: string;
  title?: string;
  alt: string;
  photo: string;
  prompt?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AutoPodborCity {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AutoPodborPromo {
  id: string;
  title: string;
  subtitle?: string;
  discount?: string;
  validUntil?: string;
  isActive: boolean;
  sortOrder: number;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "options_sent"
  | "meeting"
  | "done"
  | "cancelled"
  | "spam";

export interface AutoPodborLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  messenger?: string;
  city?: string;
  budgetFrom?: number;
  budgetTo?: number;
  brand?: string;
  model?: string;
  serviceSlug?: string;
  serviceTitle?: string;
  comment?: string;
  quiz?: string;
  source: string;
  status: string;
  priceQuoted?: number;
  assignedToId?: string | null;
  assignedTo?: { id: string; name: string } | null;
  internalNote?: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutoPodborPublicData {
  settings: AutoPodborSettings;
  sections: AutoPodborSection[];
  tariffs: AutoPodborTariff[];
  steps: AutoPodborStep[];
  features: AutoPodborFeature[];
  checks: AutoPodborCheckItem[];
  cases: AutoPodborCase[];
  reviews: AutoPodborReview[];
  faq: AutoPodborFaq[];
  cities: AutoPodborCity[];
  gallery: AutoPodborGalleryItem[];
  promos: AutoPodborPromo[];
}

export interface LeadFilters {
  status?: string;
  serviceSlug?: string;
  city?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface LeadListResult {
  items: AutoPodborLead[];
  total: number;
  page: number;
  limit: number;
}

export interface AutoPodborStats {
  total: number;
  newCount: number;
  inWork: number;
  done: number;
  cancelled: number;
  conversion: number;
  avgBudget: number;
  topTariff?: { title: string; count: number };
  byDay: { date: string; count: number }[];
  latest: AutoPodborLead[];
}
