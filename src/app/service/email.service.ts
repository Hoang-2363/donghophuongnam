import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = 'http://localhost:8888/api/email';

  constructor(private http: HttpClient) {}

  sendBill(billRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-bill`, billRequest);
  }
}
