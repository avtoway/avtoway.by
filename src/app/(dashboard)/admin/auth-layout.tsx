"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/shared/ui/admin/sidebar";
import Breadcrumbs from "@/shared/ui/admin/breadcrumbs";
import { ErrorBoundary } from "@/shared/ui/error-boundary";
import { DirtyFormProvider, useDirtyForm } from "@/shared/lib/dirty-form-context";
import { ToastProvider } from "@/shared/lib/toast-context";

interface AuthUser {
  id: string;
  login: string;
  name: string;
  photo?: string;
  role: string;
  permissions: string[];
}

interface MenuItem {
  label: string;
  icon: string;
  href?: string;
  perm?: string;
  section?: string;
  badge?: number;
  children?: MenuItem[];
}

const TITLE_OVERRIDE: Record<string, string> = {
  "/admin/services": "Услуги",
  "/admin/profile": "Мой профиль",
  "/admin/users": "Сотрудники",
  "/admin/roles": "Роли",
  "/admin/partners": "Партнёры",
  "/admin/vacancies": "Вакансии",
  "/admin/audit-logs": "Аудит",
  "/admin/rent": "Аренда",
  "/admin/sell": "Продажа авто",
  "/admin/inspection": "Автоподбор",
  "/admin/blog": "Блог",
  "/admin/reports": "Отчёты осмотра",
  "/admin/promotion": "Продвижение и реклама",
  "/admin/help": "Справка",
};

function resolvePageTitle(pathname: string, items: MenuItem[]): string {
  if (TITLE_OVERRIDE[pathname]) return TITLE_OVERRIDE[pathname];
  for (const item of items) {
    if (item.href === pathname) return item.label;
    if (item.children) {
      for (const child of item.children) {
        if (child.href === pathname) return child.label;
      }
    }
  }
  return "Панель управления";
}

function DirtyFormGuard({ router }: { router: ReturnType<typeof useRouter> }) {
  const { confirmLeave, setConfirmLeave, setDirty, setPendingHref } = useDirtyForm();

  if (!confirmLeave) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">Несохранённые изменения</h3>
        <p className="mt-2 text-sm text-slate-400">
          У вас есть несохранённые изменения. Вы действительно хотите уйти без сохранения?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => { setConfirmLeave(null); setPendingHref(null); }}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Остаться
          </button>
          <button
            onClick={() => {
              const href = confirmLeave;
              setConfirmLeave(null);
              setPendingHref(null);
              setDirty(false);
              router.push(href);
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Уйти без сохранения
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    let cancelled = false;
    (async () => {
      try {
        // Параллельно: пользователь + меню, чтобы не делать два последовательных запроса.
        const [me, menuRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/admin/menu", { cache: "no-store" }),
        ]);
        const meJson = await me.json();
        if (!meJson.ok) { if (!cancelled) router.replace("/admin/login"); return; }
        const menuJson = await menuRes.json();
        if (cancelled) return;
        setUser(meJson.data);
        if (menuJson.ok) setMenu(menuJson.menu);
      } catch { if (!cancelled) router.replace("/admin/login"); } finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [pathname, router]);

  // Clear stale user data on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  if (!loaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950">
        <p className="text-slate-500">Загрузка...</p>
      </div>
    );
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Даже если сеть недоступна — уводим на страницу входа.
    }
    setUser(null);
    router.replace("/admin/login");
    router.refresh();
  }

  const pageTitle = resolvePageTitle(pathname, menu);

  return (
    <DirtyFormProvider>
      <ToastProvider>
        <div className="flex min-h-dvh bg-slate-950 text-slate-100">
          {user && (
            <Sidebar
              items={menu}
              pathname={pathname}
              user={{ id: user.id, name: user.name, login: user.login, photo: user.photo, role: user.role }}
              onLogout={handleLogout}
              mobileOpen={mobileNavOpen}
              onClose={() => setMobileNavOpen(false)}
            />
          )}

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-900/40 px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Открыть меню"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:border-slate-600 hover:text-white lg:hidden"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <Breadcrumbs pathname={pathname} items={menu} />
                  <h1 className="mt-1 truncate text-lg font-bold text-white lg:text-xl">{pageTitle}</h1>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8"><ErrorBoundary>{children}</ErrorBoundary></div>
          </main>
        </div>
        <DirtyFormGuard router={router} />
      </ToastProvider>
    </DirtyFormProvider>
  );
}
