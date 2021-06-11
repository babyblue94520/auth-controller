import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Role, RoleService } from 'ts/schema';
import { RoleAuthDialogComponent } from './role-auth-dialog/role-auth-dialog.component';
import { RoleDialogComponent } from './role-dialog/role-dialog.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent {


  public roleColumns: string[] = ['id', 'name', 'action'];
  public roles: Role[] = [];

  constructor(public dialog: MatDialog) {
    this.roles = RoleService.findAll();
  }

  public add() {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.roles = RoleService.findAll();
    });
  }

  public modify(role: Role) {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '250px',
      data: role
    });

    dialogRef.afterClosed().subscribe(result => {
      this.roles = RoleService.findAll();
    });
  }

  public remove(role: Role) {
    RoleService.delete(role);
    this.roles = RoleService.findAll();
  }

  public modifyAuth(role: Role) {
    const dialogRef = this.dialog.open(RoleAuthDialogComponent, {
      data: role
    });
  }
}
