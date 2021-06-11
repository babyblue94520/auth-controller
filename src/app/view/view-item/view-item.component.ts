import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Inject } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ItemNode, ItemService, Role, RoleItemApiService, RoleItemService, RoleService } from 'ts/schema';


interface AuthItemNode extends ItemNode {
  checked?: boolean;
  apis?: { [key: number]: boolean };
}

@Component({
  selector: 'app-view-item',
  templateUrl: './view-item.component.html',
  styleUrls: ['./view-item.component.scss']
})
export class ViewItemComponent {
  public treeControl = new NestedTreeControl<ItemNode>(node => node.children);

  public dataSource = new MatTreeNestedDataSource<ItemNode>();

  public items: AuthItemNode[];

  public roles: Role[];
  public role;

  constructor() {
    this.roles = RoleService.findAll();
  }

  public hasChild = (_: number, node: ItemNode) => node.children.length > 0;

  public queryItem() {
    if (!this.role) return;
    this.items = [];
    let array: AuthItemNode[] = ItemService.findAll();
    let roleItems = RoleItemService.findAllByRole(this.role.id);
    let roleItemApis = RoleItemApiService.findAllByRole(this.role.id);
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
    array.forEach(v => {
      if (checkeds[v.id]) {
        this.items.push(v);
        v.apis = apis[v.id] || {};
      }
    });
    this.dataSource = new MatTreeNestedDataSource<ItemNode>();
    this.dataSource.data = ItemService.toTreeNode(this.items);
  }
}
