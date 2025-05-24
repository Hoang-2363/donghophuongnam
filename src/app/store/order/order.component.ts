import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Product } from '../../model/product.model';
import { CartItem } from '../../model/cart-item.model';
import { Order } from '../../model/order.model';
import { HttpClient } from '@angular/common/http';
import { OrderService } from '../../service/order.service';
import { Router } from '@angular/router';
import { AddressService } from '../../service/address.service';
import { EmailService } from '../../service/email.service';
import { CartService } from '../../service/cart.service';
import { OrderTransferService } from '../../service/order-transfer.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {
  products: Product[] = [];

  isAdModalOpen = true;
  isMenuOpen = false;
  isSearchOpen = false;
  showScrollTop = false;
  showSuccess = false;
  isCartOpen = false;
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

  isLoggedIn: boolean = false;

  isLoading1: boolean = false;
  order: Order = {
    emailUser: '',
    phoneUser: '',
    nameUser: '',
  };
  errorMessage: string = '';
  //Chọn tỉnh thành phố
  listTinh: any[] = [];
  listQuan: any[] = [];
  listPhuong: any[] = [];

  selectedTinh = '0';
  selectedQuan = '0';
  selectedPhuong = '0';
  soNha = '';

  discountCode: string = '';
  discountAmount: number = 0;
  searchQuery: string = '';

  onTinhChange(): void {
    this.selectedQuan = '0';
    this.selectedPhuong = '0';
    this.listQuan = [];
    this.listPhuong = [];

    if (this.selectedTinh !== '0') {
      this.addressService.getQuan(this.selectedTinh).subscribe((res) => {
        if (res.error === 0) this.listQuan = res.data;
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

  onQuanChange(): void {
    this.selectedPhuong = '0';
    this.listPhuong = [];

    if (this.selectedQuan !== '0') {
      this.addressService.getPhuong(this.selectedQuan).subscribe((res) => {
        if (res.error === 0) this.listPhuong = res.data;
      });
    }
  }

  updateFullAddress(): void {
    const tinh = this.listTinh.find(
      (t) => t.id == this.selectedTinh
    )?.full_name;
    const quan = this.listQuan.find(
      (q) => q.id == this.selectedQuan
    )?.full_name;
    const phuong = this.listPhuong.find(
      (p) => p.id == this.selectedPhuong
    )?.full_name;

    if (tinh && quan && phuong && this.soNha.trim()) {
      this.order.addressUser = `${this.soNha}, ${phuong}, ${quan}, ${tinh}`;
    } else {
      this.order.addressUser = '';
    }
  }

  @ViewChild('menu') menu!: ElementRef;
  @ViewChild('hamburger') hamburger!: ElementRef;

  constructor(
    private http: HttpClient,
    private orderService: OrderService,
    private router: Router,
    private addressService: AddressService,
    private emailService: EmailService,
    private cartService: CartService,
    private authService: AuthService,
    private orderTransferService: OrderTransferService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isAdModalOpen = false;
    }, 5000);

    const token = localStorage.getItem('tokenUser');
    const expiry = localStorage.getItem('tokenUserExpiryTime');
    const userStr = localStorage.getItem('currentUserUser');
    console.log(userStr);
    if (token && expiry && userStr) {
      const now = new Date().getTime();
      const expiryTime = new Date(expiry).getTime();

      if (now < expiryTime) {
        this.isLoggedIn = true;

        const user = JSON.parse(userStr);
        this.order.nameUser = user.name || '';
        this.order.phoneUser = user.phone || '';
        this.order.emailUser = user.email || '';
        this.order.addressUser = user.address || '';
      }
    }

    this.cartService.cart$.subscribe((cartItems) => {
      this.cartItems = cartItems;
      this.cartItemCount = this.cartService.getTotalItems();
      if (!this.order || this.cartItems.length === 0) {
        this.router.navigate(['/products']);
      }
      this.updateTotals();
      this.cartItems.forEach((item) => {
        this.quantities[item.product.id!] = item.quantity;
      });
    });

    //Tỉnh, thành phố
    this.addressService.getTinh().subscribe((res) => {
      if (res.error === 0) {
        this.listTinh = res.data;
      }
    });
  }

  // Hóa đơn
  placeOrder() {
    if (
      !this.order.emailUser ||
      !this.order.phoneUser ||
      !this.order.addressUser ||
      !this.order.nameUser
    ) {
      this.showAlert('Vui lòng điền vào tất cả các trường bắt buộc.');
      return;
    }

    this.isLoading1 = true;

    this.orderService
      .createOrder(this.order, this.cartItems, this.totalAmount)
      .subscribe({
        next: (response: any) => {
          this.order = {
            ...this.order,
            ...response.orderUserResponse,
            orderCode: response.orderCode,
          };
          const billRequest = {
            emailUser: this.order.emailUser,
            nameUser: this.order.nameUser,
            phoneUser: this.order.phoneUser,
            addressUser: this.order.addressUser,
            cartItems: this.cartItems.map((item) => ({
              product: {
                name: item.product.name,
                priceSelling: item.product.priceSelling,
                imageUrls: item.product.imageUrls || [],
              },
              quantity: item.quantity,
            })),
            totalItems: this.totalItems,
            totalAmount: this.totalAmount,
          };

          // Gửi email hóa đơn
          this.emailService.sendBill(billRequest).subscribe({
            next: () => {
              this.isLoading1 = false;
              this.showAlert(
                'Đã đặt hàng thành công! Email xác nhận đã được gửi.'
              );
              this.orderTransferService.setOrder(
                this.order,
                this.cartItems,
                this.totalItems,
                this.totalAmount
              );
              this.router.navigate(['/bill']);
            },
            error: (err) => {
              console.log('1' + err);
              this.isLoading1 = false;
              this.showAlert(
                'Đã đặt hàng thành công nhưng không gửi được email xác nhận.'
              );
              this.orderTransferService.setOrder(
                this.order,
                this.cartItems,
                this.totalItems,
                this.totalAmount
              );
              this.router.navigate(['/bill']);
              this.cartService.clearCart();
            },
          });
        },
        error: (error) => {
          console.log('2' + error);
          this.isLoading1 = false;
          this.errorMessage = error.error?.message || 'Đặt hàng thất bại!';
        },
      });
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
          this.chatMessages.push({
            text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
            isUser: false,
          });
        },
      });
  }
}
