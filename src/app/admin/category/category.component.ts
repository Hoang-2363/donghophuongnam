import { Component, HostListener } from '@angular/core';
import { Category } from '../../model/category.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CategoryService } from '../../service/categoty.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {
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
  categories: Category[] = [];

  // Thêm 
  newCategory: Partial<Category> & { file?: File; fileName?: string; imagePreview?: string } = {
    name: '',
    imageUrl: '',
    description: '',
    file: undefined,
    fileName: '',
    imagePreview: ''
  };

  errorMessage = '';
  selectedCategory: any = {};


  constructor(private http: HttpClient, private router: Router, private categoryService: CategoryService, private authService: AuthService) {
    this.updateScreenWidth();
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/admin']);
    } else {
      this.fetchCategories();
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
          localStorage.removeItem('token');
          this.router.navigate(['/admin']);
        },
        error: (error) => {
          const message = error?.error?.message || error?.message || 'Đăng xuất thất bại!';
          alert(message);
        }
      });
    }
  }


  // Event 
  // Phân trang
  itemsPerPage = 5; // Số sản phẩm mỗi trang
  currentPage = 1; // Trang hiện tại
  maxVisiblePages = 3; // Số trang tối đa hiển thị

  get totalPages(): number {
    return Math.ceil(this.categories.length / this.itemsPerPage);
  }
  get paginatedCategories() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.categories.slice(start, end);
  }
  get pageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const half = Math.floor(this.maxVisiblePages / 2);
    let startPage = Math.max(1, this.currentPage - half);
    let endPage = Math.min(this.totalPages, startPage + this.maxVisiblePages - 1);

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
    return Math.min(this.currentPage * this.itemsPerPage, this.categories.length);
  }
  get totalItems(): number {
    return this.categories.length;
  }


  // Get 
  fetchCategories(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.categoryService.getCategories(token).subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: () => {
          this.errorMessage = 'Không thể tải danh sách danh mục. Vui lòng thử lại!';
        }
      });
    }
  }

  // Search
  searchCategories(): void {
    if (!this.searchContent.trim()) {
      this.fetchCategories();
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }
    this.categoryService.searchCategories(this.searchContent.trim(), token).subscribe({
      next: (categories) => {
        this.categories = categories;
        if (categories.length === 0) {
          this.errorMessage = 'Không tìm thấy danh mục nào!';
        } else {
          this.errorMessage = '';
        }
      },
      error: (error) => {
        this.errorMessage = 'Không thể tìm kiếm danh mục. Vui lòng thử lại!';
      }
    });
  }
  clearSearch(): void {
    this.searchContent = '';
    this.errorMessage = '';
    this.fetchCategories();
  }


  // Products
  // Hàm xử lý sản phẩm
  viewDetails(id: number) {
    this.selectedCategory = this.categories.find(category => category.id === id) || null;
    this.isModalOpen = true;
  }

  showCreate() {
    this.newCategory = {
      name: '',
      imageUrl: '',
      description: ''
    };
    this.errorMessage = '';
    this.isModalCreate = true;
  }
  createCategory(): void {
    const formData = new FormData();
    formData.append('name', this.newCategory.name || '');
    formData.append('description', this.newCategory.description || '');
    if (this.newCategory.file) {
      formData.append('file', this.newCategory.file);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.categoryService.createCategory(formData, token).subscribe({
      next: (category) => {
        this.categories.push(category);
        this.successMessage = 'Thêm danh mục thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Lỗi khi thêm danh mục';
      }
    });
  }


  editCategory(id: number) {
    this.selectedCategory = this.categories.find(category => category.id === id) || null;
    this.isModalUpdate = true;
  }

  updateCategory(): void {
    const formData = new FormData();
    formData.append('name', this.selectedCategory.name);
    formData.append('description', this.selectedCategory.description);

    if (this.selectedCategory.file) {
      formData.append('file', this.selectedCategory.file);
    } else {
      formData.append('imageUrl', this.selectedCategory.imageUrl || '');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.categoryService.updateCategory(this.selectedCategory.id, formData, token).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex(category => category.id === updatedCategory.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
          this.categories = [...this.categories];
        }
        this.successMessage = 'Cập nhật danh mục thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Cập nhật danh mục thất bại. Vui lòng thử lại!';
      }
    });
  }


  deleteCategory(id: number) {
    this.selectedCategory = this.categories.find(category => category.id === id) || null;
    this.isModalDelete = true;
  }

  confirmDelete(id: number): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.categoryService.deleteCategory(id, token).subscribe({
      next: () => {
        this.categories = this.categories.filter(category => category.id !== id);
        this.successMessage = 'Xóa danh mục thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Xóa danh mục thất bại. Vui lòng thử lại!';
      }
    });
  }


  // Hàm xử lý khi chọn file - tạo mới danh mục
  onFileSelectedCreate(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newCategory.file = file;
      this.newCategory.fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.newCategory.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Hàm xử lý khi chọn file - cập nhật danh mục
  onFileSelectedUpdate(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedCategory.file = file;
      this.selectedCategory.fileName = file.name;
      this.selectedCategory.imagePreview = URL.createObjectURL(file);
    } else {
      this.selectedCategory.file = null;
      this.selectedCategory.fileName = null;
      this.selectedCategory.imagePreview = this.selectedCategory.imageUrl;
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
    this.selectedCategory = null;
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
