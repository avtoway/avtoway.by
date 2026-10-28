import "@/di/composition-root";
import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import ScrollProgress from "@/shared/ui/scroll-progress";
import SiteLogo from "@/shared/ui/site-logo";
import MainNav from "@/shared/ui/main-nav";

export default async function SiteHeader() {
  let services: { slug: string; title: string; href: string }[] = [];

  try {
    const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
    services = (await serviceRepo.getActive()).map(({ slug, title, href }) => ({
      slug,
      title,
      href,
    }));
  } catch {
    // Навигация не должна ронять весь сайт, если БД временно недоступна.
  }

  return (
    <>
      <ScrollProgress />
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <SiteLogo />
          <MainNav key={JSON.stringify(services)} services={services} />
        </div>
      </header>
    </>
  );
}
