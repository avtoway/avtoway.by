export interface Partner {
  id: string;
  name: string;
  photo?: string;
  photos?: string[];
  description?: string;
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
