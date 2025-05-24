import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { DiscountService } from '../../service/discount.service';
import { Order } from '../../model/order.model';
import { OrderService } from '../../service/order.service';
import { OrderGet } from '../../model/order-get.model';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
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
  errorMessage = '';

  searchContent: string = '';

  dropdownOpen = false;
  options: { id: number; name: string }[] = [];
  selectedMap: { [key: number]: boolean } = {};
  selectedOptions: string[] = [];
  predefinedIds: number[] = [];

  // Get
  removedImageUrls: string[] = [];

  selectedOrder: any = {};
  files: File[] = [];
  imageUrls: string[] = [];
  existingImageUrls: string[] = [];
  newImagePreviews: string[] = [];
  totalImagesCount: number = 0;

  orders: OrderGet[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) {
    this.updateScreenWidth();
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/admin']);
    } else {
      const url = this.router.url;
      if (url.startsWith('/admin/orders')) {
        this.isDropdownOpen = true;
      }
      this.fetchOrders();
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

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.dropdownOpen = false;
    }
  }

  // Phân trang
  itemsPerPage = 8; // Số sản phẩm mỗi trang
  currentPage = 1; // Trang hiện tại
  maxVisiblePages = 3; // Số trang tối đa hiển thị

  get totalPages(): number {
    return Math.ceil(this.orders.length / this.itemsPerPage);
  }
  get paginatedOrders() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.orders.slice(start, end);
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
    return Math.min(this.currentPage * this.itemsPerPage, this.orders.length);
  }
  get totalItems(): number {
    return this.orders.length;
  }

  // Get
  fetchOrders(): void {
    const token = localStorage.getItem('token') || '';

    this.orderService.getAllOrders(token).subscribe({
      next: (orders) => {
        this.orders = orders; // đảm bảo bạn đã khai báo this.orders: any[] = [];
      },
      error: (error) => {
        this.errorMessage =
          'Không thể tải danh sách đơn hàng. Vui lòng thử lại!';
      },
    });
  }

  searchOrders(): void {
    if (!this.searchContent.trim()) {
      this.fetchOrders(); // Gọi lại danh sách tất cả đơn hàng
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.orderService.getAllOrders(token).subscribe({
      next: (orders) => {
        const keyword = this.searchContent.trim().toLowerCase();
        this.orders = orders.filter(
          (order) =>
            order.orderCode?.toLowerCase().includes(keyword) ||
            order.nameUser?.toLowerCase().includes(keyword) ||
            order.phoneUser?.toLowerCase().includes(keyword)
        );

        this.errorMessage =
          this.orders.length === 0 ? 'Không tìm thấy đơn hàng nào!' : '';
      },
      error: (error) => {
        this.errorMessage = 'Không thể tìm kiếm đơn hàng. Vui lòng thử lại!';
      },
    });
  }

  clearSearch(): void {
    this.searchContent = '';
    this.errorMessage = '';
    this.fetchOrders();
  }

  viewDetails(orderCode: string): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.orderService.getOrderByCode(orderCode, token).subscribe({
      next: (order) => {
        this.selectedOrder = order;
        this.isModalOpen = true;
      },
      error: (error) => {
        this.errorMessage = 'Không thể lấy thông tin đơn hàng!';
      },
    });
  }

  editOrderStatus(id: number): void {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return;

    this.selectedOrder = { ...order };
    this.isModalUpdate = true;
  }

  updateOrderStatus(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    const body = {
      status: this.selectedOrder.status,
      orderCode: this.selectedOrder.orderCode,
    };

    this.orderService.updateOrderStatus(body, token).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(
          (o) => o.orderCode === updatedOrder.orderCode
        );
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.orders = [...this.orders]; // trigger UI update
        }
        this.successMessage = 'Cập nhật trạng thái đơn hàng thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Cập nhật trạng thái thất bại. Vui lòng thử lại!';
      },
    });
  }

  handleImageError(index: number): void {
    this.imageUrls[index] = 'logo_watch.png';
  }
  private updateTotalImagesCount(): void {
    this.totalImagesCount =
      this.existingImageUrls.length + this.newImagePreviews.length;
  }
  removeImage(index: number): void {
    const totalOldImages = this.existingImageUrls.length;

    if (index < totalOldImages) {
      const removedUrl = this.existingImageUrls[index];
      this.removedImageUrls.push(removedUrl);
      this.existingImageUrls.splice(index, 1);
      this.selectedOrder.imageUrls = [...this.existingImageUrls];
    } else {
      const newIndex = index - totalOldImages;
      if (newIndex >= 0 && newIndex < this.newImagePreviews.length) {
        this.newImagePreviews.splice(newIndex, 1);
        this.files.splice(newIndex, 1);
      }
    }

    this.imageUrls = [...this.existingImageUrls, ...this.newImagePreviews];
    this.updateTotalImagesCount();
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
    this.selectedOrder = null;
    this.errorMessage = '';
    this.predefinedIds = [];
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
