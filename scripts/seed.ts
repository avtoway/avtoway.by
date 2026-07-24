import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./data/avtoway.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const roleDefs = [
    { name: "Администратор", description: "Полный доступ", level: 100 },
    { name: "Редактор", description: "Управление услугами и партнёрами", level: 50 },
    { name: "Наблюдатель", description: "Только просмотр", level: 10 },
  ];

  const perms: Record<string, string[]> = {
    "Администратор": ["users.manage", "users.roles", "services.manage", "partners.manage", "audit.view"],
    "Редактор": ["services.manage", "partners.manage"],
    "Наблюдатель": ["services.view", "partners.view"],
  };

  for (const r of roleDefs) {
    const existing = await prisma.role.findUnique({ where: { name: r.name } });
    if (existing) {
      if (!existing.level) await prisma.role.update({ where: { id: existing.id }, data: { level: r.level, description: r.description } });
      continue;
    }
    await prisma.role.create({
      data: {
        name: r.name,
        description: r.description,
        level: r.level,
        permissions: {
          create: (perms[r.name] ?? []).map(p => ({ permission: p })),
        },
      },
    });
  }

  const admin = await prisma.user.findUnique({ where: { login: "admin" } });
  let userId: string;
  if (admin) {
    userId = admin.id;
    console.log("Admin user exists");
  } else {
    const password = await bcrypt.hash("admin123", 10);
    const user = await prisma.user.create({
      data: {
        login: "admin",
        password,
        profile: {
          create: {
            name: "Admin",
            email: "admin@avtoway.by",
            phone: "+375 (29) 111-11-11",
            position: "Главный администратор",
            birthDate: "1990-01-01",
            workSchedule: "full_time",
            hireDate: "2024-01-15",
          },
        },
      },
    });
    userId = user.id;
  }

  const allRoles = await prisma.role.findMany();
  await prisma.userRole.deleteMany({ where: { userId } });
  for (const role of allRoles) {
    await prisma.userRole.create({ data: { userId, roleId: role.id } });
  }

  // Seed rent types
  const rentTypes = [
    { slug: "rent", name: "Аренда", sortOrder: 1 },
    { slug: "taxi", name: "Под такси", sortOrder: 2 },
  ];
  for (const rt of rentTypes) {
    const existing = await prisma.rentType.findUnique({ where: { slug: rt.slug } });
    if (!existing) {
      await prisma.rentType.create({ data: rt });
      console.log(`  Тип аренды: ${rt.name}`);
    }
  }

  // Seed car brands + models
  const brands: { name: string; slug: string; models: { name: string; slug: string }[] }[] = [
    { name: "Audi", slug: "audi", models: [{ name: "A3", slug: "a3" }, { name: "A4", slug: "a4" }, { name: "A5", slug: "a5" }, { name: "A6", slug: "a6" }, { name: "A7", slug: "a7" }, { name: "A8", slug: "a8" }, { name: "Q3", slug: "q3" }, { name: "Q5", slug: "q5" }, { name: "Q7", slug: "q7" }, { name: "Q8", slug: "q8" }] },
    { name: "BMW", slug: "bmw", models: [{ name: "1 Series", slug: "1-series" }, { name: "2 Series", slug: "2-series" }, { name: "3 Series", slug: "3-series" }, { name: "4 Series", slug: "4-series" }, { name: "5 Series", slug: "5-series" }, { name: "7 Series", slug: "7-series" }, { name: "X1", slug: "x1" }, { name: "X3", slug: "x3" }, { name: "X5", slug: "x5" }, { name: "X6", slug: "x6" }] },
    { name: "Chery", slug: "chery", models: [{ name: "Tiggo 4", slug: "tiggo-4" }, { name: "Tiggo 7", slug: "tiggo-7" }, { name: "Tiggo 8", slug: "tiggo-8" }, { name: "Tiggo 9", slug: "tiggo-9" }] },
    { name: "Chevrolet", slug: "chevrolet", models: [{ name: "Aveo", slug: "aveo" }, { name: "Camaro", slug: "camaro" }, { name: "Cruze", slug: "cruze" }, { name: "Lacetti", slug: "lacetti" }, { name: "Tahoe", slug: "tahoe" }] },
    { name: "Citroen", slug: "citroen", models: [{ name: "C1", slug: "c1" }, { name: "C3", slug: "c3" }, { name: "C4", slug: "c4" }, { name: "C5", slug: "c5" }] },
    { name: "Ford", slug: "ford", models: [{ name: "Fiesta", slug: "fiesta" }, { name: "Focus", slug: "focus" }, { name: "Kuga", slug: "kuga" }, { name: "Mondeo", slug: "mondeo" }, { name: "Mustang", slug: "mustang" }, { name: "Transit", slug: "transit" }] },
    { name: "Geely", slug: "geely", models: [{ name: "Atlas", slug: "atlas" }, { name: "Coolray", slug: "coolray" }, { name: "Monjaro", slug: "monjaro" }, { name: "Tugella", slug: "tugella" }] },
    { name: "Honda", slug: "honda", models: [{ name: "Accord", slug: "accord" }, { name: "Civic", slug: "civic" }, { name: "CR-V", slug: "cr-v" }, { name: "Fit", slug: "fit" }, { name: "Stepwgn", slug: "stepwgn" }] },
    { name: "Hyundai", slug: "hyundai", models: [{ name: "Accent", slug: "accent" }, { name: "Elantra", slug: "elantra" }, { name: "Santa Fe", slug: "santa-fe" }, { name: "Solaris", slug: "solaris" }, { name: "Sonata", slug: "sonata" }, { name: "Tucson", slug: "tucson" }] },
    { name: "Kia", slug: "kia", models: [{ name: "Ceed", slug: "ceed" }, { name: "K5", slug: "k5" }, { name: "Mohave", slug: "mohave" }, { name: "RIO", slug: "rio" }, { name: "Seltos", slug: "seltos" }, { name: "Sorento", slug: "sorento" }, { name: "Sportage", slug: "sportage" }] },
    { name: "Lada", slug: "lada", models: [{ name: "Granta", slug: "granta" }, { name: "Priora", slug: "priora" }, { name: "Vesta", slug: "vesta" }, { name: "X-Ray", slug: "x-ray" }, { name: "Niva", slug: "niva" }] },
    { name: "Lexus", slug: "lexus", models: [{ name: "ES", slug: "es" }, { name: "IS", slug: "is" }, { name: "LX", slug: "lx" }, { name: "NX", slug: "nx" }, { name: "RX", slug: "rx" }] },
    { name: "Mazda", slug: "mazda", models: [{ name: "3", slug: "3" }, { name: "6", slug: "6" }, { name: "CX-5", slug: "cx-5" }, { name: "CX-9", slug: "cx-9" }, { name: "MX-5", slug: "mx-5" }] },
    { name: "Mercedes-Benz", slug: "mercedes-benz", models: [{ name: "A-Class", slug: "a-class" }, { name: "C-Class", slug: "c-class" }, { name: "E-Class", slug: "e-class" }, { name: "G-Class", slug: "g-class" }, { name: "GLC", slug: "glc" }, { name: "GLE", slug: "gle" }, { name: "S-Class", slug: "s-class" }] },
    { name: "Mitsubishi", slug: "mitsubishi", models: [{ name: "ASX", slug: "asx" }, { name: "Lancer", slug: "lancer" }, { name: "Outlander", slug: "outlander" }, { name: "Pajero", slug: "pajero" }] },
    { name: "Nissan", slug: "nissan", models: [{ name: "Almera", slug: "almera" }, { name: "Juke", slug: "juke" }, { name: "Leaf", slug: "leaf" }, { name: "Qashqai", slug: "qashqai" }, { name: "Teana", slug: "teana" }, { name: "X-Trail", slug: "x-trail" }] },
    { name: "Opel", slug: "opel", models: [{ name: "Astra", slug: "astra" }, { name: "Corsa", slug: "corsa" }, { name: "Insignia", slug: "insignia" }, { name: "Mokka", slug: "mokka" }, { name: "Zafira", slug: "zafira" }] },
    { name: "Peugeot", slug: "peugeot", models: [{ name: "206", slug: "206" }, { name: "207", slug: "207" }, { name: "3008", slug: "3008" }, { name: "308", slug: "308" }, { name: "508", slug: "508" }] },
    { name: "Renault", slug: "renault", models: [{ name: "Duster", slug: "duster" }, { name: "Kaptur", slug: "kaptur" }, { name: "Logan", slug: "logan" }, { name: "Megane", slug: "megane" }, { name: "Sandero", slug: "sandero" }] },
    { name: "Skoda", slug: "skoda", models: [{ name: "Fabia", slug: "fabia" }, { name: "Kodiaq", slug: "kodiaq" }, { name: "Octavia", slug: "octavia" }, { name: "Rapid", slug: "rapid" }, { name: "Superb", slug: "superb" }] },
    { name: "Subaru", slug: "subaru", models: [{ name: "Forester", slug: "forester" }, { name: "Impreza", slug: "impreza" }, { name: "Legacy", slug: "legacy" }, { name: "Outback", slug: "outback" }] },
    { name: "Toyota", slug: "toyota", models: [{ name: "Camry", slug: "camry" }, { name: "Corolla", slug: "corolla" }, { name: "Highlander", slug: "highlander" }, { name: "Land Cruiser", slug: "land-cruiser" }, { name: "RAV4", slug: "rav4" }] },
    { name: "Volkswagen", slug: "volkswagen", models: [{ name: "Golf", slug: "golf" }, { name: "Jetta", slug: "jetta" }, { name: "Passat", slug: "passat" }, { name: "Polo", slug: "polo" }, { name: "Tiguan", slug: "tiguan" }, { name: "Touran", slug: "touran" }] },
    { name: "Volvo", slug: "volvo", models: [{ name: "S60", slug: "s60" }, { name: "S90", slug: "s90" }, { name: "XC40", slug: "xc40" }, { name: "XC60", slug: "xc60" }, { name: "XC90", slug: "xc90" }] },
  ];

  for (const b of brands) {
    const existing = await prisma.carBrand.findUnique({ where: { slug: b.slug } });
    if (!existing) {
      await prisma.carBrand.create({
        data: {
          name: b.name, slug: b.slug,
          models: { create: b.models.map(m => ({ name: m.name, slug: m.slug })) },
        },
      });
      console.log(`  Марка: ${b.name}`);
    }
  }

  console.log("База данных готова");
  console.log("  Логин: admin / admin123");
  console.log("  Роли: Администратор, Редактор, Наблюдатель");
}

main().catch((e) => { console.error("Seed failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
