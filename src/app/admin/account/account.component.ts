import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent {
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

  showPassword: boolean = false;
  searchContent: string = '';
  selectedUser: any = {};

  users: User[] = [];
  errorMessage = '';
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.updateScreenWidth();
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('currentUser');
    if (userStr && token) {
      this.selectedUser = JSON.parse(userStr);
    } else {
      this.router.navigate(['/admin']);
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

  updateUser(): void {
    const formData = new FormData();
    formData.append('name', this.selectedUser.name);
    formData.append('email', this.selectedUser.email);
    formData.append('phone', this.selectedUser.phone);
    formData.append('gender', this.selectedUser.gender);
    formData.append('address', this.selectedUser.address);
    if (this.selectedUser.password) {
      formData.append('password', this.selectedUser.password);
    }

    if (this.selectedUser.file) {
      formData.append('file', this.selectedUser.file);
    } else {
      formData.append('imgUrl', this.selectedUser.imgUrl || '');
    }

    const token = localStorage.getItem('tokenUser');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.authService.updateUser(formData, token).subscribe({
      next: (updateUser) => {
        const index = this.users.findIndex((user) => user.id === updateUser.id);
        if (index !== -1) {
          this.users[index] = updateUser;
          this.users = [...this.users];
        }
        this.successMessage = 'Cập nhật tài khoản thành công!';
        this.showSuccessMessage();
        this.selectedUser = {
          ...updateUser,
          file: null,
          fileName: null,
          imagePreview: updateUser.imgUrl,
        };
        localStorage.setItem('currentUserUser', JSON.stringify(updateUser));
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          'Cập nhật tài khoản thất bại. Vui lòng thử lại!';
      },
    });
  }

  // Hàm hiển thị thông báo thành công
  showSuccessMessage() {
    this.isSuccessMessageVisible = true;
    setTimeout(() => {
      this.isSuccessMessageVisible = false;
    }, 3000);
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
      this.selectedUser.imagePreview = this.selectedUser.imgUrl;
    }
  }
}
