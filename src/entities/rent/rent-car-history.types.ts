export interface RentCarHistory {
  id: string;
  carId: string;
  type: string;
  description?: string;
  amount?: number;
  date: string;
  createdAt: string;
}
