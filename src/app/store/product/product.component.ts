import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CartItem } from '../../model/cart-item.model';
import { Brand } from '../../model/brand.model';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../service/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Product } from '../../model/product.model';
import {
  CASE_MATERIALS,
  CASE_SIZES,
  FilterType,
  GENDERS,
  GLASS_MATERIALS,
  MOVEMENT_TYPES,
  PRICE_RANGES,
  STRAP_TYPES,
  THICKNESS_RANGES,
  WATER_RESISTANCE_LEVELS,
} from '../../model/product-type';
import { Category } from '../../model/category.model';
import { ProductService } from '../../service/product.service';
import { WishlistService } from '../../service/wishlist.service';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  isAdModalOpen = true;
  isMenuOpen = false;
  isSearchOpen = false;
  showScrollTop = false;
  showSuccess = false;
  isCartOpen = false;
  isLoggedIn: boolean = false;
  email = 'donghophuongnam@gmai.com';

  images = ['slide-01.png', 'slide-02.png', 'slide-03.png'];
  currentIndex = 0;
  private intervalId: any;

  @ViewChild('menu') menu!: ElementRef;
  @ViewChild('hamburger') hamburger!: ElementRef;

  //Add Cart
  cartItemCount: number = 0;
  quantities: { [key: number]: number } = {};
  contentSuccess = '';
  errorMessage = '';
  cartItems: CartItem[] = [];

  isWishlistOpen = false;
  wishlistItemCount: number = 0;
  wishlistItems: Product[] = [];

  // Get Brands
  brands: Brand[] = [];
  categories: Category[] = [];

  products: Product[] = [];
  sortBy: string = '';
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sortOption: string = '';

  filterOptions: FilterType = {
    brandsType: [],
    categoriesType: [],
    prices: PRICE_RANGES,
    genders: GENDERS,
    straps: STRAP_TYPES,
    movementTypes: MOVEMENT_TYPES,
    caseSizes: CASE_SIZES,
    thicknesses: THICKNESS_RANGES,
    glassMaterials: GLASS_MATERIALS,
    caseMaterials: CASE_MATERIALS,
    waterResistanceLevels: WATER_RESISTANCE_LEVELS,
  };

  selectedFilters: FilterType = {
    brandsType: [],
    categoriesType: [],
    prices: [],
    genders: [],
    straps: [],
    movementTypes: [],
    caseSizes: [],
    thicknesses: [],
    glassMaterials: [],
    caseMaterials: [],
    waterResistanceLevels: [],
  };
  allSelectedValuesCache: string[] = [];
  showFilterModal = false;

  // Phân trang
  itemsPerPage = 8;
  currentPage = 1;
  maxVisiblePages = 3;

  selectedBrandId?: number;
  selectedCategoryId?: number;
  searchQuery: string = '';

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private productService: ProductService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.startCarousel();
    setTimeout(() => {
      this.isAdModalOpen = false;
    }, 5000);

    const state = history.state;
    const query = state?.searchQuery?.trim();
    const brandId = state?.brandId;
    const categoryId = state?.categoryId;

    const token = localStorage.getItem('tokenUser');
    const expiry = localStorage.getItem('tokenUserExpiryTime');
    const userStr = localStorage.getItem('currentUserUser');
    if (token && expiry && userStr) {
      const now = new Date().getTime();
      const expiryTime = new Date(expiry).getTime();
      if (now < expiryTime) {
        this.isLoggedIn = true;
      }
    }

    if (query) {
      this.searchQuery = query;
      this.searchProducts(query);
    } else if (brandId) {
      this.filterByBrand(brandId);
    } else if (categoryId) {
      this.filterByCategory(categoryId);
    } else {
      this.fetchProducts();
    }

    this.fetchBrand();
    this.fetchCategory();

    this.cartService.cart$.subscribe((cartItems) => {
      this.cartItems = cartItems;
      this.cartItemCount = this.cartService.getTotalItems();
    });

    this.wishlistService.wishlist$.subscribe((items) => {
      this.wishlistItems = items;
      this.wishlistItemCount = items.length;
    });
  }

  loadAllProducts(): void {
    this.productService.getAllProducts().subscribe((data) => {
      this.products = data;
    });
  }

  fetchBrand(): void {
    this.productService.getAllBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        this.filterOptions.brandsType = brands.map((brand) => brand.name);
      },
      error: (error) => {
        this.errorMessage =
          'Không thể tải danh sách thương hiệu. Vui lòng thử lại!';
      },
    });
  }

  fetchCategory(): void {
    this.productService.getAllCategories().subscribe({
      next: (categorie) => {
        this.categories = categorie;
        this.filterOptions.categoriesType = categorie.map(
          (category) => category.name
        );
      },
      error: (error) => {
        this.errorMessage =
          'Không thể tải danh sách danh mục. Vui lòng thử lại!';
      },
    });
  }

  fetchProducts(): void {
    this.productService
      .getAllProducts(
        this.sortBy,
        this.minPrice,
        this.maxPrice,
        this.selectedCategoryId,
        this.selectedBrandId
      )
      .subscribe({
        next: (products) => {
          this.products = products;
          this.products.forEach((product) => {
            if (!this.quantities[product.id!]) {
              this.quantities[product.id!] = 1;
            }
          });
        },
        error: () => {
          this.errorMessage =
            'Không thể tải danh sách sản phẩm. Vui lòng thử lại!';
        },
      });
  }

  filterByBrand(brandId: number): void {
    this.selectedBrandId = brandId;
    this.selectedCategoryId = undefined;
    this.sortBy = '';
    this.currentPage = 1;
    this.fetchProducts();
  }

  filterByCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.selectedBrandId = undefined;
    this.sortBy = '';
    this.currentPage = 1;
    this.fetchProducts();
  }

  searchProducts(query: string): void {
    this.productService.searchProducts(query).subscribe({
      next: (products) => {
        this.products = products;
        this.products.forEach((product) => {
          if (!this.quantities[product.id!]) {
            this.quantities[product.id!] = 1;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại!';
      },
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.fetchProducts();
      return;
    }
    this.productService.searchProducts(this.searchQuery.trim()).subscribe({
      next: (products) => {
        this.products = products;
        this.products.forEach((product) => {
          if (!this.quantities[product.id!]) {
            this.quantities[product.id!] = 1;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại!';
      },
    });
  }

  logout() {
    const token = localStorage.getItem('tokenUser');

    if (token) {
      this.authService.logout(token).subscribe({
        next: () => {
          localStorage.removeItem('currentUserUser');
          localStorage.removeItem('tokenUserExpiryTime');
          localStorage.removeItem('tokenUser');
          this.isLoggedIn = false;
          this.router.navigate(['/login']);
        },
        error: (error) => {
          const message =
            error?.error?.message || error?.message || 'Đăng xuất thất bại!';
          alert(message);
        },
      });
    }
  }

  goToProductDetail(productId: number) {
    this.router.navigate(['/products', productId]);
  }

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
    this.fetchProducts();
  }

  get totalSelected(): number {
    return Object.values(this.selectedFilters).reduce(
      (total, items) => total + items.length,
      0
    );
  }

  toggleSelection(type: keyof FilterType, value: string): void {
    if (!this.isValidFilter(type, value)) {
      console.warn(`Invalid filter: ${type} - ${value}`);
      return;
    }

    const filterArray = this.selectedFilters[type];
    const index = filterArray.indexOf(value);

    if (index === -1) {
      filterArray.push(value);
    } else {
      filterArray.splice(index, 1);
    }

    filterArray.sort();
    this.updateAllSelectedValuesCache();
    console.log('Selected filter values:', this.allSelectedValuesCache);
  }

  updateAllSelectedValuesCache() {
    const allValues: string[] = [];
    for (const key in this.selectedFilters) {
      const typedKey = key as keyof FilterType;
      if (Array.isArray(this.selectedFilters[typedKey])) {
        allValues.push(...this.selectedFilters[typedKey]);
      }
    }
    this.allSelectedValuesCache = allValues;
  }

  get allSelectedFilterValues(): string[] {
    return this.allSelectedValuesCache;
  }

  // Kiểm tra filter có hợp lệ không
  private isValidFilter(type: keyof FilterType, value: string): boolean {
    return this.filterOptions[type].includes(value);
  }

  isSelected(type: keyof FilterType, value: string): boolean {
    return this.selectedFilters[type].includes(value);
  }

  clearAll(): void {
    Object.keys(this.selectedFilters).forEach((key) => {
      this.selectedFilters[key as keyof FilterType] = [];
    });

    this.updateAllSelectedValuesCache();
  }

  applyFilters(): void {
    this.productService.filterProducts(this.selectedFilters).subscribe({
      next: (res) => {
        this.products = res;
        this.showFilterModal = false;
      },
      error: (err) => {
        console.error('Lỗi khi lọc sản phẩm:', err);
      },
    });
  }

  openFilter(): void {
    this.showFilterModal = true;
  }

  //Add cart
  increaseQuantity(productId: number) {
    this.quantities[productId] = (this.quantities[productId] || 1) + 1;
  }

  decreaseQuantity(productId: number) {
    if (this.quantities[productId] > 1) {
      this.quantities[productId]--;
    }
  }

  addToCart(product: Product) {
    if (!product.id) {
      this.showAlert('Thiếu ID sản phẩm!');
      return;
    }

    const quantity = this.quantities[product.id] || 1;
    if (quantity < 1) {
      this.showAlert('Số lượng không hợp lệ!');
      return;
    }

    const success = this.cartService.addToCart(product, quantity);
    if (success) {
      this.showAlert('Thêm sản phẩm thành công!');
    } else {
      this.showAlert(
        `Không thể thêm ${product.name}. Số lượng yêu cầu vượt quá tồn kho còn ${product.stockQuantity}.`
      );
    }
  }

  addToWishlist(product: Product) {
    if (!product.id) {
      this.showAlert('Thiếu ID sản phẩm!');
      return;
    }

    const success = this.wishlistService.addToWishlist(product);
    if (success) {
      this.showAlert('Thêm sản phẩm vào yêu thích thành công!');
    } else {
      this.showAlert('Sản phẩm đã có trong danh sách yêu thích.');
    }
  }

  showAlert(message: string) {
    this.contentSuccess = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 2500);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startCarousel() {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 3000);
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  closeAdModal() {
    this.isAdModalOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearch(event: Event) {
    event.preventDefault();
    this.isSearchOpen = !this.isSearchOpen;
  }

  toggleWishlist(event: Event) {
    event.preventDefault();
    this.isWishlistOpen = !this.isWishlistOpen;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event): void {
    if (window.innerWidth >= 768) {
      return;
    }

    if (
      this.isMenuOpen &&
      this.menu &&
      this.hamburger &&
      !this.menu.nativeElement.contains(event.target) &&
      !this.hamburger.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }

    if (
      this.isMenuOpen &&
      this.menu &&
      this.hamburger &&
      !this.menu.nativeElement.contains(event.target) &&
      !this.hamburger.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }

    if (
      this.isContactMenuOpen &&
      !this.isChatboxOpen &&
      event.target instanceof Node &&
      !document
        .querySelector('.fixed.bottom-20.right-6')
        ?.contains(event.target)
    ) {
      this.isContactMenuOpen = false;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollTop = window.pageYOffset > 200;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleCart(event: Event) {
    event.preventDefault();
    this.isCartOpen = !this.isCartOpen;
  }

  // Thêm vào class BlogsComponent
  isContactMenuOpen = false;
  isChatboxOpen = false;
  chatInput = '';
  isLoading = false;
  chatMessages: { text: string; isUser: boolean }[] = [
    {
      text: 'Chào bạn! Chúng tôi có thể giúp gì cho bạn hôm nay?',
      isUser: false,
    },
  ];
  private storeContext = `
    Bạn là trợ lý AI của Đồng hồ Phương Nam, một cửa hàng trực tuyến bán đồng hồ chính hãng tại Việt Nam. 
    Cửa hàng cung cấp đồng hồ nam, nữ từ các thương hiệu như Casio, Citizen, Seiko, Orient, với chính sách:
    - Bảo hành 5 năm.
    - Giao hàng miễn phí toàn quốc.
    - Hỗ trợ trả góp 0%.
    - Cam kết 100% chính hãng.
    Website: [phuongnamwatch.vn] (giả định, thay bằng URL thực tế).
    Vui lòng trả lời các câu hỏi liên quan đến đồng hồ, thương hiệu, hoặc dịch vụ của cửa hàng một cách thân thiện và chuyên nghiệp.
  `;

  toggleContactMenu(): void {
    this.isContactMenuOpen = !this.isContactMenuOpen;
    if (this.isContactMenuOpen) {
      this.isChatboxOpen = false; // Đóng chatbox khi mở menu
    }
  }

  toggleChatbox(): void {
    this.isChatboxOpen = !this.isChatboxOpen;
    this.isContactMenuOpen = false; // Đóng menu khi mở chatbox
  }

  sendMessage(): void {
    if (!this.chatInput.trim()) {
      return;
    }

    // Thêm tin nhắn người dùng
    this.chatMessages.push({ text: this.chatInput, isUser: true });
    const userMessage = this.chatInput;
    this.isLoading = true;
    this.chatInput = '';

    // Gửi yêu cầu đến OpenRouter API
    this.sendToOpenRouter(userMessage);
  }

  private sendToOpenRouter(message: string): void {
    const apiKey =
      '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'; // Thay bằng API key thực tế (lưu ý: nên lưu ở backend)

    const payload = {
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'system',
          content: this.storeContext, // Gửi ngữ cảnh cửa hàng
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: message,
            },
          ],
        },
      ],
    };

    this.http
      .post('https://openrouter.ai/api/v1/chat/completions', payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })
      .subscribe({
        next: (response: any) => {
          const botResponse =
            response.choices[0]?.message?.content ||
            'Xin lỗi, tôi không hiểu câu hỏi của bạn.';
          this.chatMessages.push({ text: botResponse, isUser: false });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error calling OpenRouter API:', error);
          this.chatMessages.push({
            text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
            isUser: false,
          });
        },
      });
  }

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
