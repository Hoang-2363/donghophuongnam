import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../model/category.model';
import { AuthService } from '../../service/auth.service';
import { ProductService } from '../../service/product.service';
import { Discount } from '../../model/discount.model';
import { DiscountService } from '../../service/discount.service';

@Component({
  selector: 'app-discounts',
  standalone: false,
  templateUrl: './discounts.component.html',
  styleUrl: './discounts.component.css',
})
export class DiscountsComponent {
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
  discount: Discount[] = [];
  removedImageUrls: string[] = [];

  newDiscount: Discount = {
    id: 0,
    code: '',
    description: '',
    percentAmount: 0,
    startDate: '',
    endDate: '',
    isActive: true,
  };

  selectedDiscount: any = {};
  files: File[] = [];
  imageUrls: string[] = [];
  existingImageUrls: string[] = [];
  newImagePreviews: string[] = [];
  totalImagesCount: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private discountService: DiscountService,
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
      if (url.startsWith('/admin/discounts')) {
        this.isDropdownOpen = true;
      }
      this.fetchDiscounts();
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
  itemsPerPage = 5; // Số sản phẩm mỗi trang
  currentPage = 1; // Trang hiện tại
  maxVisiblePages = 3; // Số trang tối đa hiển thị

  get totalPages(): number {
    return Math.ceil(this.discount.length / this.itemsPerPage);
  }
  get paginatedDiscounts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.discount.slice(start, end);
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
    return Math.min(this.currentPage * this.itemsPerPage, this.discount.length);
  }
  get totalItems(): number {
    return this.discount.length;
  }

  // Get
  fetchDiscounts(): void {
    const token = localStorage.getItem('token') || '';

    this.discountService.getAllDiscounts(token).subscribe({
      next: (discounts) => {
        this.discount = discounts;
      },
      error: (error) => {
        this.errorMessage =
          'Không thể tải danh sách khuyến mãi. Vui lòng thử lại!';
      },
    });
  }

  // Search Discounts
  searchDiscounts(): void {
    if (!this.searchContent.trim()) {
      this.fetchDiscounts();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.discountService
      .searchDiscounts(this.searchContent.trim(), token)
      .subscribe({
        next: (discounts) => {
          this.discount = discounts;
          this.errorMessage =
            discounts.length === 0 ? 'Không tìm thấy khuyến mãi nào!' : '';
        },
        error: (error) => {
          this.errorMessage =
            'Không thể tìm kiếm khuyến mãi. Vui lòng thử lại!';
        },
      });
  }

  // Clear search
  clearSearch(): void {
    this.searchContent = '';
    this.errorMessage = '';
    this.fetchDiscounts();
  }

  // Products
  // Hàm xử lý sản phẩm
  viewDetails(id: number) {
    this.selectedDiscount =
      this.discount.find((brand) => brand.id === id) || null;
    this.isModalOpen = true;
  }

  showCreate(): void {
    this.newDiscount = {
      id: 0,
      code: '',
      description: '',
      percentAmount: 0,
      startDate: '',
      endDate: '',
      isActive: true,
    };
    this.errorMessage = '';
    this.isModalCreate = true;
  }

  createDiscount(): void {
    const body = {
      code: this.newDiscount.code,
      description: this.newDiscount.description,
      percentAmount: this.newDiscount.percentAmount,
      startDate: this.newDiscount.startDate,
      endDate: this.newDiscount.endDate,
      isActive: this.newDiscount.isActive,
    };

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.discountService.createDiscount(body, token).subscribe({
      next: (discount) => {
        this.discount.push(discount);
        this.successMessage = 'Thêm khuyến mãi thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Lỗi khi thêm khuyến mãi';
      },
    });
  }

  editDiscount(id: number): void {
    const discount = this.discount.find((d) => d.id === id);
    if (!discount) return;

    this.selectedDiscount = {
      ...discount,
      startDate: this.formatDate(discount.startDate),
      endDate: this.formatDate(discount.endDate),
    };
    this.isModalUpdate = true;
  }

  updateDiscount(): void {
    const body = {
      code: this.selectedDiscount.code,
      description: this.selectedDiscount.description,
      percentAmount: this.selectedDiscount.percentAmount,
      startDate: this.selectedDiscount.startDate,
      endDate: this.selectedDiscount.endDate,
      isActive: this.selectedDiscount.isActive,
    };

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.discountService
      .updateDiscount(this.selectedDiscount.id, body, token)
      .subscribe({
        next: (updatedDiscount) => {
          const index = this.discount.findIndex(
            (d) => d.id === updatedDiscount.id
          );
          if (index !== -1) {
            this.discount[index] = updatedDiscount;
            this.discount = [...this.discount]; // trigger view update
          }
          this.successMessage = 'Cập nhật khuyến mãi thành công!';
          this.showSuccessMessage();
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Cập nhật thất bại. Vui lòng thử lại!';
        },
      });
  }

  deleteDiscount(id: number): void {
    this.selectedDiscount = this.discount.find((d) => d.id === id) || null;
    this.isModalDelete = true;
  }

  confirmDelete(id: number): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.discountService.deleteDiscount(id, token).subscribe({
      next: () => {
        this.discount = this.discount.filter((d) => d.id !== id);
        this.successMessage = 'Xóa khuyến mãi thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Xóa thất bại. Vui lòng thử lại!';
      },
    });
  }
  private formatDate(isoDate: string): string {
    return isoDate.split('T')[0];
  }

  sendDiscountToUsers(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.discountService
      .notifyUsersAboutDiscount(this.selectedDiscount.id, token)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Đã gửi khuyến mãi đến người dùng thành công!';
          this.showSuccessMessage();
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Gửi thất bại. Vui lòng thử lại!';
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
      this.selectedDiscount.imageUrls = [...this.existingImageUrls];
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
    this.selectedDiscount = null;
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
