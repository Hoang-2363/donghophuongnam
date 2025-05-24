import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:8888/api/check-payment';

  constructor(private http: HttpClient) {}

  private createHeaders(token?: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
  }

  getAllPayments(token: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.createHeaders(token),
    });
  }

  getPaymentById(id: number, token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.createHeaders(token),
    });
  }

  updatePaymentStatus(
    id: number,
    paymentRequest: any,
    token: string
  ): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/status/${id}`, paymentRequest, {
      headers: this.createHeaders(token),
    });
  }

  checkOnlinePayment(orderCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/online/${orderCode}`);
  }

  createPaymentCOD(orderCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cod/${orderCode}`);
  }
}
