import Link from "next/link";

export default function HomeStickyCta({ phone }: { phone?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        {phone ? (
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-medium text-white"
          >
            Позвонить
          </a>
        ) : null}
        <Link
          href="/contacts"
          className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
        >
          Оставить заявку
        </Link>
      </div>
    </div>
  );
}
