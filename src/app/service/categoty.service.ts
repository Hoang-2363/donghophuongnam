// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8888/api/categories';

  constructor(private http: HttpClient) {}

  getCategories(token: string): Observable<Category[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Category[]>(this.apiUrl, { headers });
  }

  searchCategories(query: string, token: string): Observable<Category[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<Category[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`, { headers });
  }

  createCategory(formData: FormData, token: string): Observable<Category> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Category>(this.apiUrl, formData, { headers });
  }

  updateCategory(id: number, formData: FormData, token: string): Observable<Category> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<Category>(`${this.apiUrl}/${id}`, formData, { headers });
  }

  deleteCategory(id: number, token: string): Observable<string> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete(`${this.apiUrl}/${id}`, { headers, responseType: 'text' });
  }
}
