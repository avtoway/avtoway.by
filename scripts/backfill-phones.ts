import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * Заполняет normalized_phone у существующих заявок.
 * Идемпотентно: обрабатывает только строки, где поле ещё пустое.
 */

const url = process.env.DATABASE_URL ?? "file:./data/avtoway.db";
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url }) });

function normalize(value?: string | null): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits || null;
}

async function fill<T extends { id: string; phone?: string | null }>(
  label: string,
  rows: T[],
  update: (id: string, normalizedPhone: string) => Promise<unknown>,
): Promise<number> {
  let updated = 0;
  for (const row of rows) {
    const normalized = normalize(row.phone);
    if (!normalized) continue;
    await update(row.id, normalized);
    updated++;
  }
  console.log(`  ${label}: ${updated}`);
  return updated;
}

async function main() {
  console.log("Нормализация телефонов…");

  const [contacts, rents, sales, autos] = await Promise.all([
    prisma.contactRequest.findMany({ where: { normalizedPhone: null, phone: { not: null } }, select: { id: true, phone: true } }),
    prisma.rentRequest.findMany({ where: { normalizedPhone: null, phone: { not: null } }, select: { id: true, phone: true } }),
    prisma.saleRequest.findMany({ where: { normalizedPhone: null }, select: { id: true, clientPhone: true } }),
    prisma.autoPodborLead.findMany({ where: { normalizedPhone: null, phone: { not: null } }, select: { id: true, phone: true } }),
  ]);

  const salesRows = sales.map(row => ({ id: row.id, phone: row.clientPhone }));

  const total =
    await fill("contact_requests", contacts, (id, normalizedPhone) =>
      prisma.contactRequest.update({ where: { id }, data: { normalizedPhone } })) +
    await fill("rent_requests", rents, (id, normalizedPhone) =>
      prisma.rentRequest.update({ where: { id }, data: { normalizedPhone } })) +
    await fill("sale_requests", salesRows, (id, normalizedPhone) =>
      prisma.saleRequest.update({ where: { id }, data: { normalizedPhone } })) +
    await fill("autopodbor_leads", autos, (id, normalizedPhone) =>
      prisma.autoPodborLead.update({ where: { id }, data: { normalizedPhone } }));

  console.log(`Готово: обновлено ${total} записей.`);
}

main()
  .catch(error => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
