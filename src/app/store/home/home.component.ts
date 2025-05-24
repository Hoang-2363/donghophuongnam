import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CartItem } from '../../model/cart-item.model';
import { Brand } from '../../model/brand.model';
import { Product } from '../../model/product.model';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Category } from '../../model/category.model';
import { WishlistService } from '../../service/wishlist.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
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
  cartItems: CartItem[] = [];

  isWishlistOpen = false;
  wishlistItemCount: number = 0;
  wishlistItems: Product[] = [];

  // Get Brands
  brands: Brand[] = [];
  categories: Category[] = [];

  //8 sản phẩm bán chạy
  products1: Product[] = [];

  //8 sản phẩm mới nhất
  products2: Product[] = [];

  searchQuery: string = '';

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.startCarousel();
    setTimeout(() => {
      this.isAdModalOpen = false;
    }, 5000);

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

    this.productService.getAllBrands().subscribe((data) => {
      this.brands = data;
    });

    this.productService.getAllCategories().subscribe({
      next: (categorie) => {
        this.categories = categorie;
      },
    });

    this.productService.getAllProducts().subscribe((data1) => {
      this.products1 = this.getRandomProducts(data1, 8);
      this.products1.forEach((product) => {
        if (!this.quantities[product.id!]) {
          this.quantities[product.id!] = 1;
        }
      });
    });

    this.productService.getAllProducts().subscribe((data2: Product[]) => {
      this.products2 = data2
        .sort((a, b) => (b.createAt ?? 0) - (a.createAt ?? 0))
        .slice(0, 8);
    });

    this.cartService.cart$.subscribe((cartItems) => {
      this.cartItems = cartItems;
      this.cartItemCount = this.cartService.getTotalItems();
    });

    this.wishlistService.wishlist$.subscribe((items) => {
      this.wishlistItems = items;
      this.wishlistItemCount = items.length;
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

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/products'], {
        state: { searchQuery: query },
      });
    }
  }

  filterByBrand(brandId: number): void {
    this.router.navigate(['/products'], {
      state: { brandId },
    });
  }

  filterByCategory(categoryId: number): void {
    this.router.navigate(['/products'], {
      state: { categoryId },
    });
  }

  //8 sản phẩm bán chạy
  getRandomProducts(products: Product[], count: number): Product[] {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
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

  goToProductDetail(productId: number) {
    this.router.navigate(['/products', productId]);
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
}
