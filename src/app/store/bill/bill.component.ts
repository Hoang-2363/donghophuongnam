import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Product } from '../../model/product.model';
import { CartItem } from '../../model/cart-item.model';
import { Order } from '../../model/order.model';
import { interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OrderTransferService } from '../../service/order-transfer.service';
import { CartService } from '../../service/cart.service';
import { WishlistService } from '../../service/wishlist.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-bill',
  standalone: false,
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent implements OnInit {
  products: Product[] = [];

  isAdModalOpen = true;
  isMenuOpen = false;
  isSearchOpen = false;
  showScrollTop = false;
  showSuccess = false;
  isCartOpen = false;
  isLoggedIn: boolean = false;
  email = 'donghophuongnam@gmai.com';

  cartItemCount: number = 0;
  quantities: { [key: number]: number } = {};
  contentSuccess = '';
  cartItems: CartItem[] = [];
  totalItems: number = 0;
  totalAmount: number = 0;

  isWishlistOpen = false;
  wishlistItemCount: number = 0;
  wishlistItems: Product[] = [];

  order: Order | null = null;
  selectedPaymentMethod: string = 'cod';
  qrCodeUrl: string = '';
  paymentStatus: string = 'Đang xử lý';
  private pollingSubscription: Subscription | null = null;

  qrCountdown: number = 180;
  qrExpired: boolean = false;
  private countdownInterval: any;
  paymentCompleted = false;

  searchQuery: string = '';

  @ViewChild('menu') menu!: ElementRef;
  @ViewChild('hamburger') hamburger!: ElementRef;

  constructor(
    private http: HttpClient,
    private router: Router,
    private orderTransferService: OrderTransferService,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isAdModalOpen = false;
    }, 5000);

    const orderData = this.orderTransferService.getOrderData();

    this.order = orderData.order;
    this.cartItems = orderData.cartItems;
    this.totalItems = orderData.totalItems;
    this.totalAmount = orderData.totalAmount;

    if (!this.order || this.cartItems.length === 0) {
      this.router.navigate(['/products']);
      return;
    }

    this.calculateTotals();
    this.updateQrCodeUrl();

    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      if (!this.paymentCompleted) {
        this.onConfirmCOD();
        alert('Đã tự động xác nhận thanh toán COD. Cảm ơn bạn đã mua hàng!');
        history.pushState(null, '', location.href);
      }
    };

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

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.paymentCompleted) {
      this.onConfirmCOD();
      event.preventDefault();
      event.returnValue = '';
    }
  }

  calculateTotals(): void {
    this.totalItems = this.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    this.totalAmount = this.cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.priceSelling,
      0
    );
  }

  onPaymentMethodChange(): void {
    if (this.selectedPaymentMethod === 'online') {
      this.qrExpired = false;
      this.qrCountdown = 180;
      this.updateQrCodeUrl();
      this.startPaymentPolling();
      this.startQrCountdown();
    } else {
      this.stopPaymentPolling();
      this.stopQrCountdown();
      this.paymentStatus = 'Đang xử lý';
    }
  }

  startQrCountdown(): void {
    this.stopQrCountdown();
    this.countdownInterval = setInterval(() => {
      if (this.qrCountdown > 0) {
        this.qrCountdown--;
      } else {
        this.qrExpired = true;
        this.selectedPaymentMethod = 'cod';
        this.stopPaymentPolling();
        this.stopQrCountdown();
        this.paymentStatus = 'Đang xử lý';
      }
    }, 1000);
  }

  get qrCountdownFormatted(): string {
    const minutes = Math.floor(this.qrCountdown / 60);
    const seconds = this.qrCountdown % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  stopQrCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  updateQrCodeUrl(): void {
    if (this.selectedPaymentMethod === 'online' && this.order?.orderCode) {
      // this.qrCodeUrl = `https://qr.sepay.vn/img?acc=VQRQACBVE1292&bank=MBBank&amount=${this.totalAmount}&des=${this.order.orderCode}`;
      this.qrCodeUrl = `https://qr.sepay.vn/img?acc=VQRQACBVE1292&bank=MBBank&des=${this.order.orderCode}`;
    } else {
      this.qrCodeUrl = '';
    }
  }

  onConfirmCOD(): void {
    if (this.selectedPaymentMethod === 'cod') {
      this.http
        .get<{ message: string }>(
          `http://localhost:8888/api/check-payment/cod/${this.order?.orderCode}`
        )
        .subscribe({
          next: (res) => {
            this.paymentCompleted = true;
            this.paymentStatus = 'Chuyển khoản thành công!';
            this.cartService.clearCart();
            this.stopPaymentPolling();
            this.showAlert(
              'Đã xác nhận thanh toán khi nhận hàng thành công! Cảm ơn bạn đã mua hàng.'
            );
            setTimeout(() => {
              this.router.navigateByUrl('/products', { replaceUrl: true });
            }, 3000);
          },
          error: (err) => {
            this.showAlert('Có lỗi xảy ra khi xác nhận thanh toán COD.');
          },
        });
    }
  }

  startPaymentPolling(): void {
    this.stopPaymentPolling();
    this.pollingSubscription = interval(10000).subscribe(() => {
      this.checkPaymentStatus();
    });
  }

  stopPaymentPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  checkPaymentStatus(): void {
    if (!this.order) {
      return;
    }

    this.http
      .get(
        `http://localhost:8888/api/check-payment/online/${this.order.orderCode}`
      )
      .subscribe(
        (response: any) => {
          if (response.success) {
            this.paymentCompleted = true;
            this.paymentStatus = 'Chuyển khoản thành công!';
            this.stopPaymentPolling();
            this.showAlert(
              'Đã xác nhận thanh toán chuyển khoản! Cảm ơn bạn đã mua hàng.'
            );
            setTimeout(() => {
              this.router.navigateByUrl('/products', { replaceUrl: true });
            }, 3000);
          }
        },
        (error) => {
          console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
        }
      );
  }

  ngOnDestroy(): void {
    this.stopPaymentPolling();
  }

  showAlert(message: string) {
    this.contentSuccess = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 2500);
  }

  toggleFavorite(product: Product): void {
    console.log(`${product.name}`);
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
        error: () => {
          this.chatMessages.push({
            text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
            isUser: false,
          });
        },
      });
  }
}
