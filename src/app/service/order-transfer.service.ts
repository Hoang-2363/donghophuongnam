import { Injectable } from '@angular/core';
import { Order } from '../model/order.model';
import { CartItem } from '../model/cart-item.model';

@Injectable({ providedIn: 'root' })
export class OrderTransferService {
  private order: Order | null = null;
  private cartItems: CartItem[] = [];
  private totalItems: number = 0;
  private totalAmount: number = 0;

  setOrder(
    order: Order,
    cartItems: CartItem[],
    totalItems: number,
    totalAmount: number
  ) {
    this.order = order;
    this.cartItems = cartItems;
    this.totalItems = totalItems;
    this.totalAmount = totalAmount;
  }

  getOrderData() {
    return {
      order: this.order,
      cartItems: this.cartItems,
      totalItems: this.totalItems,
      totalAmount: this.totalAmount,
    };
  }

  clear() {
    this.order = null;
    this.cartItems = [];
    this.totalItems = 0;
    this.totalAmount = 0;
  }
}
