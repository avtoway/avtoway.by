"use client";

import { useState } from "react";
import OverviewTab from "@/features/admin/autopodbor/ui/overview-tab";
import ContentTab from "@/features/admin/autopodbor/ui/content-tab";
import TariffsTab from "@/features/admin/autopodbor/ui/tariffs-tab";
import ProcessTab from "@/features/admin/autopodbor/ui/process-tab";
import ProofTab from "@/features/admin/autopodbor/ui/proof-tab";
import LeadsTab from "@/features/admin/autopodbor/ui/leads-tab";
import SettingsTab from "@/features/admin/autopodbor/ui/settings-tab";

type Tab = "overview" | "content" | "tariffs" | "process" | "proof" | "leads" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "content", label: "Контент" },
  { id: "tariffs", label: "Тарифы" },
  { id: "process", label: "Как работаем" },
  { id: "proof", label: "Доказательства" },
  { id: "leads", label: "Заявки" },
  { id: "settings", label: "Настройки" },
];

export default function AdminInspectionPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Автоподбор</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Лендинг /services/inspection: контент, тарифы, кейсы, отзывы, FAQ и заявки
        </p>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-800">
        {TABS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2 text-sm transition ${
              tab === item.id ? "border-red-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab onNavigate={setTab} />}
      {tab === "content" && <ContentTab />}
      {tab === "tariffs" && <TariffsTab />}
      {tab === "process" && <ProcessTab />}
      {tab === "proof" && <ProofTab />}
      {tab === "leads" && <LeadsTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}
