import { describe, expect, it } from "vitest";
import { saleCarCreateSchema, saleRequestSchema } from "./sale-car.schema";

const validCar = {
  title: "BMW 5 series",
  slug: "bmw-5-series",
  priceUsd: 25000,
  year: 2020,
  mileageKm: 84000,
  bodyType: "sedan",
  transmission: "auto",
  fuel: "gasoline",
  driveType: "awd",
  photos: ["/uploads/sell/a.jpg"],
  features: ["ABS"],
};

describe("saleCarCreateSchema", () => {
  it("accepts a valid car", () => {
    expect(saleCarCreateSchema.safeParse(validCar).success).toBe(true);
  });

  it("rejects a car without price", () => {
    expect(saleCarCreateSchema.safeParse({ ...validCar, priceUsd: undefined }).success).toBe(false);
  });

  it("rejects more than 40 photos", () => {
    const photos = Array.from({ length: 41 }, (_, index) => `/uploads/sell/${index}.jpg`);
    expect(saleCarCreateSchema.safeParse({ ...validCar, photos }).success).toBe(false);
  });

  it("rejects an invalid slug", () => {
    expect(saleCarCreateSchema.safeParse({ ...validCar, slug: "BMW 5" }).success).toBe(false);
  });
});

describe("saleRequestSchema", () => {
  it("accepts a sell-own request", () => {
    expect(saleRequestSchema.safeParse({
      type: "sell_own",
      clientName: "Иван",
      clientPhone: "+375291234567",
      carInfo: "Volkswagen Passat 2018",
    }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(saleRequestSchema.safeParse({
      type: "buy",
      clientName: "",
      clientPhone: "+375291234567",
    }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(saleRequestSchema.safeParse({
      type: "buy",
      clientName: "Иван",
      clientPhone: "+375291234567",
      company: "bot",
    }).success).toBe(false);
  });
});
