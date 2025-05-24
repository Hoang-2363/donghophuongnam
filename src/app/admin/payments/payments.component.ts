import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { BrandService } from '../../service/brand.service';
import { Payment } from '../../model/payment.model';
import { PaymentService } from '../../service/payment.service';

@Component({
  selector: 'app-payments',
  standalone: false,
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
})
export class PaymentsComponent {
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

  errorMessage = '';
  selectedPayment: any = {};

  payments: Payment[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {
    this.updateScreenWidth();
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/admin']);
    } else {
      this.fetchPayments();
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

  // Event
  // Phân trang
  itemsPerPage = 8; // Số sản phẩm mỗi trang
  currentPage = 1; // Trang hiện tại
  maxVisiblePages = 3; // Số trang tối đa hiển thị

  get totalPages(): number {
    return Math.ceil(this.payments.length / this.itemsPerPage);
  }
  get paginatedPayments() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.payments.slice(start, end);
  }
  get pageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const half = Math.floor(this.maxVisiblePages / 2);
    let startPage = Math.max(1, this.currentPage - half);
    let endPage = Math.min(
      this.totalPages,
      startPage + this.maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < this.maxVisiblePages) {
      startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) pages.push('...');
      pages.push(this.totalPages);
    }

    return pages;
  }
  get showingStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  get showingEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.payments.length);
  }
  get totalItems(): number {
    return this.payments.length;
  }

  // Hàm hiển thị thông báo thành công
  showSuccessMessage() {
    this.isSuccessMessageVisible = true;
    setTimeout(() => {
      this.isSuccessMessageVisible = false;
    }, 3000);
  }

  // Đóng modal
  closeModal() {
    this.isModalOpen = false;
    this.isModalCreate = false;
    this.isModalUpdate = false;
    this.isModalDelete = false;
    this.selectedPayment = null;
    this.errorMessage = '';
  }

  fetchPayments(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.paymentService.getAllPayments(token).subscribe({
        next: (payments) => {
          this.payments = payments;
        },
        error: (error) => {
          this.errorMessage =
            'Không thể tải danh sách hóa đơn. Vui lòng thử lại!';
        },
      });
    } else {
      this.errorMessage = 'Bạn chưa đăng nhập.';
    }
  }

  viewDetails(id: number) {
    this.selectedPayment =
      this.payments.find((brand) => brand.id === id) || null;
    this.isModalOpen = true;
  }

  editPaymentStatus(id: number): void {
    const payment = this.payments.find((p) => p.id === id);
    if (!payment) return;

    this.selectedPayment = { ...payment };
    this.isModalUpdate = true;
  }

  updatePaymentStatus(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    if (!this.selectedPayment) {
      this.errorMessage = 'Không tìm thấy thông tin thanh toán.';
      return;
    }

    const body = {
      status: this.selectedPayment.status,
    };

    this.paymentService
      .updatePaymentStatus(this.selectedPayment.id, body, token)
      .subscribe({
        next: (updatedPayment) => {
          const index = this.payments.findIndex(
            (p) => p.id === updatedPayment.id
          );
          if (index !== -1) {
            this.payments[index] = updatedPayment;
            this.payments = [...this.payments];
          }
          this.successMessage = 'Cập nhật trạng thái thanh toán thành công!';
          this.showSuccessMessage?.(); // gọi method nếu có
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Cập nhật thanh toán thất bại. Vui lòng thử lại!';
        },
      });
  }

  // Hàm phân trang
  goToFirstPage() {
    this.currentPage = 1;
  }
  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
  goToLastPage() {
    this.currentPage = this.totalPages;
  }
  goToPage(page: number | string) {
    if (typeof page === 'number') this.currentPage = page;
  }
}
