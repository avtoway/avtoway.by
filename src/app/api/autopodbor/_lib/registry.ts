import type { ZodType } from "zod";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import {
  caseSchema,
  checkSchema,
  citySchema,
  faqSchema,
  featureSchema,
  gallerySchema,
  promoSchema,
  reviewSchema,
  sectionSchema,
  stepSchema,
  tariffSchema,
} from "@/entities/autopodbor/autopodbor.schema";
import { slugify } from "@/shared/lib/slug";

export interface EntityDef {
  /** Имя сущности для аудита */
  entity: string;
  schema: ZodType;
  list: (repo: AutoPodborRepository) => Promise<unknown[]>;
  create: (repo: AutoPodborRepository, data: Record<string, unknown>) => Promise<unknown>;
  update: (repo: AutoPodborRepository, id: string, data: Record<string, unknown>) => Promise<unknown>;
  remove: (repo: AutoPodborRepository, id: string) => Promise<unknown>;
  /** Дополнить/почистить данные перед create/update */
  prepare?: (data: Record<string, unknown>, mode: "create" | "update") => Record<string, unknown>;
}

function slugFromTitle(data: Record<string, unknown>, mode: "create" | "update"): Record<string, unknown> {
  const slug = typeof data.slug === "string" ? data.slug.trim() : "";
  if (slug) return { ...data, slug };
  if (mode === "update") {
    const rest = { ...data };
    delete rest.slug;
    return rest;
  }
  const title = typeof data.title === "string" ? data.title : typeof data.name === "string" ? data.name : "";
  return { ...data, slug: slugify(title) || `item-${Date.now()}` };
}

function stripEmpty(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== "" && value !== undefined) out[key] = value;
  }
  return out;
}

export const ENTITY_REGISTRY: Record<string, EntityDef> = {
  sections: {
    entity: "AutoPodborSection",
    schema: sectionSchema,
    list: repo => repo.getSections(false),
    create: (repo, data) => repo.createSection(stripEmpty(data) as never),
    update: (repo, id, data) => repo.updateSection(id, stripEmpty(data) as never),
    remove: (repo, id) => repo.deleteSection(id),
  },
  tariffs: {
    entity: "AutoPodborTariff",
    schema: tariffSchema,
    list: repo => repo.getTariffs(false),
    create: (repo, data) => repo.createTariff(slugFromTitle(stripEmpty(data), "create") as never),
    update: (repo, id, data) => repo.updateTariff(id, slugFromTitle(stripEmpty(data), "update") as never),
    remove: (repo, id) => repo.deleteTariff(id),
  },
  steps: {
    entity: "AutoPodborStep",
    schema: stepSchema,
    list: repo => repo.getSteps(false),
    create: (repo, data) => repo.createStep(stripEmpty(data) as never),
    update: (repo, id, data) => repo.updateStep(id, stripEmpty(data) as never),
    remove: (repo, id) => repo.deleteStep(id),
  },
  features: {
    entity: "AutoPodborFeature",
    schema: featureSchema,
    list: repo => repo.getFeatures(false),
    create: (repo, data) => repo.createFeature(stripEmpty(data) as never),
    update: (repo, id, data) => repo.updateFeature(id, stripEmpty(data) as never),
    remove: (repo, id) => repo.deleteFeature(id),
  },
  checks: {
    entity: "AutoPodborCheckItem",
    schema: checkSchema,
    list: repo => repo.getChecks(false),
    create: (repo, data) => repo.createCheck(stripEmpty(data) as never),
    update: (repo, id, data) => repo.updateCheck(id, stripEmpty(data) as never),
    remove: (repo, id) => repo.deleteCheck(id),
  },
  cases: {
    entity: "AutoPodborCase",
    schema: caseSchema,
    list: repo => repo.getCases(false),
    create: (repo, data) => repo.createCase(slugFromTitle(stripEmpty(data), "create") as never),
    update: (repo, id, data) => repo.updateCase(id, slugFromTitle(stripEmpty(data), "update") as never),
    remove: (repo, id) => repo.deleteCase(id),
  },
  reviews: {
    entity: "AutoPodborReview",
    schema: reviewSchema,
    list: repo => repo.getReviews(false),
    create: (repo, data) => repo.createReview(stripEmpty(data) as never),
    update: (repo, id, data) => repo.updateReview(id, stripEmpty(data) as never),
    remove: (repo, id) => repo.deleteReview(id),
  },
  faq: {
    entity: "AutoPodborFaq",
    schema: faqSchema,
    list: repo => repo.getFaq(false),
    create: (repo, data) => repo.createFaq(stripEmpty(data) as never),
    update: (repo, id, data) => repo.updateFaq(id, stripEmpty(data) as never),
    remove: (repo, id) => repo.deleteFaq(id),
  },
  gallery: {
    entity: "AutoPodborGalleryItem",
    schema: gallerySchema,
    list: repo => repo.getGallery(false),
    create: (repo, data) => repo.createGalleryItem(stripEmpty(data) as never),
    update: (repo, id, data) => repo.updateGalleryItem(id, stripEmpty(data) as never),
    remove: (repo, id) => repo.deleteGalleryItem(id),
  },
  cities: {
    entity: "AutoPodborCity",
    schema: citySchema,
    list: repo => repo.getCities(false),
    create: (repo, data) => {
      const clean = stripEmpty(data);
      if (!clean.slug) clean.slug = slugify(String(clean.name ?? "")) || `city-${Date.now()}`;
      return repo.createCity(clean as never);
    },
    update: (repo, id, data) => repo.updateCity(id, slugFromTitle(stripEmpty(data), "update") as never),
    remove: (repo, id) => repo.deleteCity(id),
  },
  promos: {
    entity: "AutoPodborPromo",
    schema: promoSchema,
    list: repo => repo.getPromos(false),
    create: (repo, data) => repo.createPromo(stripEmpty(data) as never),
    update: (repo, id, data) => repo.updatePromo(id, stripEmpty(data) as never),
    remove: (repo, id) => repo.deletePromo(id),
  },
};
