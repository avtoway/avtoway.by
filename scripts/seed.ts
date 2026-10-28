import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import { seedAutoPodbor } from "./seed-autopodbor";
import { seedSaleCars } from "./seed-sell";
import { seedRentCars } from "./seed-rent";

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
    "Администратор": ["users.manage", "users.roles", "services.manage", "partners.manage", "audit.view", "rent.manage", "sell.manage", "contacts.manage", "email.manage", "autopodbor.manage", "autopodbor.requests", "autopodbor.view"],
    "Редактор": ["services.manage", "partners.manage", "rent.manage", "sell.manage", "contacts.manage", "autopodbor.manage", "autopodbor.requests"],
    "Наблюдатель": ["services.view", "partners.view", "autopodbor.view"],
  };

  for (const r of roleDefs) {
    const existing = await prisma.role.findUnique({ where: { name: r.name } });
    if (existing) {
      await prisma.role.update({ where: { id: existing.id }, data: { level: r.level, description: r.description } });
      // Upsert permissions (keep them in sync with the definitions above)
      await prisma.rolePermission.deleteMany({ where: { roleId: existing.id } });
      for (const p of perms[r.name] ?? []) {
        await prisma.rolePermission.create({ data: { roleId: existing.id, permission: p } });
      }
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

  // Seed rent types (name is the single source of truth for the public UI)
  const rentTypes = [
    { slug: "rent", name: "Для личных целей", sortOrder: 1 },
    { slug: "taxi", name: "Под такси", sortOrder: 2 },
  ];
  for (const rt of rentTypes) {
    const existing = await prisma.rentType.findUnique({ where: { slug: rt.slug } });
    if (!existing) {
      await prisma.rentType.create({ data: rt });
      console.log(`  Тип аренды: ${rt.name}`);
    } else if (existing.name !== rt.name) {
      await prisma.rentType.update({ where: { slug: rt.slug }, data: { name: rt.name } });
      console.log(`  Тип аренды обновлён: ${existing.name} → ${rt.name}`);
    }
  }

  // Seed fuel types
  const fuels = [
    { slug: "gasoline", name: "Бензин" },
    { slug: "gas-propane", name: "Бензин (пропан-бутан)" },
    { slug: "gas-methane", name: "Бензин (метан)" },
    { slug: "gas-hybrid", name: "Бензин (гибрид)" },
    { slug: "diesel", name: "Дизель" },
    { slug: "diesel-hybrid", name: "Дизель (гибрид)" },
    { slug: "electric", name: "Электро" },
  ];
  for (const f of fuels) {
    const exists = await prisma.fuel.findUnique({ where: { slug: f.slug } });
    if (!exists) await prisma.fuel.create({ data: f });
  }

  // Seed transmission types
  const transmissions = [
    { slug: "auto", name: "Автомат" },
    { slug: "manual", name: "Механика" },
    { slug: "robot", name: "Робот" },
    { slug: "variator", name: "Вариатор" },
  ];
  for (const t of transmissions) {
    const exists = await prisma.transmission.findUnique({ where: { slug: t.slug } });
    if (!exists) await prisma.transmission.create({ data: t });
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
    { name: "Tesla", slug: "tesla", models: [{ name: "Model 3", slug: "model-3" }, { name: "Model S", slug: "model-s" }, { name: "Model X", slug: "model-x" }, { name: "Model Y", slug: "model-y" }] },
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

  // Seed comfort features
  const comfortFeatures = [
    { slug: "air-conditioner", name: "Кондиционер", sortOrder: 1 },
    { slug: "climate-control", name: "Климат-контроль", sortOrder: 2 },
    { slug: "seat-heating", name: "Подогрев сидений", sortOrder: 3 },
    { slug: "seat-ventilation", name: "Вентиляция сидений", sortOrder: 4 },
    { slug: "sunroof", name: "Люк", sortOrder: 5 },
    { slug: "panoramic-roof", name: "Панорамная крыша", sortOrder: 6 },
    { slug: "navigation", name: "Навигация", sortOrder: 7 },
    { slug: "apple-carplay", name: "Apple CarPlay", sortOrder: 8 },
    { slug: "android-auto", name: "Android Auto", sortOrder: 9 },
    { slug: "bluetooth", name: "Bluetooth", sortOrder: 10 },
    { slug: "cruise-control", name: "Круиз-контроль", sortOrder: 11 },
    { slug: "parktronic", name: "Парктроники", sortOrder: 12 },
    { slug: "rear-camera", name: "Камера заднего вида", sortOrder: 13 },
    { slug: "leather-interior", name: "Кожаный салон", sortOrder: 14 },
  ];
  for (const cf of comfortFeatures) {
    const exists = await prisma.comfortFeature.findUnique({ where: { slug: cf.slug } });
    if (!exists) await prisma.comfortFeature.create({ data: cf });
  }

  // Seed car classes (класс автомобиля)
  const carClasses = [
    { slug: "economy", name: "Эконом", sortOrder: 1, deposit: 150, minAge: 19 },
    { slug: "comfort", name: "Комфорт", sortOrder: 2, deposit: 200, minAge: 21 },
    { slug: "comfort-plus", name: "Комфорт+", sortOrder: 3, deposit: 250, minAge: 21 },
    { slug: "business", name: "Бизнес", sortOrder: 4, deposit: 400, minAge: 23 },
    { slug: "premium", name: "Премиум", sortOrder: 5, deposit: 800, minAge: 25 },
    { slug: "suv", name: "SUV/Кроссовер", sortOrder: 6, deposit: 300, minAge: 21 },
    { slug: "minivan", name: "Минивэн", sortOrder: 7, deposit: 300, minAge: 21 },
    { slug: "electric", name: "Электро", sortOrder: 8, deposit: 400, minAge: 21 },
  ];
  for (const c of carClasses) {
    const exists = await prisma.carClass.findUnique({ where: { slug: c.slug } });
    if (!exists) await prisma.carClass.create({ data: c });
  }

  // Seed rent extras (доп. опции для калькулятора)
  const rentExtras = [
    { slug: "child-seat", name: "Детское кресло", description: "Автокресло для ребёнка (0–7 лет)", priceType: "perDay", price: 15, sortOrder: 1 },
    { slug: "booster", name: "Бустер", description: "Бустер для ребёнка старше 7 лет", priceType: "perDay", price: 10, sortOrder: 2 },
    { slug: "additional-driver", name: "Дополнительный водитель", description: "Второй водитель в договоре", priceType: "perDay", price: 15, sortOrder: 3 },
    { slug: "delivery", name: "Доставка / подача авто", description: "Привезём авто к вам", priceType: "perRental", price: 50, sortOrder: 4 },
    { slug: "navigation", name: "Навигатор", description: "GPS-навигатор в салоне", priceType: "perDay", price: 5, sortOrder: 5 },
    { slug: "insurance", name: "Расширенная страховка", description: "Сниженная франшиза и полное покрытие", priceType: "perDay", price: 20, sortOrder: 6 },
    { slug: "car-wash", name: "Финальная мойка", description: "Вернуть авто без мойки", priceType: "perRental", price: 30, sortOrder: 7 },
    { slug: "winter-tires", name: "Зимняя резина", description: "Комплект зимних шин", priceType: "perDay", price: 10, sortOrder: 8 },
  ];
  for (const e of rentExtras) {
    const exists = await prisma.rentExtra.findUnique({ where: { slug: e.slug } });
    if (!exists) await prisma.rentExtra.create({ data: e });
  }

  // Seed calculator settings
  const calcSettings: Record<string, string> = {
    rent_min_days: "1",
    rent_max_days: "90",
  };
  for (const [key, value] of Object.entries(calcSettings)) {
    const exists = await prisma.setting.findUnique({ where: { key } });
    if (!exists) await prisma.setting.create({ data: { key, value } });
  }

  // Seed pricing tiers (тарифные ступени) — только если таблица пуста
  const pricingTiers = [
    { minDays: 1, maxDays: 2, discount: 0, sortOrder: 1 },
    { minDays: 3, maxDays: 7, discount: 10, sortOrder: 2 },
    { minDays: 8, maxDays: 14, discount: 17, sortOrder: 3 },
    { minDays: 15, maxDays: 30, discount: 25, sortOrder: 4 },
    { minDays: 31, maxDays: null, discount: 32, sortOrder: 5 },
  ];
  if (await prisma.rentPricingTier.count() === 0) {
    for (const t of pricingTiers) await prisma.rentPricingTier.create({ data: t });
    console.log("  Тарифные ступени: 5");
  }

  // Seed rent conditions (условия аренды)
  const rentConditions = [
    { slug: "age-limit", name: "Ограничение по возрасту", placeholder: "например, от 21 года", sortOrder: 1 },
    { slug: "experience", name: "Стаж вождения", placeholder: "например, от 2 лет", sortOrder: 2 },
    { slug: "deposit", name: "Страховой депозит / залог", placeholder: "например, 300 BYN", sortOrder: 3 },
    { slug: "mileage", name: "Лимит пробега", placeholder: "например, 250 км/сутки", sortOrder: 4 },
    { slug: "documents", name: "Необходимые документы", placeholder: "например, паспорт, водительское удостоверение", sortOrder: 5 },
    { slug: "abroad", name: "Выезд за границу", placeholder: "например, по согласованию", sortOrder: 6 },
  ];
  for (const c of rentConditions) {
    const exists = await prisma.rentCondition.findUnique({ where: { slug: c.slug } });
    if (!exists) await prisma.rentCondition.create({ data: c });
  }

  // Seed contact settings (settings table)
  const contactSettings: Record<string, string> = {
    contact_phone: "+375 (29) 111-22-33",
    contact_telegram: "https://t.me/avtoway_by",
    contact_viber: "+375291112233",
    contact_whatsapp: "+375291112233",
    contact_instagram: "@avtoway.by",
  };
  for (const [key, value] of Object.entries(contactSettings)) {
    const exists = await prisma.setting.findUnique({ where: { key } });
    if (!exists) await prisma.setting.create({ data: { key, value } });
  }

  // Seed services (single source of truth for the public catalog)
  const services = [
    { slug: "rent", title: "Аренда", description: "Аренда под ваши задачи. По дням, неделям и месяцам.", icon: "car", color: "#3b82f6", isActive: true, sortOrder: 1 },
    { slug: "sell", title: "Продажа авто", description: "Продам ваше авто быстро, дорого, без головной боли.", icon: "dollar", color: "#f59e0b", isActive: true, sortOrder: 2 },
    { slug: "inspection", title: "Автоподбор", description: "Проверю авто от и до. Диагностика, документы, торг — полное сопровождение.", icon: "check-circle", color: "#10b981", isActive: true, sortOrder: 3 },
    { slug: "truck", title: "Эвакуатор", description: "Быстрая и надёжная эвакуация авто. Круглосуточно.", icon: "car", color: "#ef4444", isActive: false, sortOrder: 4 },
    { slug: "import", title: "Автопригон", description: "Пригон авто из США, Китая, Европы и Кореи. Под ключ.", icon: "car", color: "#8b5cf6", isActive: false, sortOrder: 5 },
    { slug: "service", title: "Автосервис", description: "Ремонт и обслуживание автомобилей любой сложности.", icon: "car", color: "#f97316", isActive: false, sortOrder: 6 },
  ];
  for (const s of services) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (existing) {
      await prisma.service.update({ where: { slug: s.slug }, data: { title: s.title, description: s.description, icon: s.icon, color: s.color, isActive: s.isActive, sortOrder: s.sortOrder } });
    } else {
      await prisma.service.create({ data: s });
      console.log(`  Услуга: ${s.title}`);
    }
  }

  // Seed contact info (contacts table — singleton)
  const contactRow = await prisma.contact.findFirst();
  if (!contactRow) {
    await prisma.contact.create({
      data: {
        phone: "+375 (29) 111-22-33",
        email: "info@avtoway.by",
        telegram: "https://t.me/avtoway_by",
        viber: "+375291112233",
        whatsapp: "+375291112233",
        instagram: "https://www.instagram.com/avtoway_by/",
        youtube: "https://youtube.com/@avtoway",
        rutube: "https://rutube.ru/channel/32699183/",
        vk: "https://vk.com/video/@avtoway_channel",
        address: "г. Минск, Беларусь",
        workingHours: "Пн–Вс 9:00 – 21:00",
      },
    });
  }

  await seedRentCars(prisma);
  await seedSaleCars(prisma);
  await seedAutoPodbor(prisma);

  console.log("База данных готова");
  console.log("  Логин: admin / admin123");
  console.log("  Роли: Администратор, Редактор, Наблюдатель");
}

main().catch((e) => { console.error("Seed failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
