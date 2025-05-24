import { Component, HostListener } from '@angular/core';
import { Product } from '../../model/product.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { AuthService } from '../../service/auth.service';
import { Brand } from '../../model/brand.model';
import { BrandService } from '../../service/brand.service';
import { CategoryService } from '../../service/categoty.service';
import { Category } from '../../model/category.model';
import {
  CASE_MATERIALS,
  GLASS_MATERIALS,
  MOVEMENT_TYPES,
  STRAP_TYPES,
  WATER_RESISTANCE_LEVELS,
} from '../../model/product-type';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
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

  strapTypes: string[] = STRAP_TYPES;
  movementTypes: string[] = MOVEMENT_TYPES;
  glassMaterial: string[] = GLASS_MATERIALS;
  caseMaterial: string[] = CASE_MATERIALS;
  waterResistance: string[] = WATER_RESISTANCE_LEVELS;

  dropdownOpen = false;
  options: { id: number; name: string }[] = [];
  selectedMap: { [key: number]: boolean } = {};
  selectedOptions: string[] = [];
  predefinedIds: number[] = [];

  // Get
  products: Product[] = [];
  brands: Brand[] = [];
  removedImageUrls: string[] = [];

  // Thêm
  newProduct: Product = {
    name: '',
    priceImport: 0,
    priceSelling: 0,
    strapType: '',
    description: '',
    stockQuantity: 1,
    movementType: '',
    caseSize: '',
    thickness: '',
    glassMaterial: '',
    caseMaterial: '',
    waterResistance: '',
    warranty: '',
    brandId: 0,
    categoryIds: [],
    imageUrls: [],
  };

  selectedProduct: any = {};
  files: File[] = [];
  imageUrls: string[] = [];
  existingImageUrls: string[] = [];
  newImagePreviews: string[] = [];
  totalImagesCount: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private brandService: BrandService,
    private categoryService: CategoryService
  ) {
    this.updateScreenWidth();
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/admin']);
    } else {
      const url = this.router.url;
      if (url.startsWith('/admin/products')) {
        this.isDropdownOpen = true;
      }

      this.fetchBrands();
      this.fetchCategories();
      this.fetchProducts();
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
  //Hiển thị combobox
  toggleDropdownOption() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  updateSelected() {
    const selectedIds = Object.keys(this.selectedMap)
      .filter((key) => this.selectedMap[+key])
      .map((key) => +key);

    this.selectedOptions = this.options
      .filter((option) => this.selectedMap[option.id])
      .map((option) => option.name);

    this.newProduct.categoryIds = selectedIds;
  }

  updateSelectedCategories() {
    this.selectedMap = {};
    this.predefinedIds.forEach((id) => {
      this.selectedMap[id] = true;
    });
    this.selectedOptions = this.options
      .filter((option) => this.selectedMap[option.id])
      .map((option) => option.name);
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
    return Math.ceil(this.products.length / this.itemsPerPage);
  }
  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.products.slice(start, end);
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
    return Math.min(this.currentPage * this.itemsPerPage, this.products.length);
  }
  get totalItems(): number {
    return this.products.length;
  }

  // Get
  fetchProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        this.errorMessage =
          'Không thể tải danh sách sản phẩm. Vui lòng thử lại!';
      },
    });
  }

  fetchBrands(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      return;
    }

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

  fetchCategories(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      return;
    }

    this.categoryService.getCategories(token).subscribe({
      next: (categories) => {
        const newOptions = categories.map((category) => ({
          id: category.id,
          name: category.name,
        }));
        this.options = [...this.options, ...newOptions];
      },
      error: (error) => {
        this.errorMessage =
          'Không thể tải danh sách danh mục. Vui lòng thử lại!';
      },
    });
  }

  // Search
  searchProducts(): void {
    if (!this.searchContent.trim()) {
      this.fetchProducts();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.productService.searchProducts(this.searchContent.trim()).subscribe({
      next: (products) => {
        this.products = products;
        this.errorMessage =
          products.length === 0 ? 'Không tìm thấy sản phẩm nào!' : '';
      },
      error: (error) => {
        this.errorMessage = 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại!';
      },
    });
  }
  clearSearch() {
    this.searchContent = '';
    this.errorMessage = '';
    this.fetchProducts();
  }

  // Products
  // Hàm xử lý sản phẩm
  viewDetails(id: number): void {
    this.selectedProduct =
      this.products.find((product) => product.id === id) || null;
    if (this.selectedProduct) {
      this.predefinedIds = this.selectedProduct.categories.map(
        (category: Category) => category.id
      );
      this.updateSelectedCategories();
      this.selectedProduct.brandId = this.selectedProduct.brand.id;
      this.selectedProduct.strapType = this.selectedProduct.strapType;
      this.selectedProduct.movementType = this.selectedProduct.movementType;
    }
    this.isModalOpen = true;
  }

  showCreate() {
    this.newProduct = {
      name: '',
      priceImport: 0,
      priceSelling: 0,
      description: '',
      stockQuantity: 0,
      strapType: '',
      movementType: '',
      caseSize: '',
      thickness: '',
      glassMaterial: '',
      caseMaterial: '',
      waterResistance: '',
      warranty: '',
      brandId: 0,
      categoryIds: [],
      imageUrls: [],
    };
    this.files = [];
    this.imageUrls = [];
    this.errorMessage = '';
    this.isModalCreate = true;
  }
  createProduct(): void {
    if (this.files.length === 0) {
      this.errorMessage = 'Vui lòng chọn file!';
      this.successMessage = '';
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }
    const formData = new FormData();
    formData.append('name', this.newProduct.name);
    formData.append('description', this.newProduct.description);
    formData.append('stockQuantity', this.newProduct.stockQuantity.toString());
    formData.append('priceImport', this.newProduct.priceImport.toString());
    formData.append('priceSelling', this.newProduct.priceSelling.toString());
    formData.append('strapType', this.newProduct.strapType);
    formData.append('movementType', this.newProduct.movementType);
    formData.append('caseSize', this.newProduct.caseSize.toString());
    formData.append('thickness', this.newProduct.thickness.toString());
    formData.append('glassMaterial', this.newProduct.glassMaterial);
    formData.append('caseMaterial', this.newProduct.caseMaterial);
    formData.append('waterResistance', this.newProduct.waterResistance);
    formData.append('warranty', this.newProduct.warranty.toString());
    formData.append('brandId', this.newProduct.brandId.toString());
    this.newProduct.categoryIds.forEach((id: number) => {
      formData.append('categoryIds', id.toString());
    });

    for (let file of this.files) {
      formData.append('files', file);
    }

    this.productService.createProduct(formData, token).subscribe({
      next: () => {
        this.successMessage = 'Sản phẩm đã được tạo thành công!';
        this.errorMessage = '';
        this.fetchProducts();
        this.closeModal();
        this.showSuccessMessage();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Lỗi khi thêm thương hiệu';
      },
    });
  }

  editProduct(id: number) {
    this.selectedProduct = this.products.find((product) => product.id === id);
    if (this.selectedProduct) {
      this.predefinedIds = this.selectedProduct.categories.map(
        (category: Category) => category.id
      );
      this.updateSelectedCategories();
      this.selectedProduct.brandId = this.selectedProduct.brand.id;
      this.selectedProduct.strapType = this.selectedProduct.strapType;
      this.selectedProduct.movementType = this.selectedProduct.movementType;
    }

    this.existingImageUrls = this.selectedProduct.imageUrls || [];
    this.newImagePreviews = [];
    this.imageUrls = [...this.existingImageUrls];
    this.files = [];

    this.updateTotalImagesCount();
    this.isModalUpdate = true;
  }
  updateProduct(): void {
    if (
      this.files.length === 0 &&
      (!this.selectedProduct.imageUrls ||
        this.selectedProduct.imageUrls.length === 0)
    ) {
      this.errorMessage = 'Vui lòng chọn ít nhất một ảnh!';
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    const formData = new FormData();

    // Thêm thông tin sản phẩm
    formData.append('name', this.selectedProduct.name);
    formData.append('description', this.selectedProduct.description);
    formData.append(
      'stockQuantity',
      this.selectedProduct.stockQuantity.toString()
    );
    formData.append('priceImport', this.selectedProduct.priceImport.toString());
    formData.append(
      'priceSelling',
      this.selectedProduct.priceSelling.toString()
    );
    formData.append('strapType', this.selectedProduct.strapType);
    formData.append('movementType', this.selectedProduct.movementType);
    formData.append('caseSize', this.selectedProduct.caseSize.toString());
    formData.append('thickness', this.selectedProduct.thickness.toString());
    formData.append('glassMaterial', this.selectedProduct.glassMaterial);
    formData.append('caseMaterial', this.selectedProduct.caseMaterial);
    formData.append('waterResistance', this.selectedProduct.waterResistance);
    formData.append('warranty', this.selectedProduct.warranty.toString());
    formData.append('brandId', this.selectedProduct.brandId.toString());
    this.predefinedIds.forEach((id: number) => {
      formData.append('categoryIds', id.toString());
    });

    if (this.removedImageUrls.length > 0) {
      formData.append(
        'removedImageUrls',
        JSON.stringify(this.removedImageUrls)
      );
    }

    for (let file of this.files) {
      formData.append('files', file);
    }

    this.productService
      .updateProduct(this.selectedProduct.id, formData, token)
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.successMessage = 'Cập nhật sản phẩm thành công!';
          this.closeModal();
          this.showSuccessMessage();
          this.fetchProducts();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            'Cập nhật thương hiệu thất bại. Vui lòng thử lại!';
        },
      });
  }

  deleteProduct(id: number): void {
    this.selectedProduct =
      this.products.find((product) => product.id === id) || null;
    this.isModalDelete = true;
  }
  confirmDelete(id: number): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Không tìm thấy token. Vui lòng đăng nhập lại!';
      this.router.navigate(['/admin']);
      return;
    }

    this.productService.deleteProduct(id, token).subscribe({
      next: () => {
        this.products = this.products.filter((product) => product.id !== id);
        this.successMessage = 'Xóa sản phẩm thành công!';
        this.showSuccessMessage();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Xóa sản phẩm thất bại. Vui lòng thử lại!';
      },
    });
  }

  // Hàm xử lý khi chọn file
  onFileSelectedCreate(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = Array.from(input.files);
      this.imageUrls = [];

      Promise.all(
        this.files.map((file) => {
          return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.imageUrls.push(e.target.result);
              resolve();
            };
            reader.onerror = () => {
              reject('Lỗi khi tải file');
            };
            reader.readAsDataURL(file);
          });
        })
      )
        .then(() => {})
        .catch((error) => {});
    }
  }
  onFileSelectedUpdate(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.files = [...this.files, ...newFiles];
      let filesProcessed = 0;
      const totalNewFiles = newFiles.length;

      for (let file of newFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newImagePreviews.push(e.target.result);
          this.imageUrls.push(e.target.result);
          filesProcessed++;

          if (filesProcessed === totalNewFiles) {
            this.updateTotalImagesCount();
          }
        };
        reader.readAsDataURL(file);
      }

      if (totalNewFiles === 0) {
        this.updateTotalImagesCount();
      }
    }
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
      this.selectedProduct.imageUrls = [...this.existingImageUrls];
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
    this.selectedProduct = null;
    this.errorMessage = '';

    this.updateSelectedCategories();
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
