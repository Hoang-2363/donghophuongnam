import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RenewPasswordComponent } from './renew-password/renew-password.component';
import { BrandComponent } from './brand/brand.component';
import { CategoryComponent } from './category/category.component';
import { ProductComponent } from './product/product.component';
import { DiscountsComponent } from './discounts/discounts.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ReviewaComponent } from './reviewa/reviewa.component';
import { OrderComponent } from './order/order.component';
import { PaymentsComponent } from './payments/payments.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { UsersComponent } from './users/users.component';
import { AccountComponent } from './account/account.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'renew-password', component: RenewPasswordComponent },
  { path: 'brands', component: BrandComponent },
  { path: 'categories', component: CategoryComponent },
  { path: 'products', component: ProductComponent },
  { path: 'discounts', component: DiscountsComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'reviews', component: ReviewaComponent },
  { path: 'orders', component: OrderComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'users', component: UsersComponent },
  { path: 'accounts', component: AccountComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
