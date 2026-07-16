export interface ProfileData {
  id: string;
  login: string;
  email: string | null;
  name: string;
  phone: string | null;
  photo: string | null;
  position: string | null;
  birth_date: string | null;
  work_schedule: string | null;
  hire_date: string | null;
  telegram: string | null;
  bio: string | null;
  roles: { id: string; name: string }[];
}
