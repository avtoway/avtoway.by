type NavLink = {
  type: "link";
  label: string;
  href: string;
};

type NavDropdown = {
  type: "dropdown";
  label: string;
  items: NavLink[];
};

type NavPlaceholder = {
  type: "placeholder";
  label: string;
};

export type NavItem = NavLink | NavDropdown | NavPlaceholder;

export const NAV_ITEMS: NavItem[] = [
  { type: "link", label: "Главная", href: "/" },
  { type: "link", label: "Услуги", href: "/services" },
  { type: "link", label: "О нас", href: "/about" },
  { type: "link", label: "Партнёры", href: "/partners" },
  { type: "link", label: "Контакты", href: "/contacts" },
];
