export interface Service {
  slug: string;
  title: string;
  desc: string;
  href: string;
  color: string;
  iconName: string;
  isActive: boolean;
  sortOrder: number;
  photo?: string;
  content?: string;
}
