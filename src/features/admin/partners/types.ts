export interface Partner {
  id: string;
  slug?: string;
  name: string;
  photo?: string;
  photos?: string[];
  shortDescription?: string;
  description?: string;
  services?: string;
  advantages?: string;
  workingHours?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  website?: string;
  instagram?: string;
  telegram?: string;
  vk?: string;
  youtube?: string;
  isActive: boolean;
  sortOrder: number;
}
