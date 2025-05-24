// src/app/services/brand.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand } from '../model/brand.model';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = 'http://localhost:8888/api/brands';

  constructor(private http: HttpClient) {}

  getBrands(token: string): Observable<Brand[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Brand[]>(this.apiUrl, { headers });
  }

  searchBrands(query: string, token: string): Observable<Brand[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Brand[]>(
      `${this.apiUrl}/search?q=${encodeURIComponent(query)}`,
      { headers }
    );
  }

  createBrand(formData: FormData, token: string): Observable<Brand> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Brand>(this.apiUrl, formData, { headers });
  }

  updateBrand(
    id: number,
    formData: FormData,
    token: string
  ): Observable<Brand> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<Brand>(`${this.apiUrl}/${id}`, formData, { headers });
  }

  deleteBrand(id: number, token: string): Observable<string> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers,
      responseType: 'text',
    });
  }
}
