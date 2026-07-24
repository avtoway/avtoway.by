"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/shared/ui/admin/sidebar";
import Breadcrumbs from "@/shared/ui/admin/breadcrumbs";
import { ErrorBoundary } from "@/shared/ui/error-boundary";
import { DirtyFormProvider, useDirtyForm } from "@/shared/lib/dirty-form-context";
import { ToastProvider } from "@/shared/lib/toat-context";

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
  badge?: number;
  children?: MenuItem[];
}

const TITLE_OVERRIDE: Record<string, string> = {
  "/admin/services": "Услуги",
  "/admin/profile": "Мой профиль",
  "/admin/users": "Сотрудники",
  "/admin/roles": "Роли",
  "/admin/partners": "Партнёры",
  "/admin/audit-logs": "Аудит",
  "/admin/rent": "Аренда",
  "/admin/sell": "Продажа авто",
  "/admin/inspection": "Автоподбор",
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

  useEffect(() => {
    if (pathname === "/admin/login") return;
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch("/api/auth/me");
        const meJson = await me.json();
        if (!meJson.ok) { if (!cancelled) router.push("/admin/login"); return; }
        if (!cancelled) setUser(meJson.data);
        const menuRes = await fetch("/api/admin/menu");
        const menuJson = await menuRes.json();
        if (menuJson.ok && !cancelled) setMenu(menuJson.menu);
      } catch { if (!cancelled) router.push("/admin/login"); } finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [pathname, router]);

  // Clear stale user data on login page
  if (pathname === "/admin/login") {
    if (user) setUser(null);
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
    document.cookie = "admin_token=; path=/; max-age=0";
    setUser(null);
    router.push("/admin/login");
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
            />
          )}

          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-900/40 px-8 py-4">
              <Breadcrumbs pathname={pathname} items={menu} />
              <h1 className="mt-1 text-xl font-bold text-white">{pageTitle}</h1>
            </div>
            <div className="flex-1 overflow-auto p-8"><ErrorBoundary>{children}</ErrorBoundary></div>
          </main>
        </div>
        <DirtyFormGuard router={router} />
      </ToastProvider>
    </DirtyFormProvider>
  );
}
