import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

/** Отдаёт /ads.txt из настройки ads_txt (редактируется в /admin/promotion). */
export async function GET() {
  let content = "# ads.txt АВТОWAY. Добавьте строку Google AdSense или Яндекс.Рекламы в /admin/promotion.\n";

  try {
    const row = await getPrismaClient().setting.findUnique({ where: { key: "ads_txt" } });
    if (row?.value?.trim()) content = row.value;
  } catch {
    // Если БД недоступна, отдаём безопасную заглушку.
  }

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=600",
    },
  });
}
