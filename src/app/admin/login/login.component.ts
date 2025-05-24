import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  contact: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const tokenExpiryTime = localStorage.getItem('tokenExpiryTime');
    const userStr = localStorage.getItem('currentUser');

    if (token && tokenExpiryTime && userStr) {
      const expiryTime = new Date(tokenExpiryTime).getTime();
      const currentTime = new Date().getTime();

      if (currentTime < expiryTime) {
        const user = JSON.parse(userStr);
        if (user.role === 'ADMIN') {
          this.authService.startTokenExpiryCountdown();
          this.router.navigate(['/admin/home']);
        }
      }
    }
  }

  onSubmit() {
    if (!this.contact || !this.password) return;

    this.authService
      .login({ contact: this.contact, password: this.password })
      .subscribe({
        next: (user) => {
          if (user.role === 'ADMIN') {
            localStorage.setItem('token', user.token);
            localStorage.setItem('tokenExpiryTime', user.tokenExpiryTime);
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.authService.startTokenExpiryCountdown();
            this.router.navigate(['/admin/home']);
          } else {
            this.errorMessage =
              'Bạn không có quyền truy cập. Chỉ quản trị viên được phép vào trang chủ!';
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Đăng nhập thất bại!';
        },
      });
  }
}
