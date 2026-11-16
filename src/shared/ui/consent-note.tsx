import Link from "next/link";

/** Единый текст согласия под кнопками отправки форм. */
export default function ConsentNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[10px] leading-relaxed text-zinc-600 ${className}`}>
      Нажимая кнопку, вы соглашаетесь с{" "}
      <Link href="/privacy" className="underline transition hover:text-zinc-400">
        политикой обработки персональных данных
      </Link>
      .
    </p>
  );
}
