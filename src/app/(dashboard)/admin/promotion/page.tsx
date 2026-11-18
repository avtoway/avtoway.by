"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import {
  AD_PLACEMENTS,
  CAMPAIGN_STATUSES,
  PROMOTION_CHANNELS,
  type AdSlot,
  type CampaignStatus,
  type PromotionCampaign,
  type PromotionChannel,
} from "@/entities/promotion/promotion.types";
import AdsTxtEditor from "@/features/promotion/ui/ads-txt-editor";

type Tab = "campaigns" | "slots" | "utm" | "help";

const input = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";
const label = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500";
const smallBtn = "rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white";

const STATUS_STYLE: Record<CampaignStatus, string> = {
  planned: "border-slate-700 bg-slate-800 text-slate-300",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  finished: "border-zinc-700 bg-zinc-800 text-zinc-500",
};

interface CampaignFormState {
  id?: string;
  title: string;
  channel: PromotionChannel;
  status: CampaignStatus;
  budget: string;
  spend: string;
  startDate: string;
  endDate: string;
  targetUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  notes: string;
}

interface SlotFormState {
  id?: string;
  key: string;
  title: string;
  placement: string;
  html: string;
  imageUrl: string;
  targetUrl: string;
  height: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

function emptyCampaign(): CampaignFormState {
  return {
    title: "",
    channel: "google_ads",
    status: "planned",
    budget: "",
    spend: "",
    startDate: "",
    endDate: "",
    targetUrl: "",
    utmSource: "",
    utmMedium: "cpc",
    utmCampaign: "",
    notes: "",
  };
}

function campaignToForm(campaign: PromotionCampaign): CampaignFormState {
  return {
    id: campaign.id,
    title: campaign.title,
    channel: campaign.channel,
    status: campaign.status,
    budget: campaign.budget != null ? String(campaign.budget) : "",
    spend: campaign.spend != null ? String(campaign.spend) : "",
    startDate: campaign.startDate ?? "",
    endDate: campaign.endDate ?? "",
    targetUrl: campaign.targetUrl ?? "",
    utmSource: campaign.utmSource ?? "",
    utmMedium: campaign.utmMedium ?? "",
    utmCampaign: campaign.utmCampaign ?? "",
    notes: campaign.notes ?? "",
  };
}

function emptySlot(): SlotFormState {
  return {
    key: "",
    title: "",
    placement: "home_top",
    html: "",
    imageUrl: "",
    targetUrl: "",
    height: "250",
    isActive: false,
    startsAt: "",
    endsAt: "",
  };
}

function slotToForm(slot: AdSlot): SlotFormState {
  return {
    id: slot.id,
    key: slot.key,
    title: slot.title,
    placement: slot.placement,
    html: slot.html ?? "",
    imageUrl: slot.imageUrl ?? "",
    targetUrl: slot.targetUrl ?? "",
    height: String(slot.height),
    isActive: slot.isActive,
    startsAt: slot.startsAt ? slot.startsAt.slice(0, 16) : "",
    endsAt: slot.endsAt ? slot.endsAt.slice(0, 16) : "",
  };
}

function money(value?: number): string {
  if (value == null) return "—";
  return `${value.toLocaleString("ru-RU")} BYN`;
}

export default function AdminPromotionPage() {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [campaignForm, setCampaignForm] = useState<CampaignFormState | null>(null);
  const [slotForm, setSlotForm] = useState<SlotFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const [campaignsRes, slotsRes] = await Promise.all([
        fetch("/api/promotion/campaigns", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/promotion/slots", { cache: "no-store" }).then(r => r.json()),
      ]);
      if (campaignsRes.ok) setCampaigns(campaignsRes.data);
      if (slotsRes.ok) setSlots(slotsRes.data);
    } catch {
      toast("Не удалось загрузить данные продвижения", "error");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void load(); }, []);

  const totals = useMemo(() => {
    const activeCampaigns = campaigns.filter(campaign => campaign.status === "active").length;
    const budget = campaigns.reduce((sum, campaign) => sum + (campaign.budget ?? 0), 0);
    const spend = campaigns.reduce((sum, campaign) => sum + (campaign.spend ?? 0), 0);
    const impressions = slots.reduce((sum, slot) => sum + slot.impressions, 0);
    const clicks = slots.reduce((sum, slot) => sum + slot.clicks, 0);
    return { activeCampaigns, budget, spend, impressions, clicks };
  }, [campaigns, slots]);

  async function saveCampaign() {
    if (!campaignForm || !campaignForm.title.trim()) {
      toast("Укажите название кампании", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: campaignForm.title.trim(),
        channel: campaignForm.channel,
        status: campaignForm.status,
        budget: campaignForm.budget ? Number(campaignForm.budget) : null,
        spend: campaignForm.spend ? Number(campaignForm.spend) : null,
        startDate: campaignForm.startDate || undefined,
        endDate: campaignForm.endDate || undefined,
        targetUrl: campaignForm.targetUrl.trim() || undefined,
        utmSource: campaignForm.utmSource.trim() || undefined,
        utmMedium: campaignForm.utmMedium.trim() || undefined,
        utmCampaign: campaignForm.utmCampaign.trim() || undefined,
        notes: campaignForm.notes.trim() || undefined,
      };
      const json = await fetch(
        campaignForm.id ? `/api/promotion/campaigns/${campaignForm.id}` : "/api/promotion/campaigns",
        {
          method: campaignForm.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      ).then(r => r.json());

      if (!json.ok) {
        toast(json.error ?? "Не удалось сохранить кампанию", "error");
        return;
      }
      setCampaignForm(null);
      toast("Кампания сохранена");
      await load();
    } catch {
      toast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeCampaign(campaign: PromotionCampaign) {
    const ok = await confirm({
      title: "Удаление кампании",
      message: `Удалить «${campaign.title}»?`,
      confirmLabel: "Удалить",
      variant: "danger",
    });
    if (!ok) return;
    const json = await fetch(`/api/promotion/campaigns/${campaign.id}`, { method: "DELETE" }).then(r => r.json());
    if (json.ok) {
      toast("Кампания удалена");
      await load();
    } else {
      toast(json.error ?? "Ошибка удаления", "error");
    }
  }

  async function saveSlot() {
    if (!slotForm || !slotForm.key.trim() || !slotForm.title.trim()) {
      toast("Укажите ключ и название блока", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        key: slotForm.key.trim(),
        title: slotForm.title.trim(),
        placement: slotForm.placement,
        html: slotForm.html.trim() || undefined,
        imageUrl: slotForm.imageUrl.trim() || undefined,
        targetUrl: slotForm.targetUrl.trim() || undefined,
        height: Number(slotForm.height) || 250,
        isActive: slotForm.isActive,
        startsAt: slotForm.startsAt || undefined,
        endsAt: slotForm.endsAt || undefined,
      };
      const json = await fetch(
        slotForm.id ? `/api/promotion/slots/${slotForm.id}` : "/api/promotion/slots",
        {
          method: slotForm.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      ).then(r => r.json());

      if (!json.ok) {
        toast(json.error ?? "Не удалось сохранить рекламный блок", "error");
        return;
      }
      setSlotForm(null);
      toast("Рекламный блок сохранён");
      await load();
    } catch {
      toast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleSlot(slot: AdSlot) {
    const json = await fetch(`/api/promotion/slots/${slot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !slot.isActive }),
    }).then(r => r.json());
    if (json.ok) await load();
    else toast(json.error ?? "Ошибка", "error");
  }

  async function removeSlot(slot: AdSlot) {
    const ok = await confirm({
      title: "Удаление рекламного блока",
      message: `Удалить блок «${slot.title}»?`,
      confirmLabel: "Удалить",
      variant: "danger",
    });
    if (!ok) return;
    const json = await fetch(`/api/promotion/slots/${slot.id}`, { method: "DELETE" }).then(r => r.json());
    if (json.ok) {
      toast("Блок удалён");
      await load();
    } else {
      toast(json.error ?? "Ошибка удаления", "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Продвижение и реклама</h1>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-500">
            Планируйте закупку рекламы в Google, Яндексе и YouTube и управляйте рекламными блоками на сайте.
            Реальные запуски происходят в кабинетах рекламных систем — здесь учёт, UTM и монетизация.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setTab("campaigns"); setCampaignForm(emptyCampaign()); }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            + Кампания
          </button>
          <button
            type="button"
            onClick={() => { setTab("slots"); setSlotForm(emptySlot()); }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
          >
            + Рекламный блок
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Активных кампаний", value: String(totals.activeCampaigns) },
          { label: "Бюджет", value: money(totals.budget) },
          { label: "Израсходовано", value: money(totals.spend) },
          { label: "Показы блоков", value: totals.impressions.toLocaleString("ru-RU") },
          { label: "Клики блоков", value: totals.clicks.toLocaleString("ru-RU") },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
            <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-slate-900/40 p-1">
        {([
          ["campaigns", "Кампании"],
          ["slots", "Рекламные блоки"],
          ["utm", "UTM-конструктор"],
          ["help", "Инструкция"],
        ] as Array<[Tab, string]>).map(([value, text]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === value ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {tab === "campaigns" && (
        <div className="space-y-4">
          {campaignForm && (
            <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  {campaignForm.id ? "Редактирование кампании" : "Новая кампания"}
                </h2>
                <button type="button" onClick={() => setCampaignForm(null)} className={smallBtn}>Закрыть</button>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <label className="lg:col-span-2">
                  <span className={label}>Название *</span>
                  <input value={campaignForm.title} onChange={e => setCampaignForm({ ...campaignForm, title: e.target.value })} placeholder="Google Ads — аренда авто Минск" className={input} />
                </label>
                <label>
                  <span className={label}>Канал</span>
                  <select value={campaignForm.channel} onChange={e => setCampaignForm({ ...campaignForm, channel: e.target.value as PromotionChannel })} className={input}>
                    {PROMOTION_CHANNELS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label>
                  <span className={label}>Статус</span>
                  <select value={campaignForm.status} onChange={e => setCampaignForm({ ...campaignForm, status: e.target.value as CampaignStatus })} className={input}>
                    {CAMPAIGN_STATUSES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label>
                  <span className={label}>Бюджет, BYN</span>
                  <input value={campaignForm.budget} onChange={e => setCampaignForm({ ...campaignForm, budget: e.target.value })} inputMode="numeric" className={input} />
                </label>
                <label>
                  <span className={label}>Израсходовано, BYN</span>
                  <input value={campaignForm.spend} onChange={e => setCampaignForm({ ...campaignForm, spend: e.target.value })} inputMode="numeric" className={input} />
                </label>
                <label>
                  <span className={label}>Старт</span>
                  <input value={campaignForm.startDate} onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })} placeholder="2026-12-01" className={input} />
                </label>
                <label>
                  <span className={label}>Финиш</span>
                  <input value={campaignForm.endDate} onChange={e => setCampaignForm({ ...campaignForm, endDate: e.target.value })} placeholder="2026-12-31" className={input} />
                </label>
                <label className="lg:col-span-3">
                  <span className={label}>Ссылка на сайт (куда ведём)</span>
                  <input value={campaignForm.targetUrl} onChange={e => setCampaignForm({ ...campaignForm, targetUrl: e.target.value })} placeholder="https://avtoway.by/services/rent" className={input} />
                </label>
                <label>
                  <span className={label}>utm_source</span>
                  <input value={campaignForm.utmSource} onChange={e => setCampaignForm({ ...campaignForm, utmSource: e.target.value })} placeholder="google" className={input} />
                </label>
                <label>
                  <span className={label}>utm_medium</span>
                  <input value={campaignForm.utmMedium} onChange={e => setCampaignForm({ ...campaignForm, utmMedium: e.target.value })} placeholder="cpc" className={input} />
                </label>
                <label>
                  <span className={label}>utm_campaign</span>
                  <input value={campaignForm.utmCampaign} onChange={e => setCampaignForm({ ...campaignForm, utmCampaign: e.target.value })} placeholder="rent_minsk" className={input} />
                </label>
                <label className="lg:col-span-3">
                  <span className={label}>Заметки</span>
                  <textarea rows={3} value={campaignForm.notes} onChange={e => setCampaignForm({ ...campaignForm, notes: e.target.value })} className={input} />
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setCampaignForm(null)} className={smallBtn}>Отмена</button>
                <button type="button" onClick={() => void saveCampaign()} disabled={saving} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </section>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Загрузка...</p>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-500">
              Кампаний пока нет. Создайте первую, чтобы вести бюджет и UTM.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {campaigns.map(campaign => (
                <article key={campaign.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{campaign.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {PROMOTION_CHANNELS.find(item => item.value === campaign.channel)?.label}
                        {campaign.startDate ? ` · ${campaign.startDate}` : ""}
                        {campaign.endDate ? ` — ${campaign.endDate}` : ""}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLE[campaign.status]}`}>
                      {CAMPAIGN_STATUSES.find(item => item.value === campaign.status)?.label}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                    <span>Бюджет: <b className="text-slate-200">{money(campaign.budget)}</b></span>
                    <span>Расход: <b className="text-slate-200">{money(campaign.spend)}</b></span>
                  </div>
                  {campaign.targetUrl && (
                    <p className="mt-2 truncate text-[11px] text-slate-600">{campaign.targetUrl}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setCampaignForm(campaignToForm(campaign))} className={smallBtn}>Редактировать</button>
                    {campaign.targetUrl && (
                      <a href={campaign.targetUrl} target="_blank" rel="noopener noreferrer" className={smallBtn}>Открыть сайт</a>
                    )}
                    <button type="button" onClick={() => void removeCampaign(campaign)} className="rounded-lg border border-red-900/50 px-2.5 py-1.5 text-xs text-red-300 hover:border-red-600">
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "slots" && (
        <div className="space-y-4">
          {slotForm && (
            <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  {slotForm.id ? "Редактирование рекламного блока" : "Новый рекламный блок"}
                </h2>
                <button type="button" onClick={() => setSlotForm(null)} className={smallBtn}>Закрыть</button>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <label>
                  <span className={label}>Ключ слота *</span>
                  <input value={slotForm.key} onChange={e => setSlotForm({ ...slotForm, key: e.target.value })} placeholder="home_top" className={input} />
                </label>
                <label className="lg:col-span-2">
                  <span className={label}>Название *</span>
                  <input value={slotForm.title} onChange={e => setSlotForm({ ...slotForm, title: e.target.value })} placeholder="Баннер партнёра" className={input} />
                </label>
                <label>
                  <span className={label}>Размещение</span>
                  <select value={slotForm.placement} onChange={e => setSlotForm({ ...slotForm, placement: e.target.value })} className={input}>
                    {AD_PLACEMENTS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label>
                  <span className={label}>Высота iframe, px</span>
                  <input value={slotForm.height} onChange={e => setSlotForm({ ...slotForm, height: e.target.value })} inputMode="numeric" className={input} />
                </label>
                <label className="flex items-center gap-2 self-end rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">
                  <input type="checkbox" checked={slotForm.isActive} onChange={e => setSlotForm({ ...slotForm, isActive: e.target.checked })} />
                  Показывать на сайте
                </label>
                <label className="lg:col-span-3">
                  <span className={label}>HTML / скрипт рекламной сети</span>
                  <textarea rows={5} value={slotForm.html} onChange={e => setSlotForm({ ...slotForm, html: e.target.value })} placeholder="Вставьте код AdSense, Яндекс.Рекламной сети или HTML баннера" className={input} />
                </label>
                <label className="lg:col-span-2">
                  <span className={label}>Картинка-креатив (URL) — если нет HTML</span>
                  <input value={slotForm.imageUrl} onChange={e => setSlotForm({ ...slotForm, imageUrl: e.target.value })} placeholder="https://partner.example/banner.jpg" className={input} />
                </label>
                <label>
                  <span className={label}>Ссылка креатива</span>
                  <input value={slotForm.targetUrl} onChange={e => setSlotForm({ ...slotForm, targetUrl: e.target.value })} placeholder="https://partner.example" className={input} />
                </label>
                <label>
                  <span className={label}>Показывать с</span>
                  <input type="datetime-local" value={slotForm.startsAt} onChange={e => setSlotForm({ ...slotForm, startsAt: e.target.value })} className={input} />
                </label>
                <label>
                  <span className={label}>Показывать до</span>
                  <input type="datetime-local" value={slotForm.endsAt} onChange={e => setSlotForm({ ...slotForm, endsAt: e.target.value })} className={input} />
                </label>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500">
                Код рекламной сети вставляется в изолированный iframe — скрипты работают, но не ломают вёрстку сайта.
                HTML принимается только от доверенных администраторов.
              </p>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSlotForm(null)} className={smallBtn}>Отмена</button>
                <button type="button" onClick={() => void saveSlot()} disabled={saving} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {saving ? "Сохранение..." : "Сохранить блок"}
                </button>
              </div>
            </section>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Загрузка...</p>
          ) : slots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-500">
              Рекламных блоков пока нет. Создайте слот, чтобы показывать баннеры или сетку.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {slots.map(slot => {
                const ctr = slot.impressions > 0 ? ((slot.clicks / slot.impressions) * 100).toFixed(2) : "0.00";
                return (
                  <article key={slot.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{slot.title}</p>
                        <p className="mt-1 font-mono text-[11px] text-slate-500">{slot.key}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {AD_PLACEMENTS.find(item => item.value === slot.placement)?.label ?? slot.placement}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void toggleSlot(slot)}
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] transition ${
                          slot.isActive
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-slate-700 bg-slate-800 text-slate-400"
                        }`}
                      >
                        {slot.isActive ? "Включён" : "Выключен"}
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-950/50 p-2">
                        <p className="text-[10px] text-slate-600">Показы</p>
                        <p className="font-semibold text-slate-200">{slot.impressions.toLocaleString("ru-RU")}</p>
                      </div>
                      <div className="rounded-lg bg-slate-950/50 p-2">
                        <p className="text-[10px] text-slate-600">Клики</p>
                        <p className="font-semibold text-slate-200">{slot.clicks.toLocaleString("ru-RU")}</p>
                      </div>
                      <div className="rounded-lg bg-slate-950/50 p-2">
                        <p className="text-[10px] text-slate-600">CTR</p>
                        <p className="font-semibold text-slate-200">{ctr}%</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setSlotForm(slotToForm(slot))} className={smallBtn}>Редактировать</button>
                      <button type="button" onClick={() => void removeSlot(slot)} className="rounded-lg border border-red-900/50 px-2.5 py-1.5 text-xs text-red-300 hover:border-red-600">
                        Удалить
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "utm" && <UtmBuilder />}

      {tab === "help" && (
        <section className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="text-sm font-semibold text-white">Как это работает</h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-400">
              <li><b className="text-slate-200">1. Закупка рекламы.</b> Создайте кампанию, зафиксируйте бюджет, даты и UTM. Запуск и оплата — в кабинете Google Ads, Яндекс Директа или YouTube.</li>
              <li><b className="text-slate-200">2. Ссылки.</b> Соберите UTM-метку и вставьте её в объявление. Так вы увидите источник заявки в <Link href="/admin/requests" className="text-red-300 underline">заявках</Link> и <Link href="/admin/analytics" className="text-red-300 underline">аналитике</Link>.</li>
              <li><b className="text-slate-200">3. Монетизация.</b> Создайте рекламный блок, вставьте код AdSense / Яндекс.Рекламной сети или баннер партнёра и включите его. Показы и клики считаются автоматически.</li>
              <li><b className="text-slate-200">4. Контроль.</b> Раз в неделю обновляйте расход и смотрите CTR блоков. Что не окупается — выключайте.</li>
            </ol>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Руководство по админке", file: "admin-guide.docx", desc: "Все разделы, роли, заявки, услуги, блог, отчёты." },
              { title: "SEO-руководство", file: "seo-guide.docx", desc: "Как попасть в топ Google и Яндекса, пошаговый план." },
              { title: "Реклама и монетизация", file: "ads-guide.docx", desc: "Google Ads, Яндекс Директ, YouTube, AdSense и баннеры." },
            ].map(doc => (
              <a
                key={doc.file}
                href={`/api/docs/${doc.file}`}
                className="group rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-red-500/40"
              >
                <p className="text-sm font-semibold text-white group-hover:text-red-200">{doc.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{doc.desc}</p>
                <span className="mt-3 inline-flex text-xs font-medium text-red-300">Скачать .docx ↓</span>
              </a>
            ))}
          </div>

          <AdsTxtEditor />

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="text-sm font-semibold text-white">Кабинеты рекламных систем</h2>            <p className="mt-1 text-xs text-slate-500">Запуск, оплата и модерация происходят на стороне площадок.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Google Ads", href: "https://ads.google.com" },
                { label: "Яндекс Директ", href: "https://direct.yandex.ru" },
                { label: "YouTube Studio", href: "https://studio.youtube.com" },
                { label: "Google AdSense", href: "https://www.google.com/adsense" },
                { label: "Яндекс Реклама", href: "https://advertising.yandex.ru" },
                { label: "Google Business Profile", href: "https://business.google.com" },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-200/80">
            Важно: рекламные кабинеты (Google Ads, Яндекс Директ, YouTube, AdSense, Яндекс.Реклама) требуют
            регистрации, модерации и привязки платёжного средства. Сайт не может автоматически «купить» рекламу
            без вашего аккаунта — он помогает спланировать, разметить и посчитать результат.
          </div>
        </section>
      )}

      {dialog}
    </div>
  );
}

function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState("https://avtoway.by/");
  const [source, setSource] = useState("google");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("rent_minsk");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    try {
      const result = new URL(baseUrl);
      if (source) result.searchParams.set("utm_source", source);
      if (medium) result.searchParams.set("utm_medium", medium);
      if (campaign) result.searchParams.set("utm_campaign", campaign);
      if (content) result.searchParams.set("utm_content", content);
      if (term) result.searchParams.set("utm_term", term);
      return result.toString();
    } catch {
      return "Укажите корректный адрес сайта";
    }
  }, [baseUrl, source, medium, campaign, content, term]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/30 p-5">
      <div>
        <h2 className="text-sm font-semibold text-white">UTM-конструктор</h2>
        <p className="mt-1 text-xs text-slate-500">
          Одинаковые метки в кампании и в объявлении позволят связать заявки с источником.
        </p>
        <p className="mt-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
          Вставьте готовую ссылку под видео на YouTube или в рекламу — и в заявках будет видно, откуда пришёл клиент.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <label className="lg:col-span-3">
          <span className={label}>Адрес страницы</span>
          <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className={input} />
        </label>
        <label>
          <span className={label}>utm_source</span>
          <input value={source} onChange={e => setSource(e.target.value)} placeholder="google / yandex / youtube" className={input} />
        </label>
        <label>
          <span className={label}>utm_medium</span>
          <input value={medium} onChange={e => setMedium(e.target.value)} placeholder="cpc / banner / social" className={input} />
        </label>
        <label>
          <span className={label}>utm_campaign</span>
          <input value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="rent_minsk" className={input} />
        </label>
        <label>
          <span className={label}>utm_content</span>
          <input value={content} onChange={e => setContent(e.target.value)} placeholder="banner_1" className={input} />
        </label>
        <label>
          <span className={label}>utm_term</span>
          <input value={term} onChange={e => setTerm(e.target.value)} placeholder="аренда авто минск" className={input} />
        </label>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
        <p className="break-all font-mono text-xs text-emerald-300">{url}</p>
      </div>

      <button type="button" onClick={() => void copy()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
        {copied ? "Скопировано" : "Скопировать ссылку"}
      </button>
    </section>
  );
}
