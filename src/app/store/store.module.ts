import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreRoutingModule } from './store-routing.module';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RenewPasswordComponent } from './renew-password/renew-password.component';
import { BillComponent } from './bill/bill.component';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';
import { ProductComponent } from './product/product.component';
import { AccountComponent } from './account/account.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { BlogComponent } from './blog/blog.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { WishlistComponent } from './wishlist/wishlist.component';

@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    RenewPasswordComponent,
    BillComponent,
    CartComponent,
    OrderComponent,
    OrderTrackingComponent,
    ProductComponent,
    AccountComponent,
    ProductDetailComponent,
    BlogComponent,
    AboutComponent,
    ContactComponent,
    BlogDetailComponent,
    WishlistComponent,
  ],
  imports: [CommonModule, StoreRoutingModule, FormsModule, HttpClientModule],
})
export class StoreModule {}
