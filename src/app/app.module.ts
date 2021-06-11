import { AppCommonModule } from './app-common/app-common.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { RoleDialogComponent } from './view/role/role-dialog/role-dialog.component';
import { RoleAuthDialogComponent } from './view/role/role-auth-dialog/role-auth-dialog.component';
import { MatTreeModule } from '@angular/material/tree';
import { RoleComponent } from './view/role/role.component';
import { ItemComponent } from './view/item/item.component';
import { ItemDialogComponent } from './view/item-dialog/item-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ViewItemComponent } from './view/view-item/view-item.component';

@NgModule({
  declarations: [
    AppComponent,
    RoleDialogComponent,
    RoleAuthDialogComponent,
    RoleComponent,
    ItemComponent,
    ItemDialogComponent,
    ViewItemComponent
  ],
  imports: [
    BrowserModule
    , AppRoutingModule
    , BrowserAnimationsModule
    , AppCommonModule
    , MatExpansionModule
    , MatButtonModule
    , MatSelectModule
    , MatFormFieldModule
    , MatInputModule
    , MatDatepickerModule
    , MatIconModule
    , MatNativeDateModule
    , MatTabsModule
    , MatTableModule
    , MatDialogModule
    , MatTreeModule
    , MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
