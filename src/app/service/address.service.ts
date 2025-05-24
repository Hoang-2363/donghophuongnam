import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private baseUrl = 'https://esgoo.net/api-tinhthanh';

  constructor(private http: HttpClient) {}

  getTinh(): Observable<any> {
    return this.http.get(`${this.baseUrl}/1/0.htm`);
  }

  getQuan(idTinh: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/2/${idTinh}.htm`);
  }

  getPhuong(idQuan: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/3/${idQuan}.htm`);
  }
}
