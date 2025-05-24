import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RenewPasswordComponent } from './renew-password/renew-password.component';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';
import { BillComponent } from './bill/bill.component';
import { ProductComponent } from './product/product.component';
import { AccountComponent } from './account/account.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { BlogComponent } from './blog/blog.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { WishlistComponent } from './wishlist/wishlist.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'renew-password', component: RenewPasswordComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'carts', component: CartComponent },
  { path: 'orders', component: OrderComponent },
  { path: 'orders-tracking', component: OrderTrackingComponent },
  { path: 'products', component: ProductComponent },
  { path: 'bill', component: BillComponent },
  { path: 'account', component: AccountComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'blogs', component: BlogComponent },
  { path: 'blogs/:id', component: BlogDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreRoutingModule {}
