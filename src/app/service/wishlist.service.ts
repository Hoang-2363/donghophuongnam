import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlistItems: Product[] = [];
  private wishlistSubject = new BehaviorSubject<Product[]>([]);

  wishlist$ = this.wishlistSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  addToWishlist(product: Product) {
    if (!this.wishlistItems.find((p) => p.id === product.id)) {
      this.wishlistItems.push(product);
      this.wishlistSubject.next(this.wishlistItems);
      return true;
    }
    return false;
  }

  removeFromWishlist(productId: number) {
    this.wishlistItems = this.wishlistItems.filter((p) => p.id !== productId);
    this.wishlistSubject.next(this.wishlistItems);
  }

  clearWishlist() {
    this.wishlistItems = [];
    this.wishlistSubject.next(this.wishlistItems);
  }

  // getWishlist(token: string): Observable<WishlistResponse[]> {
  //   return this.http.get<WishlistResponse[]>(this.apiUrl, {
  //     headers: this.getAuthHeaders(token),
  //   });
  // }

  // addToWishlisAdmint(
  //   request: WishlistRequest,
  //   token: string
  // ): Observable<WishlistResponse> {
  //   return this.http.post<WishlistResponse>(this.apiUrl, request, {
  //     headers: this.getAuthHeaders(token),
  //   });
  // }

  // removeFromWishlistAdmin(productId: number, token: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${productId}`, {
  //     headers: this.getAuthHeaders(token),
  //   });
  // }
}
