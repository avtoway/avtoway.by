import type { SaleCar } from "@/entities/sell/sale-car.types";
import { SITE_URL } from "@/shared/config/site";
import { BODY_TYPE_LABEL, DRIVE_TYPE_LABEL, FUEL_LABEL, TRANSMISSION_LABEL } from "@/shared/lib/car-dictionaries";

function serialize(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function SaleStructuredData({ car, usdRate }: { car: SaleCar; usdRate: number }) {
  const url = `${SITE_URL}/services/sell/${car.slug}`;
  const priceByn = car.priceByn ?? Math.round(car.priceUsd * usdRate);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.title,
    url,
    description: car.description ?? car.expertSummary,
    image: car.photos.length > 0 ? car.photos.map(photo => `${SITE_URL}${photo}`) : undefined,
    brand: car.brand ? { "@type": "Brand", name: car.brand } : undefined,
    model: car.model ?? undefined,
    vehicleModelDate: String(car.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.mileageKm, unitCode: "KMT" },
    bodyType: BODY_TYPE_LABEL[car.bodyType] ?? car.bodyType,
    fuelType: FUEL_LABEL[car.fuel] ?? car.fuel,
    vehicleTransmission: TRANSMISSION_LABEL[car.transmission] ?? car.transmission,
    driveWheelConfiguration: DRIVE_TYPE_LABEL[car.driveType] ?? car.driveType,
    color: car.color,
    numberOfDoors: car.doors,
    seatingCapacity: car.seats,
    vehicleIdentificationNumber: car.vin,
    itemCondition: car.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url,
      price: priceByn,
      priceCurrency: "BYN",
      availability: car.status === "sold"
        ? "https://schema.org/SoldOut"
        : car.status === "reserved"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "АВТОWAY", url: SITE_URL },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(schema) }}
    />
  );
}
