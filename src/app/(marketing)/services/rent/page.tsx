import RentCatalog from "@/features/rent/ui/rent-catalog";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";

export default function RentPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Аренда" },
        ]}
      />
      <RentCatalog />
    </>
  );
}
