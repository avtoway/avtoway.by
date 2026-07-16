"use client";

export default function AuditFilters({
  search, onSearchChange,
  actionFilter, onActionFilterChange,
  entityFilter, onEntityFilterChange,
  actions, entities,
  filteredCount, totalCount,
}: {
  search: string; onSearchChange: (v: string) => void;
  actionFilter: string; onActionFilterChange: (v: string) => void;
  entityFilter: string; onEntityFilterChange: (v: string) => void;
  actions: string[]; entities: string[];
  filteredCount: number; totalCount: number;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <input value={search} onChange={e => onSearchChange(e.target.value)}
        placeholder="Поиск по пользователю, сущности..."
        className="w-72 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
      <select value={actionFilter} onChange={e => onActionFilterChange(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
        <option value="">Все действия</option>
        {actions.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <select value={entityFilter} onChange={e => onEntityFilterChange(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
        <option value="">Все сущности</option>
        {entities.map(e => <option key={e} value={e}>{e}</option>)}
      </select>
      {filteredCount < totalCount && (
        <span className="self-center text-xs text-slate-500">Показано {filteredCount} из {totalCount}</span>
      )}
    </div>
  );
}
