import { IconTelegram } from "@/shared/ui/icons";

/**
 * Быстрые кнопки связи по конкретному авто.
 * Telegram открывает окно с уже готовым текстом и ссылкой на карточку.
 */
export default function CarContactButtons({
  title,
  pageUrl,
  telegram,
  viber,
}: {
  title: string;
  pageUrl: string;
  telegram?: string | null;
  viber?: string | null;
}) {
  const message = `Здравствуйте! Интересует ${title} (${pageUrl})`;
  const telegramLink = telegram
    ? `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(message)}`
    : null;
  const viberLink = viber ? `viber://forward?text=${encodeURIComponent(`${message} ${pageUrl}`)}` : null;

  if (!telegramLink && !viberLink) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {telegramLink && (
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 text-xs font-medium text-sky-300 transition hover:border-sky-400/60 hover:text-sky-200"
        >
          <IconTelegram className="size-3.5" />
          Telegram
        </a>
      )}
      {viberLink && (
        <a
          href={viberLink}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 text-xs font-medium text-violet-300 transition hover:border-violet-400/60 hover:text-violet-200"
        >
          Viber
        </a>
      )}
    </div>
  );
}
