import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private expiryTimer: any;
  private expiryTimerUser: any;
  private email: string | null = null;
  private role: 'user' | 'admin' = 'user';

  setEmail(email: string, role: 'user' | 'admin') {
    this.email = email;
    this.role = role;
  }

  getEmail(): string | null {
    return this.email;
  }

  getRole(): 'user' | 'admin' {
    return this.role;
  }

  clearEmail(): void {
    this.email = null;
  }

  private apiUrl = 'http://localhost:8888/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { contact: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  generateOtp(email: string, role: 'user' | 'admin'): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/forgot-password`,
      { email, role },
      { responseType: 'text' as 'json' }
    );
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data, {
      responseType: 'text',
    });
  }

  logout(token: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'text',
      }
    );
  }

  register(user: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  startTokenExpiryCountdown(): void {
    const tokenExpiryTime = localStorage.getItem('tokenExpiryTime');
    const token = localStorage.getItem('token');

    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
    }

    if (token && tokenExpiryTime) {
      const expiryTime = new Date(tokenExpiryTime).getTime();
      const currentTime = new Date().getTime();
      const timeLeft = expiryTime - currentTime;

      if (timeLeft <= 0) {
        this.logout(token).subscribe({
          next: () => this.clearSessionAndRedirect(),
          error: () => this.clearSessionAndRedirect(),
        });
      } else {
        this.expiryTimer = setTimeout(() => {
          this.logout(token!).subscribe({
            next: () => this.clearSessionAndRedirect(),
            error: () => this.clearSessionAndRedirect(),
          });
        }, timeLeft);
      }
    }
  }

  clearSessionAndRedirect(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiryTime');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/admin']);
  }

  startTokenExpiryCountdownUser(): void {
    const tokenUserExpiryTime = localStorage.getItem('tokenUserExpiryTime');
    const token = localStorage.getItem('tokenUser');

    if (this.expiryTimerUser) {
      clearTimeout(this.expiryTimerUser);
    }

    if (token && tokenUserExpiryTime) {
      const expiryTime = new Date(tokenUserExpiryTime).getTime();
      const currentTime = new Date().getTime();
      const timeLeft = expiryTime - currentTime;

      if (timeLeft <= 0) {
        this.logout(token).subscribe({
          next: () => this.clearSessionAndRedirectUser(),
          error: () => this.clearSessionAndRedirectUser(),
        });
      } else {
        this.expiryTimerUser = setTimeout(() => {
          this.logout(token!).subscribe({
            next: () => this.clearSessionAndRedirectUser(),
            error: () => this.clearSessionAndRedirectUser(),
          });
        }, timeLeft);
      }
    }
  }

  clearSessionAndRedirectUser(): void {
    localStorage.removeItem('tokenUser');
    localStorage.removeItem('tokenUserExpiryTime');
    localStorage.removeItem('currentUserUser');
    this.router.navigate(['/login']);
  }

  forceLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/admin']);
  }

  updateUser(formData: FormData, token: string): Observable<User> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<User>(`${this.apiUrl}/update-account`, formData, {
      headers,
    });
  }
}
