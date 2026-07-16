import type { UserWithRoles } from "./user";

export interface CreateUserInput {
  login: string;
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  position?: string;
  birthDate?: string;
  workSchedule?: string;
  hireDate?: string;
  telegram?: string;
  bio?: string;
}

export interface UpdateUserInput {
  login?: string;
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  position?: string;
  birthDate?: string;
  workSchedule?: string;
  hireDate?: string;
  telegram?: string;
  bio?: string;
  newPassword?: string;
  oldPassword?: string;
}

export interface UserRepository {
  getAll(): Promise<UserWithRoles[]>;
  getById(id: string): Promise<UserWithRoles | null>;
  getByLogin(login: string): Promise<{ id: string; login: string; name: string; photo: string | null; password: string } | null>;
  create(data: CreateUserInput & { id: string; hashedPassword: string }): Promise<void>;
  update(id: string, data: UpdateUserInput, hashedPassword?: string): Promise<void>;
  delete(id: string): Promise<void>;
  assignRoles(userId: string, roleIds: string[]): Promise<void>;
  updateProfile(id: string, data: Record<string, unknown>): Promise<void>;
}
