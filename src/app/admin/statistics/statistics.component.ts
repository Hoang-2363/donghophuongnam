import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ChartOptions, ChartData } from 'chart.js';
import { OrderService } from '../../service/order.service';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent implements OnInit {
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

  lineChartLabels: string[] = [];
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Số lượng đơn hàng',
        borderColor: '#3f51b5',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  lineChartOptions: ChartOptions<'line'> = {
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
        title: {
          display: true,
          text: 'Số lượng',
        },
      },
    },
  };

  topProductChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Số lượng đã bán',
        backgroundColor: '#FF9800',
      },
    ],
  };
  topProductChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y', // ➤ Thanh ngang
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
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng bán',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Sản phẩm',
        },
      },
    },
  };

  orderCountChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#42A5F5',
          '#66BB6A',
          '#FFA726',
          '#AB47BC',
          '#FF7043',
        ],
      },
    ],
  };

  orderCountChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const data = tooltipItem.chart.data;
            const label = data.labels?.[tooltipItem.dataIndex!] || '';
            const value = data.datasets[0].data[tooltipItem.dataIndex!] || 0;
            return `${label}: ${value} đơn hàng`;
          },
        },
      },
    },
  };

  totalProductChartData: ChartData<'bar'> = {
    labels: ['Sản phẩm'],
    datasets: [
      {
        data: [], // sẽ gán sau
        label: '',
        backgroundColor: '',
      },
    ],
  };

  totalProductChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 14 },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Loại',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng',
        },
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

  // Event CRUD
  isModalOpen = false;
  isModalUpdate = false;
  isSuccessMessageVisible = false;
  isModalDelete = false;
  isModalCreate = false;
  successMessage = '';

  searchContent: string = '';

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
    if (!token) {
      this.router.navigate(['/admin']);
    } else {
      this.fetchRevenueStats();
      this.fetchRevenueByCustomer();
      this.fetchOrderStatusStats();
      this.fetchTopProducts();
      this.fetchOrderCountStats();
      this.fetchTotalProductStats();
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

  fetchOrderStatusStats(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.orderService.getOrderStatusStats(token).subscribe({
      next: (data) => {
        this.lineChartData = {
          labels: data.map((item) => item.status),
          datasets: [
            {
              data: data.map((item) => item.count),
              label: 'Số lượng đơn hàng',
              borderColor: '#3f51b5',
              fill: false,
              tension: 0.3,
            },
          ],
        };
      },
      error: (err) => {
        console.error('Lỗi khi lấy thống kê trạng thái đơn hàng:', err);
      },
    });
  }

  fetchTopProducts(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.orderService.getTop10Products(token).subscribe({
      next: (data) => {
        const top10 = data
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 10); // chỉ lấy top 10

        this.topProductChartData = {
          labels: top10.map(
            (item) => `${item.productName} (${item.productCode})`
          ),
          datasets: [
            {
              data: top10.map((item) => item.totalSold),
              label: 'Số lượng đã bán',
              backgroundColor: '#FF9800',
            },
          ],
        };
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu top sản phẩm:', err);
      },
    });
  }

  fetchOrderCountStats(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.orderService.getOrderCountStats(token, this.groupBy).subscribe({
      next: (data) => {
        this.orderCountChartData = {
          labels: data.map((item) => item.timeGroup),
          datasets: [
            {
              data: data.map((item) => item.count),
              backgroundColor: [
                '#42A5F5',
                '#66BB6A',
                '#FFA726',
                '#AB47BC',
                '#FF7043',
              ],
            },
          ],
        };
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu biểu đồ tròn đơn hàng:', err);
      },
    });
  }

  fetchTotalProductStats(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.orderService.getTotalProductSold(token).subscribe({
      next: (data) => {
        this.totalProductChartData = {
          labels: ['Sản phẩm'],
          datasets: [
            {
              data: [data.totalSold],
              label: 'Đã bán',
              backgroundColor: '#4CAF50',
            },
            {
              data: [data.totalQuantity],
              label: 'Tồn kho',
              backgroundColor: '#FF9800',
            },
          ],
        };
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu sản phẩm:', err);
      },
    });
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
          this.authService.forceLogout();
        },
        error: (error) => {
          const message =
            error?.error?.message || error?.message || 'Đăng xuất thất bại!';
          alert(message);
        },
      });
    }
  }

  // Hàm hiển thị thông báo thành công
  showSuccessMessage() {
    this.isSuccessMessageVisible = true;
    setTimeout(() => {
      this.isSuccessMessageVisible = false;
    }, 3000);
  }
}
