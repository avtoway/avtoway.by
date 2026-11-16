"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { trackEvent } from "@/shared/lib/analytics";

const YANDEX_SNIPPET = (id: string, webvisor: boolean) => `
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
window.__avtowayYmId = ${JSON.stringify(id)};
ym(${Number(id)}, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: ${webvisor ? "true" : "false"} });
`;

function clickEventName(href: string): string | null {
  if (href.startsWith("tel:")) return "phone_click";
  if (href.includes("wa.me")) return "whatsapp_click";
  if (href.includes("viber://")) return "viber_click";
  if (href.includes("t.me")) return "telegram_click";
  return null;
}

export default function AnalyticsScripts({
  gaId,
  ymId,
  ymWebvisor,
}: {
  gaId?: string;
  ymId?: string;
  ymWebvisor?: boolean;
}) {
  const safeYmId = (ymId ?? "").replace(/\D/g, "");

  // Счётчики грузим только после согласия на cookie (Закон № 99-З).
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const read = () => {
      try {
        setAllowed(localStorage.getItem("avtoway:cookie-consent") === "accepted");
      } catch {
        setAllowed(false);
      }
    };
    read();
    window.addEventListener("avtoway:cookie-consent", read);
    return () => window.removeEventListener("avtoway:cookie-consent", read);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (!link) return;
      const name = clickEventName(link.getAttribute("href") ?? "");
      if (name) trackEvent(name, { href: link.getAttribute("href") ?? "" });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!allowed) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(gaId)}, { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {safeYmId && (
        <Script id="yandex-metrika-init" strategy="afterInteractive">
          {YANDEX_SNIPPET(safeYmId, ymWebvisor ?? true)}
        </Script>
      )}
    </>
  );
}
