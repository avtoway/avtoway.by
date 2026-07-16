"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./icons";
import { useDirtyForm } from "@/shared/lib/dirty-form-context";

interface MenuItem {
  label: string;
  icon: string;
  href?: string;
  perm?: string;
  badge?: number;
  children?: MenuItem[];
}

function NavLink({ href, children, className, isDirty, setConfirmLeave }: {
  href: string;
  children: React.ReactNode;
  className?: string;
  isDirty: boolean;
  setConfirmLeave: (href: string | null) => void;
}) {
  return (
    <a
      href={href}
      onClick={e => {
        if (isDirty) { e.preventDefault(); setConfirmLeave(href); }
      }}
      className={className}
    >
      {children}
    </a>
  );
}

function NavButton({ onClick, children, className, isDirty, setConfirmLeave }: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  isDirty: boolean;
  setConfirmLeave: (href: string | null) => void;
}) {
  return (
    <button
      onClick={() => {
        if (isDirty) { setConfirmLeave("#"); return; }
        onClick();
      }}
      className={className}
    >
      {children}
    </button>
  );
}

export default function Sidebar({
  items,
  pathname,
  user,
  onLogout,
}: {
  items: MenuItem[];
  pathname: string;
  user: { id: string; name: string; login: string; photo?: string; role: string };
  onLogout: () => void;
}) {
  const isChildActive = (href?: string) => href && pathname === href;
  const isParentActive = (children?: MenuItem[]) =>
    children?.some(c => c.href && (pathname === c.href || pathname.startsWith(c.href + "/")));

  const defaultExpanded = items
    .map((item, i) => (item.children && isParentActive(item.children) ? i : -1))
    .filter(i => i !== -1);

  const [expanded, setExpanded] = useState<number[]>(defaultExpanded);

  const toggle = (i: number) =>
    setExpanded(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i],
    );

  const profileHref = `/admin/users/${user.id}?view=1`;
  const { isDirty, setConfirmLeave } = useDirtyForm();

  return (
    <aside className="flex w-60 flex-col border-r border-slate-800 bg-slate-900/60">
      {/* Logo */}
      <div className="border-b border-slate-800 px-5 py-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight text-white">
          АВТОWAY
        </Link>
        <p className="mt-0.5 text-[10px] text-slate-500">Панель управления</p>
      </div>

      {/* User info + Logout */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        <NavLink href={profileHref} isDirty={isDirty} setConfirmLeave={setConfirmLeave}>
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-sm font-bold text-slate-400 ring-1 ring-slate-700 transition hover:ring-red-500/50">
            {user.photo ? <img src={user.photo} alt="" className="h-full w-full rounded-full object-cover" /> : user.name.charAt(0).toUpperCase()}
          </div>
        </NavLink>
        <NavLink href={profileHref} className="min-w-0 flex-1" isDirty={isDirty} setConfirmLeave={setConfirmLeave}>
          <p className="truncate text-sm font-medium text-slate-200 transition hover:text-red-400">{user.name}</p>
          <p className="truncate text-[10px] text-slate-500">@{user.login}</p>
          <p className="truncate text-[10px] text-slate-500">{user.role}</p>
        </NavLink>
        <NavButton onClick={onLogout} isDirty={isDirty} setConfirmLeave={setConfirmLeave}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-red-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
        </NavButton>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {items.map((item, i) => {
          if (item.children) {
            const active = isParentActive(item.children);
            const open = expanded.includes(i);
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-red-600/10 text-red-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <Icon
                    name={open ? "chevron-down" : "chevron-right"}
                    className="h-4 w-4 text-slate-500"
                  />
                </button>
                {open && (
                  <div className="ml-2 mt-0.5 space-y-0.5 border-l border-slate-800 pl-3">
                    {item.children.map(child => {
                      const childActive = isChildActive(child.href);
                      return (
                        <NavLink
                          key={child.href}
                          href={child.href ?? "#"}
                          isDirty={isDirty}
                          setConfirmLeave={setConfirmLeave}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                            childActive
                              ? "bg-red-600/10 text-red-400"
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <span className="h-1 w-1 rounded-full bg-current shrink-0" />
                          <span className="flex-1">{child.label}</span>
                          {child.badge !== undefined && child.badge > 0 && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600/20 px-1.5 text-[10px] font-medium text-red-400">
                              {child.badge > 99 ? "99+" : child.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = isChildActive(item.href);
          return (
            <NavLink
              key={item.href}
              href={item.href ?? "#"}
              isDirty={isDirty}
              setConfirmLeave={setConfirmLeave}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-red-600/10 text-red-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600/20 px-1.5 text-[10px] font-medium text-red-400">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
