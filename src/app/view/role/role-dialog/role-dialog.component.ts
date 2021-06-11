import { createElementCssSelector } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Role, RoleService } from 'ts/schema';

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.scss']
})
export class RoleDialogComponent {

  constructor(public dialogRef: MatDialogRef<RoleDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Role) {

  }

  save(): void {
    if (this.data.id == undefined) {
      RoleService.insert(this.data);
    } else {
      RoleService.update(this.data);
    }

    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
