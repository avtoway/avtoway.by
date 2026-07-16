"use client";

import type { Partner } from "../types";

export default function PartnerCard({
  partner,
  onEdit,
  onDelete,
  onToggleActive,
  dragHandlers,
}: {
  partner: Partner;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  dragHandlers: {
    onDragStart: () => void;
    onDragEnter: () => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent) => void;
  };
}) {
  return (
    <div
      draggable
      onDragStart={dragHandlers.onDragStart}
      onDragEnter={dragHandlers.onDragEnter}
      onDragEnd={dragHandlers.onDragEnd}
      onDragOver={dragHandlers.onDragOver}
      className={`group relative cursor-grab active:cursor-grabbing rounded-xl border bg-slate-900/40 p-5 transition-all hover:border-slate-700 hover:bg-slate-900/70 ${!partner.isActive ? "border-slate-800/30 opacity-50" : "border-slate-800"}`}
    >
      <div className="absolute right-3 top-3 text-slate-600 group-hover:text-slate-400">⠿</div>

      <div className="mb-3 flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl ${partner.photo ? "" : "bg-slate-800"}`}>
          {partner.photo ? (
            <img src={partner.photo} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <span className="text-lg font-bold text-slate-500">{partner.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">{partner.name}</h3>
          {partner.description && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{partner.description}</p>}
        </div>
      </div>

      {(partner.phone || partner.email) && (
        <div className="mb-3 space-y-1 border-t border-slate-800/50 pt-3 text-xs text-slate-400">
          {partner.phone && <p>📞 {partner.phone}</p>}
          {partner.email && <p className="truncate">✉ {partner.email}</p>}
          {partner.website && <p className="truncate">🌐 {partner.website}</p>}
        </div>
      )}

      {(partner.instagram || partner.telegram || partner.vk || partner.youtube) && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {partner.instagram && <a href={partner.instagram} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="rounded-md bg-pink-900/20 px-2 py-1 text-[10px] text-pink-400 hover:bg-pink-900/40">IG</a>}
          {partner.telegram && <a href={partner.telegram} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="rounded-md bg-blue-900/20 px-2 py-1 text-[10px] text-blue-400 hover:bg-blue-900/40">TG</a>}
          {partner.vk && <a href={partner.vk} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="rounded-md bg-blue-900/20 px-2 py-1 text-[10px] text-blue-300 hover:bg-blue-900/40">VK</a>}
          {partner.youtube && <a href={partner.youtube} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="rounded-md bg-red-900/20 px-2 py-1 text-[10px] text-red-400 hover:bg-red-900/40">YT</a>}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-slate-800/50 pt-3">
        <button onClick={onToggleActive}
          className={`rounded px-2 py-1 text-[10px] font-medium transition ${partner.isActive ? "bg-green-900/40 text-green-300 hover:bg-green-900/60" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>
          {partner.isActive ? "Активен" : "Скрыт"}
        </button>
        <div className="ml-auto flex gap-1">
          <button onClick={onEdit} className="rounded px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-800 hover:text-white">Ред</button>
          <button onClick={onDelete} className="rounded px-2 py-1 text-[10px] text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
        </div>
      </div>
    </div>
  );
}
