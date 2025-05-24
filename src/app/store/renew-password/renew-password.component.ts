import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-renew-password',
  standalone: false,
  templateUrl: './renew-password.component.html',
  styleUrl: './renew-password.component.css',
})
export class RenewPasswordComponent {
  email: string | null = null;
  code_otp: string = '';
  password: string = '';
  re_password: string = '';
  showPassword: boolean = false;
  checkPassword: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.email = this.authService.getEmail();
  }

  checkPasswordMatch(): boolean {
    return this.password === this.re_password;
  }

  onSubmit() {
    this.isLoading = true;

    if (!this.email || !this.code_otp || !this.password || !this.re_password) {
      this.isLoading = false;
      return;
    }

    if (!this.checkPasswordMatch()) {
      this.checkPassword = true;
      this.errorMessage = 'Mật khẩu mới và mật khẩu nhập lại không trùng nhau!';
      this.isLoading = false;
      return;
    }

    this.authService
      .resetPassword({
        email: this.email!,
        otp: this.code_otp,
        newPassword: this.password,
        reNewPassword: this.re_password,
      })
      .subscribe({
        next: () => {
          alert('Cập nhật mật khẩu thành công!');
          this.router.navigate(['/admin'], { replaceUrl: true });
        },
        error: (err) => {
          const msg =
            typeof err.error === 'string'
              ? JSON.parse(err.error).message
              : err.error?.message;
          this.errorMessage = msg || 'Lỗi cập nhật mật khẩu thất bại.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
}
