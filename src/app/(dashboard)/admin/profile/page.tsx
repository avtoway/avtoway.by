"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileRedirect() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then(r => r.json());
        if (me.ok) router.replace(`/admin/users/${me.data.id}`);
        else router.replace("/admin/login");
      } catch { router.replace("/admin/login"); } finally { setDone(true); }
    })();
  }, [router]);

  if (done) return null;
  return <div className="flex items-center justify-center pt-20"><p className="text-slate-500">Загрузка...</p></div>;
}
