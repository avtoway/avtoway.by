import type { Metadata } from "next";
import type { InspectionReport } from "@/entities/report/report.types";
import ReportView from "@/features/reports/ui/report-view";
import { getCachedContactInfo } from "@/shared/lib/contact-info.server";
import { getActiveServices } from "@/shared/lib/active-services.server";

export const metadata: Metadata = {
  title: "Пример отчёта осмотра",
  description: "Как выглядит цифровой отчёт проверки автомобиля АВТОWAY: чек-лист, вердикт, смета ремонта и фото.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/report/demo" },
};

const DEMO_REPORT: InspectionReport = {
  id: "demo",
  token: "demo",
  clientName: "Демо-клиент",
  carTitle: "Volkswagen Passat B8 2.0 TDI, 2018",
  vin: "WVWZZZ3CZJE000000",
  mileageKm: 184500,
  inspectedAt: "12.11.2026",
  verdict: "caution",
  summary:
    "Автомобиль в целом живой: кузов без серьёзных ДТП, двигатель и коробка работают ровно. " +
    "Есть замечания по задней подвеске и лакокрасочному покрытию крыла. " +
    "Рекомендую торг на сумму предстоящего ремонта — примерно 590 BYN.",
  checklist: [
    { category: "Кузов", title: "Толщина ЛКП по элементам", status: "attention", note: "Заднее левое крыло окрашено, толщина 340 мкм." },
    { category: "Кузов", title: "Зазоры и геометрия", status: "ok", note: "Зазоры равномерные, следов серьёзного ремонта нет." },
    { category: "Кузов", title: "Стёкла и оптика", status: "ok", note: "Маркировка совпадает, трещин нет." },
    { category: "Двигатель", title: "Запуск и работа на холостых", status: "ok", note: "Запуск уверенный, посторонних шумов нет." },
    { category: "Двигатель", title: "Течи масла и охлаждающей жидкости", status: "attention", note: "Запотевание сальника коленвала, требуется наблюдение." },
    { category: "Двигатель", title: "Компьютерная диагностика", status: "ok", note: "Активных ошибок нет, пробег подтверждён." },
    { category: "Ходовая", title: "Амортизаторы и пружины", status: "attention", note: "Задние амортизаторы работают на пределе." },
    { category: "Ходовая", title: "Сайлентблоки и рычаги", status: "ok", note: "Люфтов не обнаружено." },
    { category: "Электрика", title: "Проверка блоков управления", status: "ok", note: "Ошибок нет, все блоки отвечают." },
    { category: "Электрика", title: "Аккумулятор и генератор", status: "ok", note: "Напряжение в норме." },
    { category: "Салон", title: "Состояние салона", status: "ok", note: "Естественный износ по пробегу." },
    { category: "Документы", title: "VIN и регистрационные данные", status: "ok", note: "VIN совпадает, ограничений нет." },
  ],
  expenses: [
    { label: "Замена задних амортизаторов", amount: 320 },
    { label: "Замена задних тормозных колодок", amount: 180 },
    { label: "Полировка фар", amount: 90 },
  ],
  photos: ["/uploads/rent/demo-hyundai.jpg", "/uploads/rent/demo-kia.jpg"],
  isPublished: true,
  createdAt: "2026-11-12T10:00:00.000Z",
  updatedAt: "2026-11-12T10:00:00.000Z",
};

export default async function ReportDemoPage() {
  const [contact, services] = await Promise.all([getCachedContactInfo(), getActiveServices()]);
  const inspectionActive = services.some(service => service.slug === "inspection");

  return <ReportView report={DEMO_REPORT} contact={contact} inspectionActive={inspectionActive} demo />;
}
