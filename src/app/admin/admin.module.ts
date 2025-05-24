import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RenewPasswordComponent } from './renew-password/renew-password.component';
import { ProductComponent } from './product/product.component';
import { BrandComponent } from './brand/brand.component';
import { CategoryComponent } from './category/category.component';
import { OrderComponent } from './order/order.component';
import { AccountComponent } from './account/account.component';
import { DiscountsComponent } from './discounts/discounts.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ReviewaComponent } from './reviewa/reviewa.component';
import { PaymentsComponent } from './payments/payments.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { UsersComponent } from './users/users.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    LoginComponent,
    HomeComponent,
    ForgotPasswordComponent,
    RenewPasswordComponent,
    ProductComponent,
    BrandComponent,
    CategoryComponent,
    OrderComponent,
    AccountComponent,
    DiscountsComponent,
    WishlistComponent,
    ReviewaComponent,
    PaymentsComponent,
    StatisticsComponent,
    UsersComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule,
  ],
})
export class AdminModule {}
