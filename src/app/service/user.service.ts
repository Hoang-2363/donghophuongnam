import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8888/api/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAllUsers(token: string): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: this.getAuthHeaders(token),
    });
  }

  getUserById(id: number, token: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  searchUsers(query: string, token: string): Observable<User[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<User[]>(`${this.apiUrl}/search`, {
      headers: this.getAuthHeaders(token),
      params,
    });
  }

  createUser(formData: FormData, token: string): Observable<User> {
    return this.http.post<User>(this.apiUrl, formData, {
      headers: this.getAuthHeaders(token),
    });
  }

  updateUser(id: number, formData: FormData, token: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, formData, {
      headers: this.getAuthHeaders(token),
    });
  }

  setUserActiveStatus(
    id: number,
    isActive: boolean,
    token: string
  ): Observable<void> {
    const params = new HttpParams().set('isActive', isActive.toString());
    return this.http.put<void>(`${this.apiUrl}/enable/${id}`, null, {
      headers: this.getAuthHeaders(token),
      params,
    });
  }
}
