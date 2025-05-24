import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../model/order.model';
import { CartItem } from '../model/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:8888/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(
    order: Order,
    cartItems: CartItem[],
    totalAmount: number
  ): Observable<any> {
    const payload = {
      nameUser: order.nameUser,
      emailUser: order.emailUser,
      phoneUser: order.phoneUser,
      imgUrlUser: order.imgUrlUser || '',
      addressUser: order.addressUser || '',
      totalCost: totalAmount,
      userId: order.userId || null,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productCode: item.product.productCode || '',
        nameProduct: item.product.name,
        imageUrlProduct: item.product.imageUrls?.[0] || '',
        quantity: item.quantity,
        unitPrice: item.product.priceSelling,
        totalPrice: item.product.priceSelling * item.quantity,
      })),
    };

    return this.http.post<any>(this.apiUrl, payload);
  }

  getOrdersWithPaymentByUser(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/order-payment-user`, { headers });
  }

  getAllOrders(token: string): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}`, { headers });
  }

  getOrderByCode(orderCode: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/${orderCode}`, { headers });
  }

  updateOrderStatus(order: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/update-status`, order, {
      headers,
    });
  }

  getRevenueStats(token: string, groupBy: string = 'month'): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(
      `${this.apiUrl}/stats/revenue?groupBy=${groupBy}`,
      { headers }
    );
  }

  getRevenueByCustomer(token: string): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/stats/revenue-by-customer`, {
      headers,
    });
  }

  getOrderStatusStats(token: string): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/stats/order-status`, {
      headers,
    });
  }

  getTop10Products(token: string): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/stats/top-products`, {
      headers,
    });
  }

  getOrderCountStats(
    token: string,
    groupBy: string = 'month'
  ): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(
      `${this.apiUrl}/stats/order-count?groupBy=${groupBy}`,
      { headers }
    );
  }

  getTotalProductSold(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/stats/total-product-sold`, {
      headers,
    });
  }
}
