import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu không khớp';
      return;
    }

    const user = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
    };

    this.authService.register(user).subscribe({
      next: (res) => {
        alert('Tạo tài khoản thành công! Vui lòng đăng nhập để vào mua hàng!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Đăng ký thất bại';
      },
    });
  }
}
