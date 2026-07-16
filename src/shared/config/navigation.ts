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
  { type: "dropdown", label: "Услуги", items: [] },
  { type: "link", label: "О нас", href: "/about" },
  { type: "placeholder", label: "Партнёры" },
  { type: "placeholder", label: "Контакты" },
];
