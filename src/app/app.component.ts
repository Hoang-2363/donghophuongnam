import { Component } from '@angular/core';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const tokenUser = localStorage.getItem('tokenUser');

    if (token && !tokenUser) {
      this.authService.startTokenExpiryCountdown();
    }

    if (tokenUser && !token) {
      this.authService.startTokenExpiryCountdownUser();
    }
  }
}
