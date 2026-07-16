export interface Role {
  id: string;
  name: string;
  description: string | null;
  level: number;
  permissions: string[];
}
