import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ChartData, ChartOptions } from 'chart.js';
import { OrderService } from '../../service/order.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  groupBy: string = 'month';
  barChartLabels: string[] = [];
  barChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Tổng doanh thu',
        backgroundColor: '#4CAF50',
      },
    ],
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      x: {},
      y: {
        beginAtZero: true,
      },
    },
  };

  isSidebarOpen = false;
  isDropdownOpen = false;
  isDropdownOpen1 = false;
  isDropdownOpen2 = false;
  isSidebarCollapsed = false;
  isMobile = false;
  isNotificationOpen = false;
  isAvatarMenuOpen = false;
  token: any = null;
  isLoggedIn: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private orderService: OrderService
  ) {
    this.updateScreenWidth();
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiryTime');
    const userStr = localStorage.getItem('currentUser');

    const now = new Date().getTime();
    const expiryTime = expiry ? new Date(expiry).getTime() : 0;

    if (!token || !expiry || !userStr || now >= expiryTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiryTime');
      localStorage.removeItem('currentUser');

      this.router.navigate(['/admin'], { replaceUrl: true });

      history.pushState(null, '', location.href);
      window.onpopstate = () => {
        history.pushState(null, '', location.href);
      };
    } else {
      this.isLoggedIn = true;
      this.fetchRevenueStats();
    }
  }

  fetchRevenueStats(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.orderService.getRevenueStats(token, this.groupBy).subscribe({
      next: (data) => {
        this.barChartData = {
          labels: data.map((item) => item.timeGroup),
          datasets: [
            {
              data: data.map((item) => item.totalAmount),
              label: 'Tổng doanh thu',
              backgroundColor: '#4CAF50',
            },
          ],
        };
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu thống kê doanh thu:', err);
      },
    });
  }

  fetchRevenueByCustomer(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.orderService.getRevenueByCustomer(token).subscribe({
      next: (data) => {
        this.barChartData = {
          labels: data.map((item) => item.name || item.email),
          datasets: [
            {
              data: data.map((item) => item.totalAmount),
              label: 'Doanh thu theo khách hàng',
              backgroundColor: '#42A5F5',
            },
          ],
        };
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu doanh thu theo khách hàng:', err);
      },
    });
  }

  onGroupByChange(): void {
    if (this.groupBy === 'customer') {
      this.fetchRevenueByCustomer();
    } else {
      this.fetchRevenueStats();
    }
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    this.updateScreenWidth();
  }

  updateScreenWidth() {
    this.isMobile = window.innerWidth < 640;
    if (this.isMobile) {
      this.isSidebarCollapsed = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDropdown1() {
    this.isDropdownOpen1 = !this.isDropdownOpen1;
  }

  toggleDropdown2() {
    this.isDropdownOpen2 = !this.isDropdownOpen2;
  }

  toggleSidebarCollapse() {
    if (!this.isMobile) {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  toggleNotification() {
    this.isNotificationOpen = !this.isNotificationOpen;
    if (this.isNotificationOpen) {
      this.isAvatarMenuOpen = false;
    }
  }

  toggleAvatarMenu() {
    this.isAvatarMenuOpen = !this.isAvatarMenuOpen;
    if (this.isAvatarMenuOpen) {
      this.isNotificationOpen = false;
    }
  }

  goToAccountInfo() {
    this.isAvatarMenuOpen = false;
    this.router.navigate(['/admin/account']);
  }

  logout() {
    this.isAvatarMenuOpen = false;
    const token = localStorage.getItem('token');

    if (token) {
      this.authService.logout(token).subscribe({
        next: () => {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('tokenExpiryTime');
          localStorage.removeItem('token');
          this.isLoggedIn = false;
          this.router.navigate(['/admin']);
        },
        error: (error) => {
          const message =
            error?.error?.message || error?.message || 'Đăng xuất thất bại!';
          alert(message);
        },
      });
    }
  }
}
