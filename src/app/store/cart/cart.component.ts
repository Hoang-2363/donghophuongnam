import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Product } from '../../model/product.model';
import { CartItem } from '../../model/cart-item.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CartService } from '../../service/cart.service';
import { Observable } from 'rxjs';
import { Discount } from '../../model/discount.model';
import { DiscountService } from '../../service/discount.service';
import { WishlistService } from '../../service/wishlist.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  products: Product[] = [];

  isAdModalOpen = true;
  isMenuOpen = false;
  isSearchOpen = false;
  showScrollTop = false;
  showSuccess = false;
  isCartOpen = false;
  isLoggedIn: boolean = false;
  email = 'donghophuongnam@gmai.com';

  showFilterModal = false;
  cartItemCount: number = 0;
  quantities: { [key: number]: number } = {};
  contentSuccess = '';
  cartItems: CartItem[] = [];
  totalItems: number = 0;
  totalAmount: number = 0;

  isWishlistOpen = false;
  wishlistItemCount: number = 0;
  wishlistItems: Product[] = [];

  discountCode: string = '';
  discountAmount: number = 0;
  discountMessage: string = '';
  searchQuery: string = '';

  @ViewChild('menu') menu!: ElementRef;
  @ViewChild('hamburger') hamburger!: ElementRef;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cartService: CartService,
    private discountService: DiscountService,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isAdModalOpen = false;
    }, 5000);
    this.cartService.cart$.subscribe((cartItems) => {
      this.cartItems = cartItems;
      this.cartItemCount = this.cartService.getTotalItems();
      if (!this.cartItems || this.cartItems.length === 0) {
        this.router.navigate(['/']);
        return;
      }
      this.updateTotals();
      this.cartItems.forEach((item) => {
        this.quantities[item.product.id!] = item.quantity;
      });

      this.cartService.cart$.subscribe((cartItems) => {
        this.cartItems = cartItems;
        this.cartItemCount = this.cartService.getTotalItems();
      });

      this.wishlistService.wishlist$.subscribe((items) => {
        this.wishlistItems = items;
        this.wishlistItemCount = items.length;
      });
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

  applyDiscount() {
    this.discountService.getDiscountByCode(this.discountCode).subscribe({
      next: (discount: Discount) => {
        const now = new Date();
        const start = new Date(discount.startDate);
        const end = new Date(discount.endDate);

        if (!discount.isActive || now < start || now > end) {
          this.discountMessage = 'Mã giảm giá không còn hiệu lực.';
          this.discountAmount = 0;
          return;
        }

        const amount = (this.totalAmount * discount.percentAmount) / 100;
        this.discountAmount = amount;
        this.discountMessage = `Áp dụng thành công mã giảm ${discount.percentAmount}%!`;
      },
      error: () => {
        this.discountAmount = 0;
        this.discountMessage = 'Không tìm thấy mã giảm giá.';
      },
    });
  }

  cancelDiscount(): void {
    this.discountCode = '';
    this.discountMessage = '';
  }

  proceedToOrder() {
    const productIds = this.cartItems.map((item) => item.product.id!);
    this.checkStock(productIds).subscribe({
      next: (products: Product[]) => {
        const outOfStockItems = this.cartItems.filter((item) => {
          const backendProduct = products.find((p) => p.id === item.product.id);
          return (
            backendProduct &&
            backendProduct.stockQuantity !== undefined &&
            item.quantity > backendProduct.stockQuantity
          );
        });

        if (outOfStockItems.length > 0) {
          const itemNames = outOfStockItems
            .map((item) => {
              const backendProduct = products.find(
                (p) => p.id === item.product.id
              );
              return `${item.product.name} (Cần: ${item.quantity}, Tồn: ${
                backendProduct?.stockQuantity ?? 0
              })`;
            })
            .join(', ');
          outOfStockItems.forEach((item) => {
            this.removeItem(item.product.id!);
          });
          this.showAlert(
            `Các sản phẩm sau đã hết hàng và được xóa khỏi giỏ hàng: ${itemNames}`
          );
          this.updateTotals();

          return;
        }
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('Lỗi khi kiểm tra tồn kho:', err);
        this.showAlert('Đã xảy ra lỗi khi kiểm tra tồn kho. Vui lòng thử lại.');
      },
    });
  }

  private checkStock(productIds: number[]): Observable<Product[]> {
    return this.http.post<Product[]>(
      'http://localhost:8888/api/products/batch',
      { ids: productIds }
    );
  }

  increaseQuantity(productId: number, stockQuantity: number) {
    if (this.quantities[productId] < stockQuantity) {
      this.quantities[productId]++;
      this.cartService.updateQuantity(productId, this.quantities[productId]);
      this.updateTotals();
    }
  }

  decreaseQuantity(productId: number, stockQuantity: number) {
    if (this.quantities[productId] > 1) {
      this.quantities[productId]--;
      this.cartService.updateQuantity(productId, this.quantities[productId]);
      this.updateTotals();
    }
  }

  validateQuantity(value: number, productId: number, stockQuantity: number) {
    if (value < 1) {
      this.quantities[productId] = 1;
    } else if (value > stockQuantity) {
      this.quantities[productId] = stockQuantity;
    } else {
      this.quantities[productId] = value;
    }
    this.cartService.updateQuantity(productId, this.quantities[productId]);
    this.updateTotals();
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
    delete this.quantities[productId];
    this.updateTotals();
  }

  private updateTotals() {
    this.totalItems = this.cartService.getTotalItems();
    this.totalAmount = this.cartItems.reduce((total, item) => {
      return total + item.quantity * item.product.priceSelling;
    }, 0);
  }

  showAlert(message: string) {
    this.contentSuccess = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 2500);
  }

  toggleFavorite(product: Product): void {
    console.log(`Toggled favorite for ${product.name}`);
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
}
