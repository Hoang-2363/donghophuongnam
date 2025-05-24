import { Component, HostListener } from '@angular/core';
import { User } from '../../model/user.model';
import { UserService } from '../../service/user.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
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
  users: User[] = [];
  currentUser: any;

  newUser: Partial<User> & {
    file?: File;
    fileName?: string;
    imgPreview?: string;
  } = {
    name: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    password: '',
    role: 'USER', // mặc định nếu không phải super admin
    imgUrl: '',
    file: undefined,
    fileName: '',
    imgPreview: '',
  };

  errorMessage = '';
  selectedUser: any = {};

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.updateScreenWidth();
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/admin']);
    } else {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
      this.fetchUsers();
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
    this.router.navigate(['/admin/users']);
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
    return Math.ceil(this.users.length / this.itemsPerPage);
  }
  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.users.slice(start, end);
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
    return Math.min(this.currentPage * this.itemsPerPage, this.users.length);
  }
  get totalItems(): number {
    return this.users.length;
  }

  fetchUsers(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.getAllUsers(token).subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (error) => {
          this.errorMessage =
            'Không thể tải danh sách người dùng. Vui lòng thử lại!';
        },
      });
    } else {
      this.errorMessage = 'Bạn chưa đăng nhập hoặc token đã hết hạn!';
    }
  }

  searchUsers(): void {
    const keyword = this.searchContent.trim();

    if (!keyword) {
      this.fetchUsers(); // Gọi lại toàn bộ danh sách nếu input rỗng
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.userService.searchUsers(keyword, token).subscribe({
      next: (users) => {
        this.users = users;
        this.errorMessage =
          users.length === 0 ? 'Không tìm thấy người dùng nào!' : '';
      },
      error: (error) => {
        this.errorMessage = 'Không thể tìm kiếm người dùng. Vui lòng thử lại!';
      },
    });
  }
  clearSearch(): void {
    this.searchContent = '';
    this.errorMessage = '';
    this.fetchUsers();
  }

  // Products
  // Hàm xử lý sản phẩm
  viewDetails(id: number) {
    this.selectedUser = this.users.find((brand) => brand.id === id) || null;
    this.isModalOpen = true;
  }

  showCreateUser(): void {
    this.newUser = {
      name: '',
      email: '',
      phone: '',
      gender: '',
      address: '',
      password: '',
      role: 'USER', // mặc định
      imgUrl: '',
      file: undefined,
      fileName: '',
      imgPreview: '',
    };
    this.errorMessage = '';
    this.isModalCreate = true;
  }

  createUser(): void {
    const formData = new FormData();
    formData.append('name', this.newUser.name || '');
    formData.append('email', this.newUser.email || '');
    formData.append('phone', this.newUser.phone || '');
    formData.append('gender', this.newUser.gender || '');
    formData.append('address', this.newUser.address || '');
    formData.append('password', this.newUser.password || '');
    formData.append('role', this.newUser.role || 'USER');
    formData.append('imgUrl', this.newUser.imgUrl || '');

    if (this.newUser.file) {
      formData.append('file', this.newUser.file);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.userService.createUser(formData, token).subscribe({
      next: (user) => {
        this.users.push(user);
        this.successMessage = 'Thêm người dùng thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Lỗi khi thêm người dùng';
      },
    });
  }

  editUser(id: number): void {
    this.selectedUser = this.users.find((u) => u.id === id) || null;
    this.isModalUpdate = true;
  }

  updateUser(): void {
    const formData = new FormData();
    formData.append('name', this.selectedUser.name || '');
    formData.append('email', this.selectedUser.email || '');
    formData.append('phone', this.selectedUser.phone || '');
    formData.append('gender', this.selectedUser.gender || '');
    formData.append('address', this.selectedUser.address || '');
    formData.append('password', this.selectedUser.password || '');
    formData.append('role', this.selectedUser.role || 'USER');
    formData.append('imgUrl', this.selectedUser.imgUrl || '');
    formData.append('password', this.selectedUser.password);

    if (this.selectedUser.file) {
      formData.append('file', this.selectedUser.file);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.userService
      .updateUser(this.selectedUser.id, formData, token)
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex((u) => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.users = [...this.users];
          }
          this.successMessage = 'Cập nhật người dùng thành công!';
          this.showSuccessMessage();
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Cập nhật người dùng thất bại. Vui lòng thử lại!';
        },
      });
  }

  toggleUserStatus(user: User): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    const newStatus = !user.isActive;

    this.userService.setUserActiveStatus(user.id, newStatus, token).subscribe({
      next: () => {
        user.isActive = newStatus;
        this.successMessage = newStatus
          ? 'Đã kích hoạt lại người dùng!'
          : 'Đã vô hiệu hóa người dùng!';
        this.showSuccessMessage();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          (newStatus
            ? 'Không thể kích hoạt người dùng.'
            : 'Không thể vô hiệu hóa người dùng.');
      },
    });
  }

  // Hàm xử lý khi chọn file
  onFileSelectedCreate(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.newUser.file = file;
      this.newUser.fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.newUser.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  onFileSelectedUpdate(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedUser.file = file;
      this.selectedUser.fileName = file.name;
      this.selectedUser.imagePreview = URL.createObjectURL(file);
    } else {
      this.selectedUser.file = null;
      this.selectedUser.fileName = null;
      this.selectedUser.imagePreview = this.selectedUser.imageUrl;
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
    this.selectedUser = null;
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
