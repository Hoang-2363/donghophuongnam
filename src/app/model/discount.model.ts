export interface Discount {
  id: number;
  code: string;
  description: string;
  percentAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
