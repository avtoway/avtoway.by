import RentCalculator from "@/features/rent/ui/rent-calculator";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";

export default function RentCalculatorPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Аренда", href: "/services/rent" },
          { label: "Калькулятор" },
        ]}
      />
      <RentCalculator />
    </>
  );
}
