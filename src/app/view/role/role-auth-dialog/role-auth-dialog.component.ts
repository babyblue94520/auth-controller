import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Item, ItemNode, ItemService, Role, RoleItemApiService, RoleItemService } from 'ts/schema';


interface AuthItemNode extends ItemNode {
  checked?: boolean;
  apis?: { [key: number]: boolean };
}

@Component({
  selector: 'app-role-auth-dialog',
  templateUrl: './role-auth-dialog.component.html',
  styleUrls: ['./role-auth-dialog.component.scss']
})
export class RoleAuthDialogComponent {
  public treeControl = new NestedTreeControl<ItemNode>(node => node.children);

  public dataSource = new MatTreeNestedDataSource<ItemNode>();

  public items: AuthItemNode[];

  constructor(public dialogRef: MatDialogRef<RoleAuthDialogComponent>, @Inject(MAT_DIALOG_DATA) public role: Role) {
    this.items = ItemService.findAll();
    let roleItems = RoleItemService.findAllByRole(role.id);
    let roleItemApis = RoleItemApiService.findAllByRole(role.id);
    this.dataSource.data = ItemService.toTreeNode(this.items);
    let checkeds = {};
    let apis = {};
    roleItems.forEach(v => checkeds[v.itemId] = true);
    roleItemApis.forEach(v => {
      let t = apis[v.itemId];
      if (!t) {
        t = apis[v.itemId] = {};
      }
      t[v.apiId] = true;
    });
    this.items.forEach(v => {
      v.checked = checkeds[v.id];
      v.apis = apis[v.id] || {};
    });
  }

  public hasChild = (_: number, node: ItemNode) => node.children.length > 0;


  public save(): void {
    let roleItmes = {
      roleId: this.role.id
      , inserts: []
      , deletes: []
    };
    let roleItmeApis = {
      roleId: this.role.id
      , inserts: []
      , deletes: []
    };
    this.items.forEach(v => {
      if (v.checked == true) {
        roleItmes.inserts.push(v.id);
      } else if (v.checked == false) {
        roleItmes.deletes.push(v.id);
      }
      for (let i in v.apis) {
        if (v.apis[i] == true) {
          roleItmeApis.inserts.push({ itemId: v.id, apiId: i });
        } else {
          roleItmeApis.deletes.push({ itemId: v.id, apiId: i });
        }
      }
    });


    RoleItemService.modify(roleItmes);
    RoleItemApiService.modify(roleItmeApis);
    this.dialogRef.close();
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
