export interface OrderGet {
  id: number;
  orderCode: string;
  orderDate: string; // hoặc Date nếu bạn sẽ parse
  status: string;
  totalAmount: number;
  totalItems: number;

  orderUserResponse: {
    emailUser: string;
    phoneUser: string;
    addressUser: string;
    nameUser: string;
  };

  items: {
    productResponse: {
      id: number;
      productCode: string;
      name: string;
      priceSelling: number;
      imageUrls: string[];
    };
    quantity: number;
  }[];
}
