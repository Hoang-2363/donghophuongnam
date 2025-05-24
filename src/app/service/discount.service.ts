import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Discount } from '../model/discount.model';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private apiUrl = 'http://localhost:8888/api/discounts';

  constructor(private http: HttpClient) {}

  getDiscountByCode(code: string): Observable<Discount> {
    return this.http.get<Discount>(`${this.apiUrl}/code/${code}`);
  }

  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAllDiscounts(token: string): Observable<Discount[]> {
    return this.http.get<Discount[]>(this.apiUrl, {
      headers: this.getAuthHeaders(token),
    });
  }

  getDiscountById(id: number, token: string): Observable<Discount> {
    return this.http.get<Discount>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  searchDiscounts(query: string, token: string): Observable<Discount[]> {
    return this.http.get<Discount[]>(
      `${this.apiUrl}/search?q=${encodeURIComponent(query)}`,
      {
        headers: this.getAuthHeaders(token),
      }
    );
  }

  createDiscount(body: any, token: string): Observable<Discount> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post<Discount>(this.apiUrl, body, { headers });
  }

  updateDiscount(id: number, body: any, token: string): Observable<Discount> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.put<Discount>(`${this.apiUrl}/${id}`, body, { headers });
  }

  deleteDiscount(id: number, token: string): Observable<string> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers,
      responseType: 'text',
    });
  }

  notifyUsersAboutDiscount(id: number, token: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/notify/${id}`, null, {
      headers: this.getAuthHeaders(token),
    });
  }
}
