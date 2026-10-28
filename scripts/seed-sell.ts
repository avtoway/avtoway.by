import type { PrismaClient } from "@prisma/client";

interface SeedSaleCar {
  slug: string;
  title: string;
  brand: string;
  model: string;
  generation: string;
  priceUsd: number;
  oldPriceUsd?: number;
  year: number;
  mileageKm: number;
  bodyType: string;
  transmission: string;
  fuel: string;
  engineVolume?: number;
  enginePowerHp?: number;
  driveType: string;
  color: string;
  interiorMaterial: string;
  interiorColor: string;
  ownersCount: string;
  originCountry: string;
  status: string;
  isFeatured?: boolean;
  allowExchange?: boolean;
  allowCredit?: boolean;
  vin: string;
  photos: string[];
  description: string;
  expertSummary: string;
  bodyCheckNote: string;
  techCheckNote: string;
  legalCheckNote: string;
  features: string[];
  customSpecs?: Array<{ label: string; value: string }>;
}

const DEMO: SeedSaleCar[] = [
  {
    slug: "bmw-5-g30-530i-xdrive-2020",
    title: "BMW 5 серия G30 530i xDrive",
    brand: "bmw",
    model: "5-series",
    generation: "G30 (рестайлинг)",
    priceUsd: 24500,
    oldPriceUsd: 25900,
    year: 2020,
    mileageKm: 84000,
    bodyType: "sedan",
    transmission: "auto",
    fuel: "gasoline",
    engineVolume: 2.0,
    enginePowerHp: 249,
    driveType: "awd",
    color: "Чёрный металлик",
    interiorMaterial: "leather",
    interiorColor: "dark",
    ownersCount: "2",
    originCountry: "Беларусь",
    status: "available",
    isFeatured: true,
    allowExchange: true,
    allowCredit: true,
    vin: "WBA5R************",
    photos: ["/uploads/sell/demo-bmw-1.jpg", "/uploads/sell/demo-interior-1.jpg", "/uploads/sell/demo-interior-3.jpg"],
    description:
      "Ухоженный BMW 530i xDrive в комплектации M Sport. Обслуживался у официального дилера, есть сервисная книжка. Салон в отличном состоянии, без запаха и следов эксплуатации. Автомобиль полностью проверен перед публикацией: кузов, двигатель, коробка, подвеска и юридическая чистота.",
    expertSummary:
      "Один из самых живых экземпляров G30 в нашей подборке: ровный кузов, прозрачная история и полностью обслуженный двигатель. Рекомендую к осмотру.",
    bodyCheckNote:
      "Толщиномер показал заводское ЛКП на всех элементах, кроме переднего бампера — он перекрашивался после мелкого контакта. Следов серьёзного ремонта нет.",
    techCheckNote:
      "Двигатель B48 работает ровно, ошибок нет. Коробка ZF переключается без толчков, подвеска без стуков. Заменены масло, фильтры и тормозные колодки.",
    legalCheckNote:
      "Ограничений и залогов нет, VIN совпадает, автомобиль растаможен. Два владельца по ПТС, последний — более 4 лет.",
    features: [
      "ABS", "ESP", "Боковые airbag", "Шторки безопасности", "Климат-контроль",
      "Подогрев сидений", "Электропривод сидений", "Память сидений", "LED-фары",
      "Камера заднего вида", "Парктроники", "Apple CarPlay", "Навигация",
      "Кожаный салон", "Панорамная крыша", "Легкосплавные диски",
    ],
    customSpecs: [
      { label: "Разгон 0–100", value: "6.2 с" },
      { label: "Расход по трассе", value: "6.4 л/100 км" },
    ],
  },
  {
    slug: "toyota-camry-xv70-2-5-2019",
    title: "Toyota Camry XV70 2.5",
    brand: "toyota",
    model: "camry",
    generation: "XV70",
    priceUsd: 21500,
    year: 2019,
    mileageKm: 96000,
    bodyType: "sedan",
    transmission: "auto",
    fuel: "gasoline",
    engineVolume: 2.5,
    enginePowerHp: 181,
    driveType: "fwd",
    color: "Белый перламутр",
    interiorMaterial: "leather",
    interiorColor: "light",
    ownersCount: "1",
    originCountry: "Россия",
    status: "available",
    allowExchange: true,
    vin: "JTNBE************",
    photos: ["/uploads/sell/demo-toyota-1.jpg", "/uploads/sell/demo-interior-2.jpg", "/uploads/sell/demo-interior-1.jpg"],
    description:
      "Toyota Camry XV70 с одним владельцем и прозрачной историей. Автомобиль использовался для личных поездок, обслуживался регулярно. Салон светлый, без потёртостей, комплектация богатая.",
    expertSummary:
      "Спокойный семейный седан с понятной историей и небольшим для своего года пробегом. Кузов и техническая часть — без замечаний.",
    bodyCheckNote: "Кузов весь в заводской краске, толщиномер равномерный. Небольшие сколы на капоте, без коррозии.",
    techCheckNote: "Двигатель 2.5 и автомат работают штатно, ошибок нет. Подвеска обслужена, тормоза в норме.",
    legalCheckNote: "Юридически чист, VIN проверен, ограничений нет. Один владелец по документам.",
    features: [
      "ABS", "ESP", "Airbag водителя", "Airbag пассажира", "Климат-контроль",
      "Подогрев сидений", "Круиз-контроль", "LED-фары", "Камера заднего вида",
      "Парктроники", "Apple CarPlay", "Android Auto", "Кожаный салон", "Электропривод багажника",
    ],
    customSpecs: [{ label: "Расход в городе", value: "9.1 л/100 км" }],
  },
  {
    slug: "volkswagen-passat-b8-2-0-tdi-2018",
    title: "Volkswagen Passat B8 2.0 TDI",
    brand: "volkswagen",
    model: "passat",
    generation: "B8",
    priceUsd: 17500,
    year: 2018,
    mileageKm: 145000,
    bodyType: "wagon",
    transmission: "robot",
    fuel: "diesel",
    engineVolume: 2.0,
    enginePowerHp: 150,
    driveType: "fwd",
    color: "Серебристый металлик",
    interiorMaterial: "combined",
    interiorColor: "dark",
    ownersCount: "2",
    originCountry: "Германия",
    status: "reserved",
    allowExchange: true,
    allowCredit: true,
    vin: "WVWZZZ************",
    photos: ["/uploads/sell/demo-vw-1.jpg", "/uploads/sell/demo-interior-1.jpg", "/uploads/sell/demo-interior-2.jpg"],
    description:
      "Практичный универсал Passat B8 с экономичным дизелем. Отличный вариант для семьи и дальних поездок. Обслуживался по регламенту, есть история ремонтов.",
    expertSummary:
      "Честный рабочий универсал: дизель обслужен, DSG без рывков, кузов ровный. Пробег подтверждается сервисной историей.",
    bodyCheckNote: "ЛКП заводское, кроме задней двери — локальная покраска без следов ремонта. Коррозии нет.",
    techCheckNote: "Двигатель 2.0 TDI работает ровно, сажевый фильтр в норме. DSG обслужена, рывков нет.",
    legalCheckNote: "Растаможен, ограничений нет, VIN читается. Два владельца в Беларуси.",
    features: [
      "ABS", "ESP", "Климат-контроль", "Подогрев сидений", "Круиз-контроль",
      "Датчик света", "Датчик дождя", "Задние парктроники", "Bluetooth",
      "USB", "Легкосплавные диски", "Рейлинги", "Тонировка",
    ],
  },
  {
    slug: "geely-monjaro-2-0t-2022",
    title: "Geely Monjaro 2.0T AWD",
    brand: "geely",
    model: "monjaro",
    generation: "KX11",
    priceUsd: 26500,
    year: 2022,
    mileageKm: 38000,
    bodyType: "suv",
    transmission: "auto",
    fuel: "gasoline",
    engineVolume: 2.0,
    enginePowerHp: 238,
    driveType: "awd",
    color: "Чёрный металлик",
    interiorMaterial: "leather",
    interiorColor: "brown",
    ownersCount: "1",
    originCountry: "Беларусь",
    status: "available",
    isFeatured: true,
    allowExchange: true,
    allowCredit: true,
    vin: "L6T************",
    photos: ["/uploads/sell/demo-geely-1.jpg", "/uploads/sell/demo-interior-3.jpg", "/uploads/sell/demo-interior-1.jpg"],
    description:
      "Geely Monjaro в максимальной комплектации: панорама, кожа, вентиляция сидений, ассистенты водителя. Один владелец, обслуживание у дилера, небольшой пробег.",
    expertSummary:
      "Современный кроссовер с богатой комплектацией и остатком заводской гарантии. По состоянию — почти новый автомобиль.",
    bodyCheckNote: "Кузов полностью в заводской краске, без ДТП и окрасок. Толщиномер равномерный.",
    techCheckNote: "Двигатель и коробка без замечаний, компьютерная диагностика ошибок не выявила. Подвеска тихая.",
    legalCheckNote: "Один владелец, VIN проверен, автомобиль на гарантии. Ограничений нет.",
    features: [
      "ABS", "ESP", "Контроль слепых зон", "Адаптивный круиз-контроль", "Климат-контроль",
      "Вентиляция сидений", "Подогрев сидений", "Подогрев руля", "Панорамная крыша",
      "LED-фары", "Камера 360°", "Apple CarPlay", "Премиум-аудио", "Электропривод багажника",
    ],
    customSpecs: [
      { label: "Разгон 0–100", value: "7.9 с" },
      { label: "Клиренс", value: "210 мм" },
    ],
  },
  {
    slug: "audi-a6-c8-45-tfsi-2020",
    title: "Audi A6 C8 45 TFSI quattro",
    brand: "audi",
    model: "a6",
    generation: "C8",
    priceUsd: 32900,
    year: 2020,
    mileageKm: 72000,
    bodyType: "sedan",
    transmission: "robot",
    fuel: "gasoline",
    engineVolume: 2.0,
    enginePowerHp: 245,
    driveType: "awd",
    color: "Серый металлик",
    interiorMaterial: "leather",
    interiorColor: "dark",
    ownersCount: "1",
    originCountry: "Германия",
    status: "available",
    allowCredit: true,
    vin: "WAUZZZ************",
    photos: ["/uploads/sell/demo-audi-1.jpg", "/uploads/sell/demo-interior-2.jpg", "/uploads/sell/demo-interior-3.jpg"],
    description:
      "Audi A6 C8 с полным приводом quattro и виртуальной приборной панелью. Автомобиль в хорошей комплектации, обслуживался у официального дилера.",
    expertSummary:
      "Статусный седан с полным приводом и прозрачной историей. Технически здоров, кузов без серьёзных замечаний.",
    bodyCheckNote: "Заводское ЛКП, кроме переднего крыла — следы локального ремонта. Геометрия кузова в норме.",
    techCheckNote: "Двигатель 2.0 TFSI и S tronic работают штатно. Подвеска и тормоза обслужены.",
    legalCheckNote: "VIN проверен, растаможен, ограничений и залогов нет.",
    features: [
      "ABS", "ESP", "Боковые airbag", "Климат-контроль", "Подогрев сидений",
      "Электропривод сидений", "Память сидений", "Адаптивный круиз-контроль",
      "LED-фары", "Камера заднего вида", "Виртуальная приборная панель",
      "Apple CarPlay", "Навигация", "Кожаный салон",
    ],
    customSpecs: [{ label: "Разгон 0–100", value: "6.0 с" }],
  },
  {
    slug: "tesla-model-3-long-range-2021",
    title: "Tesla Model 3 Long Range AWD",
    brand: "tesla",
    model: "model-3",
    generation: "2021",
    priceUsd: 27900,
    year: 2021,
    mileageKm: 55000,
    bodyType: "sedan",
    transmission: "auto",
    fuel: "electric",
    enginePowerHp: 351,
    driveType: "awd",
    color: "Белый",
    interiorMaterial: "eco-leather",
    interiorColor: "light",
    ownersCount: "1",
    originCountry: "США",
    status: "sold",
    allowExchange: false,
    vin: "5YJ3E************",
    photos: ["/uploads/sell/demo-tesla-1.jpg", "/uploads/sell/demo-interior-1.jpg", "/uploads/sell/demo-interior-2.jpg"],
    description:
      "Tesla Model 3 Long Range с полным приводом и запасом хода около 500 км. Батарея в хорошем состоянии, зарядка Type 2 и Supercharger.",
    expertSummary:
      "Электромобиль с подтверждённым состоянием батареи и небольшим пробегом. Продан, оставили как пример страницы.",
    bodyCheckNote: "Кузов в заводской краске, без ДТП. Небольшие сколы на переднем бампере.",
    techCheckNote: "Батарея и привод проверены, ошибок нет. Запас хода соответствует пробегу.",
    legalCheckNote: "Растаможен, VIN проверен, ограничений нет.",
    features: [
      "ABS", "ESP", "Автопилот", "Климат-контроль", "Подогрев сидений",
      "Панорамная крыша", "LED-фары", "Камера 360°", "Навигация", "Премиум-аудио",
      "Бесключевой доступ", "Электропривод багажника",
    ],
    customSpecs: [
      { label: "Запас хода", value: "≈ 500 км" },
      { label: "Батарея", value: "75 кВт·ч" },
    ],
  },
];

export async function seedSaleCars(prisma: PrismaClient) {
  for (const car of DEMO) {
    const existing = await prisma.saleCar.findUnique({ where: { slug: car.slug } });
    if (existing) continue;

    const brand = await prisma.carBrand.findUnique({ where: { slug: car.brand } });
    const model = brand
      ? await prisma.carModel.findFirst({ where: { brandId: brand.id, slug: car.model } })
      : null;

    await prisma.saleCar.create({
      data: {
        slug: car.slug,
        title: car.title,
        brandId: brand?.id ?? null,
        modelId: model?.id ?? null,
        generation: car.generation,
        priceUsd: car.priceUsd,
        oldPriceUsd: car.oldPriceUsd ?? null,
        isNegotiable: true,
        allowExchange: car.allowExchange ?? false,
        allowCredit: car.allowCredit ?? false,
        year: car.year,
        mileageKm: car.mileageKm,
        bodyType: car.bodyType,
        transmission: car.transmission,
        fuel: car.fuel,
        engineVolume: car.engineVolume ?? null,
        enginePowerHp: car.enginePowerHp ?? null,
        driveType: car.driveType,
        color: car.color,
        interiorMaterial: car.interiorMaterial,
        interiorColor: car.interiorColor,
        steering: "left",
        seats: 5,
        doors: 4,
        condition: "used",
        ownersCount: car.ownersCount,
        originCountry: car.originCountry,
        customsCleared: true,
        vin: car.vin,
        vinVerified: true,
        originalPaint: true,
        noAccidents: car.slug !== "audi-a6-c8-45-tfsi-2020",
        serviceBook: true,
        isInspected: true,
        expertSummary: car.expertSummary,
        bodyCheckNote: car.bodyCheckNote,
        techCheckNote: car.techCheckNote,
        legalCheckNote: car.legalCheckNote,
        features: JSON.stringify(car.features),
        customSpecs: JSON.stringify(car.customSpecs ?? []),
        description: car.description,
        mainPhoto: car.photos[0],
        photos: JSON.stringify(car.photos),
        city: "Минск",
        contactName: "Виктор",
        contactPhone: "+375 (29) 111-22-33",
        status: car.status,
        isFeatured: car.isFeatured ?? false,
        isActive: true,
        sortOrder: 0,
        seoTitle: `${car.title}, ${car.year} — купить в Минске | АВТОWAY`,
        seoDescription: `${car.title} ${car.year} года в продаже с проверкой АВТОWAY. Пробег ${car.mileageKm.toLocaleString("ru-RU")} км, цена $${car.priceUsd.toLocaleString("ru-RU")}.`,
      },
    });
    console.log(`  Продажа: ${car.title}`);
  }
}
