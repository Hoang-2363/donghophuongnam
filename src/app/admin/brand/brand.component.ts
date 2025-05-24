import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Brand } from '../../model/brand.model';
import { BrandService } from '../../service/brand.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-brand',
  standalone: false,
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent {
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

  // Get
  brands: Brand[] = [];

  // Thêm
  newBrand: Partial<Brand> & {
    file?: File;
    fileName?: string;
    imagePreview?: string;
  } = {
    name: '',
    imageUrl: '',
    description: '',
    country: '',
    file: undefined,
    fileName: '',
    imagePreview: '',
  };

  errorMessage = '';
  selectedBrand: any = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private brandService: BrandService,
    private authService: AuthService
  ) {
    this.updateScreenWidth();
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/admin']);
    } else {
      this.fetchBrands();
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
  itemsPerPage = 5; // Số sản phẩm mỗi trang
  currentPage = 1; // Trang hiện tại
  maxVisiblePages = 3; // Số trang tối đa hiển thị

  get totalPages(): number {
    return Math.ceil(this.brands.length / this.itemsPerPage);
  }
  get paginatedBrands() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.brands.slice(start, end);
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
    return Math.min(this.currentPage * this.itemsPerPage, this.brands.length);
  }
  get totalItems(): number {
    return this.brands.length;
  }

  // Get
  fetchBrands(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.brandService.getBrands(token).subscribe({
        next: (brands) => {
          this.brands = brands;
        },
        error: (error) => {
          this.errorMessage =
            'Không thể tải danh sách thương hiệu. Vui lòng thử lại!';
        },
      });
    }
  }

  // Search
  searchBrands(): void {
    if (!this.searchContent.trim()) {
      this.fetchBrands();
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }
    this.brandService.searchBrands(this.searchContent.trim(), token).subscribe({
      next: (brands) => {
        this.brands = brands;
        if (brands.length === 0) {
          this.errorMessage = 'Không tìm thấy thương hiệu nào!';
        } else {
          this.errorMessage = '';
        }
      },
      error: (error) => {
        this.errorMessage = 'Không thể tìm kiếm thương hiệu. Vui lòng thử lại!';
      },
    });
  }
  clearSearch() {
    this.searchContent = '';
    this.errorMessage = '';
    this.fetchBrands();
  }

  // Products
  // Hàm xử lý sản phẩm
  viewDetails(id: number) {
    this.selectedBrand = this.brands.find((brand) => brand.id === id) || null;
    this.isModalOpen = true;
  }

  showCreate() {
    this.newBrand = {
      name: '',
      imageUrl: '',
      description: '',
      country: '',
    };
    this.errorMessage = '';
    this.isModalCreate = true;
  }
  createBrand(): void {
    const formData = new FormData();
    formData.append('name', this.newBrand.name || '');
    formData.append('description', this.newBrand.description || '');
    formData.append('country', this.newBrand.country || '');
    if (this.newBrand.file) {
      formData.append('file', this.newBrand.file);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.brandService.createBrand(formData, token).subscribe({
      next: (brand) => {
        this.brands.push(brand);
        this.successMessage = 'Thêm thương hiệu thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Lỗi khi thêm thương hiệu';
      },
    });
  }

  editBrand(id: number) {
    this.selectedBrand = this.brands.find((brand) => brand.id === id) || null;
    this.isModalUpdate = true;
  }
  updateBrand(): void {
    const formData = new FormData();
    formData.append('name', this.selectedBrand.name);
    formData.append('description', this.selectedBrand.description);
    formData.append('country', this.selectedBrand.country);

    if (this.selectedBrand.file) {
      formData.append('file', this.selectedBrand.file);
    } else {
      formData.append('imageUrl', this.selectedBrand.imageUrl || '');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.brandService
      .updateBrand(this.selectedBrand.id, formData, token)
      .subscribe({
        next: (updatedBrand) => {
          const index = this.brands.findIndex(
            (brand) => brand.id === updatedBrand.id
          );
          if (index !== -1) {
            this.brands[index] = updatedBrand;
            this.brands = [...this.brands];
          }
          this.successMessage = 'Cập nhật thương hiệu thành công!';
          this.showSuccessMessage();
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Cập nhật thương hiệu thất bại. Vui lòng thử lại!';
        },
      });
  }

  deleteBrand(id: number) {
    this.selectedBrand = this.brands.find((brand) => brand.id === id) || null;
    this.isModalDelete = true;
  }
  confirmDelete(id: number): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.brandService.deleteBrand(id, token).subscribe({
      next: () => {
        this.brands = this.brands.filter((brand) => brand.id !== id);
        this.successMessage = 'Xóa thương hiệu thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Xóa thương hiệu thất bại. Vui lòng thử lại!';
      },
    });
  }

  // Hàm xử lý khi chọn file
  onFileSelectedCreate(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newBrand.file = file;
      this.newBrand.fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.newBrand.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  onFileSelectedUpdate(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedBrand.file = file;
      this.selectedBrand.fileName = file.name;
      this.selectedBrand.imagePreview = URL.createObjectURL(file);
    } else {
      this.selectedBrand.file = null;
      this.selectedBrand.fileName = null;
      this.selectedBrand.imagePreview = this.selectedBrand.imageUrl;
    }
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
    this.selectedBrand = null;
    this.errorMessage = '';
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
