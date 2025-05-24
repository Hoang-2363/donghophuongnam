import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { Brand } from '../model/brand.model';
import { Category } from '../model/category.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8888/api/products';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAllProducts(
    sortBy?: string,
    minPrice?: number,
    maxPrice?: number,
    categoryId?: number,
    brandId?: number
  ): Observable<Product[]> {
    let params = new HttpParams();
    if (sortBy) params = params.set('sortBy', sortBy);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice);
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (brandId) params = params.set('brandId', brandId);

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}/search?q=${encodeURIComponent(query)}`
    );
  }

  createProduct(formData: FormData, token: string): Observable<Product> {
    const headers = this.getAuthHeaders(token);
    return this.http.post<Product>(this.apiUrl, formData, { headers });
  }

  updateProduct(
    id: number,
    formData: FormData,
    token: string
  ): Observable<Product> {
    const headers = this.getAuthHeaders(token);
    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData, {
      headers,
    });
  }

  deleteProduct(id: number, token: string): Observable<void> {
    const headers = this.getAuthHeaders(token);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  getAllBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands`);
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  filterProducts(filterPayload: any): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.apiUrl}/filter`, filterPayload);
  }
}
