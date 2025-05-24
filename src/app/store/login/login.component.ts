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
  rememberAccount: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const token = localStorage.getItem('tokenUser');
    const tokenExpiryTime = localStorage.getItem('tokenUserExpiryTime');
    const userStr = localStorage.getItem('currentUserUser');

    if (token && tokenExpiryTime && userStr) {
      const expiryTime = new Date(tokenExpiryTime).getTime();
      const currentTime = new Date().getTime();

      if (currentTime < expiryTime) {
        const user = JSON.parse(userStr);
        if (user.role === 'USER') {
          this.authService.startTokenExpiryCountdown();
          this.router.navigate(['/']);
        }
      }
    }
    const savedContact = localStorage.getItem('rememberContact');
    if (savedContact) {
      this.contact = savedContact;
      this.rememberAccount = true;
    }
  }

  onSubmit() {
    if (!this.contact || !this.password) return;

    if (this.rememberAccount) {
      localStorage.setItem('rememberContact', this.contact);
    } else {
      localStorage.removeItem('rememberContact');
    }

    this.authService
      .login({ contact: this.contact, password: this.password })
      .subscribe({
        next: (user) => {
          if (user.role === 'USER') {
            localStorage.setItem('tokenUser', user.token);
            localStorage.setItem('tokenUserExpiryTime', user.tokenExpiryTime);
            localStorage.setItem('currentUserUser', JSON.stringify(user));
            this.authService.startTokenExpiryCountdownUser();
            this.router.navigate(['/']);
          } else {
            this.errorMessage =
              'Bạn không có quyền truy cập. Chỉ người dùng được phép vào trang chủ!';
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Đăng nhập thất bại!';
        },
      });
  }
}
