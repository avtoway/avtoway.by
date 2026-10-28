import type { AutoPodborPublicData } from "@/entities/autopodbor/autopodbor.types";
import { isSectionActive, sectionHeading } from "../lib/defaults";
import Hero from "./hero";
import Quiz from "./quiz";
import Risks from "./risks";
import Tariffs from "./tariffs";
import Process from "./process";
import Checks from "./checks";
import Guarantees from "./guarantees";
import Expert from "./expert";
import Reviews from "./reviews";
import Faq from "./faq";
import LeadForm from "./lead-form";
import StickyCta from "./sticky-cta";

export default function AutopodborPage({ data }: { data: AutoPodborPublicData }) {
  const { settings, sections, tariffs, steps, features, checks, reviews, faq, cities } = data;

  const trust = features.filter(item => item.type === "trust");
  const risks = features.filter(item => item.type === "risk");
  const advantages = features.filter(item => item.type === "advantage");
  const guarantees = features.filter(item => item.type === "guarantee");

  return (
    <div className="min-h-screen bg-zinc-950">
      <Hero settings={settings} tariffs={tariffs} trust={trust} />

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

      {isSectionActive(sections, "faq") && <Faq heading={sectionHeading(sections, "faq")} items={faq} />}

      {isSectionActive(sections, "lead") && (
        <LeadForm
          heading={sectionHeading(sections, "lead")}
          cities={cities}
          tariffs={tariffs}
          phone={settings.phone}
          telegram={settings.telegram}
          address={settings.address}
          workingHours={settings.workingHours}
        />
      )}

      <StickyCta phone={settings.phone} telegram={settings.telegram} />
    </div>
  );
}
