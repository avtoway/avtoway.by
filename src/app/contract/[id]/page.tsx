import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import "@/di/composition-root";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import PrintReportButton from "@/features/autopodbor/ui/print-report-button";

export const metadata: Metadata = {
  title: "Договор аренды",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RentContractPage({ params }: Props) {
  const user = await getAuthUser();
  if (!user) redirect("/admin/login");
  if (!hasPermission(user, "rent.manage")) redirect("/admin");

  const { id } = await params;
  const repo = container.get<RentCarRepository>("RentCarRepository");
  const request = await repo.getRentRequestById(id);
  if (!request) notFound();

  const [car, contact] = await Promise.all([
    request.carId ? repo.getById(request.carId) : Promise.resolve(null),
    container.get<ContactInfoRepository>("ContactInfoRepository").get(),
  ]);

  const number = request.id.slice(0, 8).toUpperCase();
  const money = (value?: number) => (value != null ? `${value.toLocaleString("ru-RU")} BYN` : "—");
  const today = new Date().toLocaleDateString("ru-RU");

  const rows: Array<[string, string | undefined]> = [
    ["Автомобиль", car?.name ?? request.car?.name],
    ["Год выпуска", car?.year ? String(car.year) : undefined],
    ["Цвет", car?.color],
    ["Класс", car?.class],
    ["Коробка передач", car?.transmission],
    ["Топливо", car?.fuel],
    ["Дата начала", request.startDate],
    ["Дата окончания", request.endDate],
    ["Срок аренды", request.days ? `${request.days} дн.` : undefined],
    ["Доп. опции", request.extras],
    ["Стоимость аренды", money(request.total)],
    ["Залог", money(request.deposit)],
  ];

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-zinc-900 print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex justify-end print:hidden">
          <PrintReportButton />
        </div>

        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-zinc-900 pb-4">
          <div>
            <p className="text-2xl font-bold tracking-tight">АВТОWAY</p>
            <p className="mt-1 text-xs text-zinc-600">
              {[contact?.address, contact?.phone, contact?.email].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="text-right text-xs text-zinc-600">
            <p>Договор № {number}</p>
            <p>от {today}</p>
          </div>
        </header>

        <h1 className="mt-6 text-center text-xl font-bold uppercase tracking-wide">
          Договор аренды автомобиля
        </h1>

        <section className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Арендодатель</p>
            <p className="mt-1 font-medium">АВТОWAY</p>
            <p className="text-xs text-zinc-600">{contact?.address ?? "г. Минск, Беларусь"}</p>
            {contact?.phone && <p className="text-xs text-zinc-600">Тел.: {contact.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Арендатор</p>
            <p className="mt-1 font-medium">{request.name}</p>
            {request.phone && <p className="text-xs text-zinc-600">Тел.: {request.phone}</p>}
            {request.email && <p className="text-xs text-zinc-600">Email: {request.email}</p>}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Предмет договора</h2>
          <table className="mt-2 w-full text-left text-sm">
            <tbody>
              {rows.filter(([, value]) => Boolean(value)).map(([label, value]) => (
                <tr key={label} className="border-b border-zinc-200">
                  <td className="w-1/2 py-2 text-zinc-500">{label}</td>
                  <td className="py-2 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 space-y-2 text-xs leading-relaxed text-zinc-700">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Условия аренды</h2>
          <p>1. Арендатор обязуется использовать автомобиль по назначению, соблюдать Правила дорожного движения и законодательство Республики Беларусь.</p>
          <p>2. Автомобиль передаётся и возвращается по акту приёма-передачи. Арендатор возвращает автомобиль в согласованный срок в чистом виде и с тем же уровнем топлива.</p>
          <p>3. Залог возвращается Арендатору после осмотра автомобиля и при отсутствии повреждений, штрафов и задолженностей.</p>
          <p>4. Штрафы, расходы на эвакуацию и устранение повреждений, возникших по вине Арендатора, оплачиваются Арендатором.</p>
          <p>5. Арендатор не вправе передавать автомобиль третьим лицам, использовать его в качестве такси без отдельного согласования, выезжать за пределы Республики Беларусь без письменного согласия Арендодателя.</p>
          <p>6. Стороны несут ответственность в соответствии с законодательством Республики Беларусь.</p>
        </section>

        <section className="mt-10 grid gap-8 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Арендодатель</p>
            <p className="mt-6 border-t border-zinc-400 pt-1 text-xs text-zinc-500">подпись / ФИО</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Арендатор</p>
            <p className="mt-6 border-t border-zinc-400 pt-1 text-xs text-zinc-500">подпись / ФИО</p>
          </div>
        </section>

        <p className="mt-8 text-[10px] leading-relaxed text-zinc-400">
          Документ сформирован автоматически в системе АВТОWAY. Перед подписанием проверьте данные и при необходимости согласуйте форму с юристом.
        </p>
      </div>
    </div>
  );
}
