import type { AutoPodborPublicData } from "@/entities/autopodbor/autopodbor.types";
import { isSectionActive, sectionHeading } from "../lib/defaults";
import { publicAssetExists } from "../lib/assets";
import Hero from "./hero";
import TrustBar from "./trust-bar";
import Quiz from "./quiz";
import Risks from "./risks";
import Tariffs from "./tariffs";
import Process from "./process";
import Checks from "./checks";
import Report from "./report";
import Cases from "./cases";
import Guarantees from "./guarantees";
import Expert from "./expert";
import Reviews from "./reviews";
import Geography from "./geography";
import Faq from "./faq";
import LeadForm from "./lead-form";
import StickyCta from "./sticky-cta";

export default function AutopodborPage({ data }: { data: AutoPodborPublicData }) {
  const { settings, sections, tariffs, steps, features, checks, cases, reviews, faq, cities, gallery, promos } = data;

  const trust = features.filter(item => item.type === "trust");
  const risks = features.filter(item => item.type === "risk");
  const advantages = features.filter(item => item.type === "advantage");
  const guarantees = features.filter(item => item.type === "guarantee");
  const reportGallery = gallery.filter(item => item.section === "report");
  const activePromo = promos.find(promo => promo.isActive);
  const reportDescription = sections.find(section => section.key === "report")?.description;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Hero
        settings={settings}
        tariffs={tariffs}
        trust={trust}
        hasImage={publicAssetExists(settings.heroImage)}
      />

      {activePromo && (
        <div className="border-b border-red-500/20 bg-red-500/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-3 text-center text-sm text-red-200">
            <span className="font-medium">{activePromo.title}</span>
            {activePromo.discount && <span className="text-red-300/80">{activePromo.discount}</span>}
            {activePromo.validUntil && <span className="text-xs text-red-300/60">до {activePromo.validUntil}</span>}
          </div>
        </div>
      )}

      {isSectionActive(sections, "trust") && <TrustBar items={trust} />}

      {isSectionActive(sections, "quiz") && (
        <Quiz
          heading={sectionHeading(sections, "quiz")}
          tariffs={tariffs}
          cities={cities}
          phone={settings.phone}
          telegram={settings.telegram}
        />
      )}

      {isSectionActive(sections, "risks") && <Risks heading={sectionHeading(sections, "risks")} items={risks} />}

      {isSectionActive(sections, "tariffs") && (
        <Tariffs
          heading={sectionHeading(sections, "tariffs")}
          tariffs={tariffs}
          disclaimer={settings.disclaimer}
        />
      )}

      {isSectionActive(sections, "process") && <Process heading={sectionHeading(sections, "process")} steps={steps} />}

      {isSectionActive(sections, "checks") && (
        <Checks
          heading={sectionHeading(sections, "checks")}
          checks={checks}
          equipment={sections.find(section => section.key === "checks")?.description}
        />
      )}

      {isSectionActive(sections, "report") && (
        <Report
          heading={sectionHeading(sections, "report")}
          gallery={reportGallery}
          description={reportDescription}
        />
      )}

      {isSectionActive(sections, "cases") && <Cases heading={sectionHeading(sections, "cases")} items={cases} />}

      {isSectionActive(sections, "guarantees") && (
        <Guarantees
          heading={sectionHeading(sections, "guarantees")}
          advantages={advantages}
          guarantees={guarantees}
          settings={settings}
        />
      )}

      {isSectionActive(sections, "expert") && (
        <Expert heading={sectionHeading(sections, "expert")} settings={settings} />
      )}

      {isSectionActive(sections, "reviews") && <Reviews heading={sectionHeading(sections, "reviews")} items={reviews} />}

      {isSectionActive(sections, "geography") && (
        <Geography heading={sectionHeading(sections, "geography")} cities={cities} />
      )}

      {isSectionActive(sections, "faq") && <Faq heading={sectionHeading(sections, "faq")} items={faq} />}

      {isSectionActive(sections, "lead") && (
        <LeadForm
          heading={sectionHeading(sections, "lead")}
          cities={cities}
          tariffs={tariffs}
          phone={settings.phone}
          telegram={settings.telegram}
          whatsapp={settings.whatsapp}
          viber={settings.viber}
          address={settings.address}
          workingHours={settings.workingHours}
        />
      )}

      <StickyCta phone={settings.phone} telegram={settings.telegram} />
    </div>
  );
}
