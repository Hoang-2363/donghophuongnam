import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CartItem } from '../../model/cart-item.model';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Product } from '../../model/product.model';
import { CASE_SIZES } from '../../model/product-type';
import { WishlistService } from '../../service/wishlist.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent {
  isAdModalOpen = true;
  isMenuOpen = false;
  isSearchOpen = false;
  showScrollTop = false;
  showSuccess = false;
  isCartOpen = false;
  isLoggedIn: boolean = false;
  email = 'donghophuongnam@gmai.com';

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

  searchQuery: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private authService: AuthService
  ) {}

  product: Product | undefined;
  images: string[] = [];

  isModalOpen: boolean = false;
  enlargedImageIndex: number = 0;
  selectedSize: string = '';
  selectedColor: string = '';
  sizes: string[] = CASE_SIZES;
  colors: string[] = ['Đỏ', 'Xanh', 'Vàng', 'Đen'];
  review: { rating: number; comment: string; name: string; email: string } = {
    rating: 0,
    comment: '',
    name: '',
    email: '',
  };
  showModal = false;
  selectedSection: string = 'description';
  hoverRating = 0;

  ngOnInit() {
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

    const id = this.route.snapshot.params['id'];
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.images = product.imageUrls || [];
        this.quantities[product.id!] = 1;
      },
      error: (err) => {
        console.error('Không thể tải sản phẩm:', err);
      },
    });

    this.cartService.cart$.subscribe((cartItems) => {
      this.cartItems = cartItems;
      this.cartItemCount = this.cartService.getTotalItems();
    });
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

  onSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/products'], {
        state: { searchQuery: query },
      });
    }
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

  prevImage(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  setCurrentImage(index: number): void {
    this.currentIndex = index;
  }

  enlargeImage(index: number): void {
    this.enlargedImageIndex = index;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
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

  scrollToSection(sectionId: string): void {
    this.selectedSection = sectionId;
  }

  setRating(rating: number): void {
    this.review.rating = rating;
  }

  addToCart(product?: Product) {
    if (!product || !product.id) {
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

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  closeAdModal() {
    this.isAdModalOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleWishlist(event: Event) {
    event.preventDefault();
    this.isWishlistOpen = !this.isWishlistOpen;
  }

  toggleSearch(event: Event) {
    event.preventDefault();
    this.isSearchOpen = !this.isSearchOpen;
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
