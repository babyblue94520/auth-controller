import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { deepClone } from 'ts/clone';
import { Item, ItemService, Role, RoleService } from 'ts/schema';

@Component({
  selector: 'app-item-dialog',
  templateUrl: './item-dialog.component.html',
  styleUrls: ['./item-dialog.component.scss']
})
export class ItemDialogComponent {


  constructor(public dialogRef: MatDialogRef<ItemDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Item) {
    this.data = deepClone(data);
  }

  getTitle(): string {
    if (this.data.id == undefined) {
      return this.data.parentId == undefined ? '新增' : '新增子項';
    } else {
      return '修改 ' + this.data.name;
    }
  }

  save(): void {
    if (this.data.parentId == undefined) {
      this.data.parentId = 0;
    }
    if (this.data.id == undefined) {
      ItemService.insert(this.data);
    } else {
      ItemService.update(this.data);
    }
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
