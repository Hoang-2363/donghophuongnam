import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../model/product.model';

interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  addToCart(product: Product, quantity: number): boolean {
    // Kiểm tra số lượng tồn kho
    const availableStock = product.stockQuantity ?? 0;
    const existingItem = this.cartItems.find(
      (item) => item.product.id === product.id
    );
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;

    if (newTotalQuantity > availableStock) {
      return false; // Trả về false nếu vượt quá tồn kho
    }

    if (existingItem) {
      // Cộng dồn số lượng nếu sản phẩm đã có trong giỏ
      existingItem.quantity = newTotalQuantity;
    } else {
      // Thêm sản phẩm mới vào giỏ
      this.cartItems.push({ product, quantity });
    }

    this.cartSubject.next([...this.cartItems]);
    return true; // Thêm thành công
  }

  updateQuantity(productId: number, quantity: number): boolean {
    const item = this.cartItems.find((item) => item.product.id === productId);
    if (!item) return false;

    if (quantity <= 0 || quantity > (item.product.stockQuantity ?? 0)) {
      return false;
    }

    item.quantity = quantity;
    this.cartSubject.next([...this.cartItems]);
    return true;
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(
      (item) => item.product.id !== productId
    );
    this.cartSubject.next([...this.cartItems]);
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  clearCart() {
    this.cartItems = [];
    this.cartSubject.next([]);
  }
}
