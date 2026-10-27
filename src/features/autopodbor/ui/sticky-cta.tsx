"use client";

import { useEffect, useState } from "react";
import { telegramUrl } from "@/shared/lib/social";
import { phoneHref } from "../lib/defaults";
import { trackEvent } from "../lib/analytics";
import AutoIcon from "./icon";

export default function StickyCta({ phone, telegram }: { phone?: string; telegram?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById("lead");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry?.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const tel = phoneHref(phone);
  const tg = telegramUrl(telegram);
  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-3">
        {tel ? (
          <a
            href={tel}
            onClick={() => trackEvent("sticky_cta_click", { action: "phone" })}
            className="flex flex-col items-center gap-1 py-3 text-[11px] text-zinc-400"
          >
            <AutoIcon name="phone" className="h-5 w-5 text-primary" />
            Позвонить
          </a>
        ) : (
          <span />
        )}
        {tg ? (
          <a
            href={tg}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("sticky_cta_click", { action: "telegram" })}
            className="flex flex-col items-center gap-1 border-x border-zinc-800 py-3 text-[11px] text-zinc-400"
          >
            <AutoIcon name="telegram" className="h-5 w-5 text-sky-400" />
            Telegram
          </a>
        ) : (
          <span />
        )}
        <a
          href="#lead"
          onClick={() => trackEvent("sticky_cta_click", { action: "lead" })}
          className="flex flex-col items-center gap-1 py-3 text-[11px] text-zinc-400"
        >
          <AutoIcon name="document" className="h-5 w-5 text-green-400" />
          Заявка
        </a>
      </div>
    </div>
  );
}
