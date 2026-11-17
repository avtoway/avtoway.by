"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Icon } from "./icons";
import { useDirtyForm } from "@/shared/lib/dirty-form-context";

interface MenuItem {
  label: string;
  icon: string;
  href?: string;
  perm?: string;
  section?: string;
  badge?: number;
  children?: MenuItem[];
}

function NavLink({
  href,
  children,
  className,
  isDirty,
  setConfirmLeave,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  isDirty: boolean;
  setConfirmLeave: (href: string | null) => void;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={e => {
        if (isDirty) {
          e.preventDefault();
          setConfirmLeave(href);
          return;
        }
        onNavigate?.();
      }}
      className={className}
    >
      {children}
    </a>
  );
}

function NavButton({
  onClick,
  children,
  isDirty,
  setConfirmLeave,
}: {
  onClick: () => void;
  children: React.ReactNode;
  isDirty: boolean;
  setConfirmLeave: (href: string | null) => void;
}) {
  return (
    <button
      onClick={() => {
        if (isDirty) {
          setConfirmLeave("#");
          return;
        }
        onClick();
      }}
    >
      {children}
    </button>
  );
}

function isActiveHref(pathname: string, href?: string): boolean {
  if (!href) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({
  items,
  pathname,
  user,
  onLogout,
  mobileOpen,
  onClose,
}: {
  items: MenuItem[];
  pathname: string;
  user: { id: string; name: string; login: string; photo?: string; role: string };
  onLogout: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const isChildActive = (href?: string) => href === pathname;
  const isParentActive = (children?: MenuItem[]) =>
    children?.some(c => c.href && (pathname === c.href || pathname.startsWith(c.href + "/")));

  const defaultExpanded = items
    .map((item, i) => (item.children && isParentActive(item.children) ? i : -1))
    .filter(i => i !== -1);

  const [expanded, setExpanded] = useState<number[]>(defaultExpanded);

  const toggle = (i: number) =>
    setExpanded(prev => (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]));

  const profileHref = `/admin/users/${user.id}?view=1`;
  const { isDirty, setConfirmLeave } = useDirtyForm();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:bg-slate-900/60 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
          <div>
            <Link href="/admin" onClick={onClose} className="text-lg font-bold tracking-tight text-white">
              АВТОWAY
            </Link>
            <p className="mt-0.5 text-[10px] text-slate-500">Панель управления</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть меню"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
          <NavLink href={profileHref} isDirty={isDirty} setConfirmLeave={setConfirmLeave} onNavigate={onClose}>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-sm font-bold text-slate-400 ring-1 ring-slate-700 transition hover:ring-red-500/50">
              {user.photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- аватар пользователя с произвольным размером
                <img src={user.photo} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </NavLink>
          <NavLink
            href={profileHref}
            className="min-w-0 flex-1"
            isDirty={isDirty}
            setConfirmLeave={setConfirmLeave}
            onNavigate={onClose}
          >
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
            const showSection = Boolean(item.section && item.section !== items[i - 1]?.section);

            if (item.children) {
              const active = isParentActive(item.children);
              // Активная группа всегда раскрыта, даже если пользователь её свернул.
              const open = expanded.includes(i) || Boolean(active);
              return (
                <Fragment key={item.label}>
                  {showSection && (
                    <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 first:mt-0">
                      {item.section}
                    </p>
                  )}
                  <div>
                    <button
                      onClick={() => toggle(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                        active ? "bg-red-600/10 text-red-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
                              onNavigate={onClose}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                                childActive
                                  ? "bg-red-600/10 text-red-400"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              }`}
                            >
                              <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
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
                </Fragment>
              );
            }

            const active = isActiveHref(pathname, item.href);
            return (
              <Fragment key={item.href}>
                {showSection && (
                  <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 first:mt-0">
                    {item.section}
                  </p>
                )}
                <NavLink
                  href={item.href ?? "#"}
                  isDirty={isDirty}
                  setConfirmLeave={setConfirmLeave}
                  onNavigate={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active ? "bg-red-600/10 text-red-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
              </Fragment>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
