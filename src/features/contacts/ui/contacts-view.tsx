"use client";

import Reveal from "@/shared/ui/reveal";

interface ContactData {
  phone: string | null;
  email: string | null;
  telegram: string | null;
  viber: string | null;
  whatsapp: string | null;
  instagram: string | null;
  youtube: string | null;
  rutube: string | null;
  vk: string | null;
  address: string | null;
  workingHours: string | null;
}

export default function ContactsView({ contact }: { contact: ContactData | null }) {
  const hasAny = contact && (
    contact.phone || contact.email || contact.address || contact.workingHours ||
    contact.telegram || contact.viber || contact.whatsapp || contact.instagram
  );

  return (
    <div className="relative min-h-dvh overflow-hidden bg-zinc-950 pb-24 pt-24">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/3 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-px w-[800px] -translate-x-1/2 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Hero */}
        <div className="mb-16 text-center">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
              Всегда на связи
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Давайте <span className="text-red-500">обсудим</span> вашу задачу
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-500">
              Аренда авто, подбор, продажа, осмотр или техническая консультация —
              выберите удобный способ связи. Ответим в течение часа, без выходных.
            </p>
          </Reveal>
        </div>

        {!hasAny ? (
          <p className="text-center text-zinc-600">Контактная информация скоро появится.</p>
        ) : (
          <>
            {/* Main contact grid */}
            <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contact.phone && (
                <Reveal delay={300}>
                  <ContactCard
                    title="Позвоните"
                    value={contact.phone}
                    href={`tel:${contact.phone}`}
                    subtitle="Быстрый ответ"
                    gradient="from-red-600/20 to-orange-600/10"
                    border="border-red-500/20 hover:border-red-500/50"
                    icon={<PhoneIcon />}
                  />
                </Reveal>
              )}
              {contact.email && (
                <Reveal delay={400}>
                  <ContactCard
                    title="Напишите"
                    value={contact.email}
                    href={`mailto:${contact.email}`}
                    subtitle="Для документов и предложений"
                    gradient="from-blue-600/20 to-cyan-600/10"
                    border="border-blue-500/20 hover:border-blue-500/50"
                    icon={<MailIcon />}
                  />
                </Reveal>
              )}
              {contact.address && (
                <Reveal delay={500}>
                  <ContactCard
                    title="Приезжайте"
                    value={contact.address}
                    subtitle="Личная встреча"
                    gradient="from-green-600/20 to-emerald-600/10"
                    border="border-green-500/20 hover:border-green-500/50"
                    icon={<PinIcon />}
                  />
                </Reveal>
              )}
              {contact.workingHours && (
                <Reveal delay={600}>
                  <ContactCard
                    title="Режим работы"
                    value={contact.workingHours}
                    subtitle="Без выходных"
                    gradient="from-violet-600/20 to-purple-600/10"
                    border="border-violet-500/20 hover:border-violet-500/50"
                    icon={<ClockIcon />}
                  />
                </Reveal>
              )}
            </div>

            {/* Messenger section */}
            {(contact.telegram || contact.viber || contact.whatsapp || contact.instagram) && (
              <div className="mb-20">
                <Reveal delay={200}>
                  <div className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Мессенджеры
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">Пишите, там где вам удобно</h2>
                    <p className="mt-2 text-sm text-zinc-500">
                      Отвечаем в Telegram, Viber и WhatsApp в течение 5 минут
                    </p>
                  </div>
                </Reveal>

                <div className="flex flex-wrap justify-center gap-4">
                  {contact.telegram && (
                    <Reveal delay={350}>
                      <a
                        href={contact.telegram.startsWith("http") ? contact.telegram : `https://t.me/${contact.telegram.replace("@", "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/40 hover:bg-sky-950/20 hover:shadow-lg hover:shadow-sky-500/5"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 transition-colors group-hover:bg-sky-500/20">
                          <TelegramIcon />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">Telegram</p>
                          <p className="text-xs text-zinc-500">Быстрее всего</p>
                        </div>
                      </a>
                    </Reveal>
                  )}
                  {contact.whatsapp && (
                    <Reveal delay={450}>
                      <a
                        href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/5"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                          <WhatsAppIcon />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">WhatsApp</p>
                          <p className="text-xs text-zinc-500">Всегда онлайн</p>
                        </div>
                      </a>
                    </Reveal>
                  )}
                  {contact.viber && (
                    <Reveal delay={550}>
                      <a
                        href={`viber://chat?number=${encodeURIComponent(contact.viber.replace(/\D/g, ""))}`}
                        target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-violet-950/20 hover:shadow-lg hover:shadow-violet-500/5"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                          <ViberIcon />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">Viber</p>
                          <p className="text-xs text-zinc-500">Для звонков</p>
                        </div>
                      </a>
                    </Reveal>
                  )}
                  {contact.instagram && (
                    <Reveal delay={650}>
                      <a
                        href={contact.instagram} target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/40 hover:bg-pink-950/20 hover:shadow-lg hover:shadow-pink-500/5"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 transition-colors group-hover:bg-pink-500/20">
                          <InstagramIcon />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">Instagram</p>
                          <p className="text-xs text-zinc-500">Следите за нами</p>
                        </div>
                      </a>
                    </Reveal>
                  )}
                </div>
              </div>
            )}

            {/* Social networks section */}
            {(contact.youtube || contact.rutube || contact.vk) && (
              <div className="mb-20">
                <Reveal delay={300}>
                  <div className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Социальные сети
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">Смотрите наши видео</h2>
                  </div>
                </Reveal>

                <div className="flex flex-wrap justify-center gap-4">
                  {contact.youtube && (
                    <Reveal delay={400}>
                      <SocialPill href={contact.youtube} label="YouTube" color="text-red-400" bg="bg-red-500/10" border="border-red-500/20 hover:border-red-500/40" />
                    </Reveal>
                  )}
                  {contact.rutube && (
                    <Reveal delay={500}>
                      <SocialPill href={contact.rutube} label="Rutube" color="text-violet-400" bg="bg-violet-500/10" border="border-violet-500/20 hover:border-violet-500/40" />
                    </Reveal>
                  )}
                  {contact.vk && (
                    <Reveal delay={600}>
                      <SocialPill href={contact.vk} label="VK Видео" color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20 hover:border-blue-500/40" />
                    </Reveal>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <Reveal delay={700}>
          <div className="mx-auto max-w-xl rounded-3xl border border-red-500/10 bg-gradient-to-br from-red-600/5 via-zinc-900/80 to-zinc-900/30 p-8 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-white">
              Нет времени звонить? Оставьте заявку на сайте —
              мы перезвоним в удобное для вас время.
            </p>
            <a
              href="/services"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20"
            >
              Смотреть услуги
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function ContactCard({ title, value, href, subtitle, gradient, border, icon }: {
  title: string;
  value: string;
  href?: string;
  subtitle: string;
  gradient: string;
  border: string;
  icon: React.ReactNode;
}) {
  const content = (
    <div className={`flex h-full flex-col rounded-2xl border bg-zinc-900/50 bg-gradient-to-br ${gradient} ${border} p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="mt-1.5 text-base font-semibold text-white leading-tight">{value}</p>
      <p className="mt-2 text-xs text-zinc-600">{subtitle}</p>
    </div>
  );

  if (href) {
    return <a href={href} className="block h-full">{content}</a>;
  }
  return content;
}

function SocialPill({ href, label, color, bg, border }: {
  href: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 rounded-full border ${border} ${bg} px-5 py-2.5 text-sm font-medium ${color} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      {label}
    </a>
  );
}

/* Icons */
function PhoneIcon() {
  return (
    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.283.334-.597.334l.213-3.004 5.475-4.947c.24-.213-.054-.334-.373-.121l-6.77 4.262-2.914-.914c-.63-.196-.644-.63.133-.93l11.434-4.405c.525-.196 1.003.128.83.938z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.243 4.176.69 5.901.622 7.06c-.257 3.498-.087 6.216.09 7.406.087.591.212.837.532 1.058.397.274.853.169 1.112-.085.294-.289.402-.61.528-1.084.084-.446.118-1.896.144-2.765.024-.854.086-1.61.262-2.208.195-.662.585-1.304 1.104-1.707.727-.563 2.218-.88 3.79-.88h.044c2.576.025 4.715.786 5.808 2.07 1.062 1.248 1.451 2.876 1.434 4.686-.016 1.853-1.153 3.232-3.049 4.1-.72.33-1.544.503-2.388.51-1.637.013-2.892-.584-3.646-1.727-.87-1.32-.942-2.947-.742-4.358.072-.505.227-.965.379-1.307.15-.338.304-.579.386-.651.143-.125.275-.175.42-.15.313.043.558.358.646.828.108.575.1 1.951-.65 2.534-.194.152-.34.365-.363.549-.05.383.36.97.633 1.114.567.299 1.697.367 2.868-.272 1.182-.645 1.879-1.818 1.878-3.16.002-1.287-.378-2.303-1.13-3.02-.753-.718-1.825-1.09-3.18-1.103h-.046c-1.533.013-2.868.35-3.65.919-.678.493-1.12 1.153-1.307 1.903-.157.628-.196 1.313-.183 2.066.02 1.173.138 2.006.354 2.545.146.366.292.587.44.725.137.125.32.172.527.133.227-.043.395-.2.492-.459.133-.354.142-.76.158-1.135.01-.234.036-.467.082-.668.113-.487.35-.919.72-1.151.358-.225.838-.325 1.378-.289.569.039.999.312 1.24.765.24.453.283 1.011.194 1.619-.09.626-.338 1.248-.738 1.76-.425.543-.953.95-1.567 1.196-.615.246-1.266.321-1.93.249-.667-.073-1.29-.303-1.854-.649a7.91 7.91 0 01-1.482-1.359c-.502-.608-.882-1.283-1.123-2.004-.242-.72-.352-1.49-.317-2.27.034-.78.2-1.56.49-2.279.29-.72.7-1.37 1.215-1.923.516-.553 1.13-.993 1.82-1.307.69-.314 1.45-.49 2.225-.52 1.725-.066 6.435-.334 8.618 2.34 1.34 1.641 1.698 3.757 1.286 6.088-.173.983-.508 1.935-.986 2.686-.477.75-1.084 1.282-1.786 1.507-.703.225-1.456.134-2.07-.221-.613-.354-1.034-.948-1.212-1.675-.137-.557.045-1.131.49-1.426.253-.167.556-.245.859-.219.298.025.564.127.773.29.209.162.348.366.42.571.11.316.322.375.548.325.226-.05.399-.224.51-.467.11-.242.15-.554.12-.888-.037-.423-.181-.854-.46-1.135-.297-.3-.736-.494-1.29-.375-.503.109-.93.429-1.202.908-.27.475-.421 1.099-.414 1.72.007.626.173 1.225.487 1.738.314.513.758.928 1.277 1.2.519.27 1.099.395 1.687.368.588-.026 1.177-.21 1.693-.564.516-.355.953-.88 1.259-1.54.306-.66.483-1.441.504-2.241.02-.8-.121-1.618-.41-2.36z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
