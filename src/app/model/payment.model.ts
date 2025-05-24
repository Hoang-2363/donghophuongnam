export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: string;
  paymentDate: string | null;
  transactionId: string | null;
  status: string;
}
