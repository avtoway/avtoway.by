import type { PrismaClient } from "@prisma/client";
import { DEFAULT_TAXI_REQUIREMENTS } from "../src/shared/lib/taxi-requirements";

interface SeedRentCar {
  name: string;
  slug: string;
  brand: string;
  model: string;
  classSlug: string;
  rentType: "rent" | "taxi";
  year: number;
  color: string;
  transmission: string;
  fuel: string;
  engineVolume: string;
  seats: number;
  priceDay?: number;
  price7Days?: number;
  priceDayTaxi?: number;
  photos: string[];
  description: string;
  taxiRequirements?: string;
  features: string[];
  bookedUntil?: string;
  sortOrder: number;
}

const FALLBACK_FEATURES = ["Кондиционер", "ABS", "ESP", "USB", "Bluetooth"];
const CONDITION_VALUES: Record<string, string> = {
  "age-limit": "23 года",
  experience: "3 года",
  deposit: "300 BYN",
  mileage: "300 км/сутки",
  documents: "Паспорт, водительское удостоверение",
};

const DEMO: SeedRentCar[] = [
  {
    name: "Hyundai Solaris",
    slug: "hyundai-solaris-2021",
    brand: "hyundai",
    model: "solaris",
    classSlug: "economy",
    rentType: "rent",
    year: 2021,
    color: "Белый",
    transmission: "auto",
    fuel: "gasoline",
    engineVolume: "1.6",
    seats: 5,
    priceDay: 90,
    photos: ["/uploads/rent/demo-hyundai.jpg", "/uploads/rent/demo-interior-1.jpg", "/uploads/rent/demo-interior-2.jpg"],
    description:
      "Экономичный и манёвренный седан для города и поездок по Беларуси. Автомат, кондиционер, Bluetooth. Идеальный вариант для ежедневной аренды.",
    features: ["Кондиционер", "ABS", "ESP", "USB", "Bluetooth", "Подогрев сидений", "Камера заднего вида", "Круиз-контроль"],
    sortOrder: 1,
  },
  {
    name: "Kia Rio",
    slug: "kia-rio-2022",
    brand: "kia",
    model: "rio",
    classSlug: "economy",
    rentType: "taxi",
    year: 2022,
    color: "Серебристый",
    transmission: "auto",
    fuel: "gasoline",
    engineVolume: "1.6",
    seats: 5,
    price7Days: 650,
    priceDayTaxi: 93,
    photos: ["/uploads/rent/demo-kia.jpg", "/uploads/rent/demo-interior-1.jpg"],
    description:
      "Kia Rio под такси: экономичный двигатель, автомат, подготовлен к ежедневной работе. Аренда от недели, помощь с документами для таксопарка.",
    taxiRequirements: DEFAULT_TAXI_REQUIREMENTS,
    features: ["Кондиционер", "ABS", "ESP", "Bluetooth", "USB", "Подогрев сидений", "Круиз-контроль"],
    sortOrder: 2,
  },
  {
    name: "Volkswagen Passat B8",
    slug: "volkswagen-passat-b8-2020",
    brand: "volkswagen",
    model: "passat",
    classSlug: "comfort",
    rentType: "rent",
    year: 2020,
    color: "Серебристый металлик",
    transmission: "auto",
    fuel: "diesel",
    engineVolume: "2.0",
    seats: 5,
    priceDay: 140,
    bookedUntil: "2026-11-05",
    photos: ["/uploads/rent/demo-passat.jpg", "/uploads/rent/demo-interior-1.jpg", "/uploads/rent/demo-interior-2.jpg"],
    description:
      "Практичный универсал с экономичным дизелем и большим багажником. Отличный выбор для семьи, командировки или поездки на выходные.",
    features: ["Климат-контроль", "ABS", "ESP", "Круиз-контроль", "Подогрев сидений", "Парктроники", "Bluetooth", "Навигация"],
    sortOrder: 3,
  },
  {
    name: "BMW 5 серия G30 530i",
    slug: "bmw-5-g30-530i-2020",
    brand: "bmw",
    model: "5-series",
    classSlug: "business",
    rentType: "rent",
    year: 2020,
    color: "Чёрный металлик",
    transmission: "auto",
    fuel: "gasoline",
    engineVolume: "2.0",
    seats: 5,
    priceDay: 220,
    photos: ["/uploads/rent/demo-bmw.jpg", "/uploads/rent/demo-interior-1.jpg", "/uploads/rent/demo-interior-2.jpg"],
    description:
      "Бизнес-седан для встреч, свадеб и деловых поездок. Полный привод, кожаный салон, панорамная крыша и полный пакет ассистентов.",
    features: ["Климат-контроль", "Кожаный салон", "Панорамная крыша", "Подогрев сидений", "Камера 360°", "Адаптивный круиз-контроль", "Apple CarPlay", "Премиум-аудио"],
    sortOrder: 4,
  },
  {
    name: "Mercedes-Benz E 200",
    slug: "mercedes-e200-2021",
    brand: "mercedes-benz",
    model: "e-class",
    classSlug: "business",
    rentType: "rent",
    year: 2021,
    color: "Чёрный",
    transmission: "auto",
    fuel: "gasoline",
    engineVolume: "2.0",
    seats: 5,
    priceDay: 240,
    photos: ["/uploads/rent/demo-mercedes.jpg", "/uploads/rent/demo-interior-2.jpg", "/uploads/rent/demo-interior-1.jpg"],
    description:
      "Представительский Mercedes-Benz E-Class с комфортным салоном и плавным ходом. Подходит для деловых поездок, трансферов и особых событий.",
    features: ["Климат-контроль", "Кожаный салон", "Подогрев сидений", "Вентиляция сидений", "Камера заднего вида", "Навигация", "Премиум-аудио", "Электропривод багажника"],
    sortOrder: 5,
  },
  {
    name: "Volkswagen Touran",
    slug: "volkswagen-touran-2019",
    brand: "volkswagen",
    model: "touran",
    classSlug: "minivan",
    rentType: "rent",
    year: 2019,
    color: "Тёмно-серый",
    transmission: "auto",
    fuel: "diesel",
    engineVolume: "2.0",
    seats: 7,
    priceDay: 130,
    photos: ["/uploads/rent/demo-touran.jpg", "/uploads/rent/demo-interior-2.jpg", "/uploads/rent/demo-interior-1.jpg"],
    description:
      "Семиместный минивэн для большой семьи или группы. Три ряда сидений, большой багажник, экономичный дизель и комфорт на дальних расстояниях.",
    features: ["Климат-контроль", "7 мест", "ABS", "ESP", "Парктроники", "Bluetooth", "Круиз-контроль", "Подогрев сидений"],
    sortOrder: 6,
  },
];

export async function seedRentCars(prisma: PrismaClient) {
  const rentTypes = await prisma.rentType.findMany();
  const classes = await prisma.carClass.findMany();
  const conditions = await prisma.rentCondition.findMany();

  for (const car of DEMO) {
    const existing = await prisma.rentCar.findUnique({ where: { slug: car.slug } });
    if (existing) {
      const existingType = rentTypes.find(item => item.id === existing.rentTypeId);
      if (existingType?.slug === "taxi" && !existing.taxiRequirements) {
        await prisma.rentCar.update({
          where: { id: existing.id },
          data: { taxiRequirements: DEFAULT_TAXI_REQUIREMENTS },
        });
      }
      continue;
    }

    const brand = await prisma.carBrand.findUnique({ where: { slug: car.brand } });
    const model = brand
      ? await prisma.carModel.findFirst({ where: { brandId: brand.id, slug: car.model } })
      : null;
    const carClass = classes.find(item => item.slug === car.classSlug);
    const rentType = rentTypes.find(item => item.slug === car.rentType);

    await prisma.rentCar.create({
      data: {
        name: car.name,
        slug: car.slug,
        brandId: brand?.id ?? null,
        modelId: model?.id ?? null,
        classId: carClass?.id ?? null,
        year: car.year,
        color: car.color,
        transmission: car.transmission,
        fuel: car.fuel,
        engineVolume: car.engineVolume,
        seats: car.seats,
        features: (car.features.length > 0 ? car.features : FALLBACK_FEATURES).join(","),
        photos: car.photos.join(","),
        mainPhoto: car.photos[0],
        description: car.description,
        taxiRequirements: car.taxiRequirements ?? null,
        priceDay: car.priceDay ?? null,
        price7Days: car.price7Days ?? null,
        priceDayTaxi: car.priceDayTaxi ?? null,
        rentTypeId: rentType?.id ?? null,
        isActive: true,
        bookedUntil: car.bookedUntil ?? null,
        sortOrder: car.sortOrder,
        conditions: {
          create: conditions
            .filter(condition => CONDITION_VALUES[condition.slug])
            .map(condition => ({ conditionId: condition.id, value: CONDITION_VALUES[condition.slug] ?? "" })),
        },
      },
    });
    console.log(`  Аренда: ${car.name}`);
  }
}
