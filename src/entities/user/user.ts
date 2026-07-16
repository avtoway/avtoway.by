export interface User {
  id: string;
  login: string;
  email?: string;
  name: string;
  password: string;
  phone?: string;
  photo?: string;
  position?: string;
  birthDate?: string;
  workSchedule?: string;
  hireDate?: string;
  telegram?: string;
  bio?: string;
  roles: { id: string; name: string }[];
  createdAt: string;
}

export interface UserWithRoles {
  id: string;
  login: string;
  email?: string;
  name: string;
  phone?: string;
  photo?: string;
  position?: string;
  birthDate?: string;
  workSchedule?: string;
  hireDate?: string;
  telegram?: string;
  bio?: string;
  roles: { id: string; name: string }[];
  createdAt: string;
}
