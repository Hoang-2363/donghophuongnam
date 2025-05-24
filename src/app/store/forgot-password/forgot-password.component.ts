import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.isLoading = true;
    this.authService.generateOtp(this.email, 'user').subscribe({
      next: () => {
        this.authService.setEmail(this.email, 'user');
        alert('Gửi mã về Email thành công!');
        this.router.navigate(['/renew-password'], { replaceUrl: true });
      },
      error: (err) => {
        const msg =
          typeof err.error === 'string'
            ? JSON.parse(err.error).message
            : err.error?.message;
        this.errorMessage = msg || 'Gửi mã về email thất bại.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
