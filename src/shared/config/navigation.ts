export interface NavItem {
  label: string;
  href: string;
  hasArrow?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Главная", href: "/" },
  { label: "Услуги", href: "", hasArrow: true },
  { label: "О нас", href: "/about" },
  { label: "Партнёры", href: "" },
  { label: "Контакты", href: "" },
];
