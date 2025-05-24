export interface OrderWithPayment {
  orderId: number;
  orderCode: string;
  orderDate: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  transactionId: string;
  totalCost: number;
  items: {
    quantity: number;
    productResponse: {
      id: number;
      name: string;
      productCode: string;
      priceSelling: number;
      imageUrls: string[];
    };
  }[];
}
