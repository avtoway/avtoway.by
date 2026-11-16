import "@/di/composition-root";
import { container } from "@/di/container";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import ScrollProgress from "@/shared/ui/scroll-progress";
import SiteLogo from "@/shared/ui/site-logo";
import MainNav from "@/shared/ui/main-nav";
import Link from "next/link";

export default async function SiteHeader() {
  let services: { slug: string; title: string; href: string }[] = [];
  let phone: string | undefined;

  try {
    const serviceRepo = container.get<import("@/entities/service/service.repository").ServiceRepository>("ServiceRepository");
    services = (await serviceRepo.getActive()).map(({ slug, title, href }) => ({
      slug,
      title,
      href,
    }));
  } catch {
    // Навигация не должна ронять весь сайт, если БД временно недоступна.
  }

  try {
    const contactRepo = container.get<ContactInfoRepository>("ContactInfoRepository");
    phone = (await contactRepo.get())?.phone ?? undefined;
  } catch {
    // Телефон в шапке — необязательный элемент.
  }

  return (
    <>
      <ScrollProgress />
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <SiteLogo />
          <div className="flex items-center gap-3">
            <MainNav key={JSON.stringify(services)} services={services} />
            <div className="hidden items-center gap-3 lg:flex">
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="whitespace-nowrap text-sm font-medium text-zinc-300 transition hover:text-white"
                >
                  {phone}
                </a>
              )}
              <Link
                href="/contacts"
                className="whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
              >
                Оставить заявку
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
