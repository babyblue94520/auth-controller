import { NestedTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Item, ItemNode, ItemService } from 'ts/schema';
import { ItemDialogComponent } from '../item-dialog/item-dialog.component';


@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent {
  public treeControl = new NestedTreeControl<ItemNode>(node => node.children);

  public dataSource;

  constructor(public dialog: MatDialog) {
    this.query();
  }

  public hasChild = (_: number, node: ItemNode) => node.children.length > 0;

  public query() {
    this.dataSource = new MatTreeNestedDataSource<ItemNode>();
    this.dataSource.data = ItemService.toTreeNode(ItemService.findAll());
  }

  public add() {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.query();
    });
  }

  public mofidy(item: ItemNode) {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '250px',
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      this.query();
    });
  }

  public remove(item: ItemNode) {
    ItemService.delete(item);
    this.query();
  }

  public addSub(parent: ItemNode) {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '250px',
      data: { parentId: parent.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.query();
    });
  }
}
