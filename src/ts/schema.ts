
import { deepClone } from "./clone";
import { CCache } from "./decorators/cache";

export interface Id {
    id?: number;
}

export interface Role extends Id {
    name: string;
}

export interface RoleItem {
    roleId: number;
    itemId: number;
}

export interface RoleItemApi {
    roleId: number;
    itemId: number;
    apiId: number;
}

export interface Item extends Id {
    parentId: number;
    name: string;
}

export interface ItemNode extends Item {
    children?: ItemNode[];
}

export class Table<T>{

    protected records: T[] = [];
    protected indexs = {};

    constructor(records: T[], private toKey: { (data: T): string | number }) {
        this.records = records;
        this.init();
    }

    private init() {
        this.records.forEach(v => {
            this.indexs[this.toKey(v)] = v;
        })
    }

    public findAll(): T[] {
        return deepClone(this.records);
    }

    public insert(data: T): T {
        let key = this.toKey(data);
        if (this.indexs[key]) return data;
        let clone = deepClone(data);
        this.records.push(clone);
        this.indexs[key] = clone;
        return data;
    }

    public update(data: T): T {
        let key = this.toKey(data);
        let old = this.indexs[key];
        if (!old) return;
        let index = this.records.indexOf(old);
        if (index == -1) return;
        let clone = deepClone(data);
        this.records[index] = clone;
        this.indexs[key] = clone;
        return data;
    }

    public delete(data: T) {
        let key = this.toKey(data);
        let old = this.indexs[key];
        if (!old) return;
        let index = this.records.indexOf(old);
        if (index == -1) return;
        this.records.splice(index, 1);

    }
}

export class AutoTable<T extends Id> extends Table<T>{
    private getMaxId() {
        return this.records[this.records.length - 1]?.id + 1 || 1;
    }

    public insert(data: T): T {
        data.id = this.getMaxId();
        return super.insert(data);
    }
}

class CacheData {
    @CCache.Local<Item[]>('items', defaultItems())
    public static readonly items;
    @CCache.Local<Role[]>('roles', defaultRoles())
    public static readonly roles;
    @CCache.Local<RoleItem[]>('roleItems', defaultRoleItems())
    public static readonly roleItems;
    @CCache.Local<RoleItem[]>('roleItemApis', defaultRoleItemApis())
    public static readonly roleItemApis;
}

export class RoleService {
    private static table = new AutoTable<Role>(CacheData.roles, (data) => data.id);

    public static findAll(): Role[] {
        return RoleService.table.findAll();
    }

    public static insert(data: Role) {
        return RoleService.table.insert(data);
    }

    public static update(data: Role) {
        return RoleService.table.update(data);
    }
    public static delete(data: Role) {
        return RoleService.table.delete(data);
    }
}

export class RoleItemService {
    private static table = new Table<RoleItem>(CacheData.roleItems, (data) => data.roleId + '-' + data.itemId);

    public static findAll(): RoleItem[] {
        return RoleItemService.table.findAll();
    }

    public static findAllByRole(roleId: number): RoleItem[] {
        let result = [];
        RoleItemService.findAll().forEach((v) => {
            if (v.roleId == roleId) {
                result.push(v);
            }
        });
        return result;
    }

    public static insert(data: RoleItem) {
        return RoleItemService.table.insert(data);
    }

    public static modify(data: { roleId: number; inserts: number[]; deletes: number[]; }) {
        data.deletes.forEach(itemId => {
            RoleItemService.table.delete({ roleId: data.roleId, itemId: itemId });
        });
        data.inserts.forEach(itemId => {
            RoleItemService.table.insert({ roleId: data.roleId, itemId: itemId });
        });
    }
}

export class RoleItemApiService {
    private static table = new Table<RoleItemApi>(CacheData.roleItemApis, (data) => data.roleId + '-' + data.itemId + '-' + data.apiId);

    public static findAll(): RoleItemApi[] {
        return RoleItemApiService.table.findAll();
    }

    public static findAllByRole(roleId: number): RoleItemApi[] {
        let result = [];
        RoleItemApiService.findAll().forEach((v) => {
            if (v.roleId == roleId) {
                result.push(v);
            }
        });
        return result;
    }

    public static insert(data: RoleItemApi) {
        return RoleItemApiService.table.insert(data);
    }

    public static modify(data: { roleId: number; inserts: { itemId: number, apiId: number }[]; deletes: { itemId: number, apiId: number }[]; }) {
        data.deletes.forEach(v => {
            RoleItemApiService.table.delete({ roleId: data.roleId, itemId: v.itemId, apiId: v.apiId });
        });
        data.inserts.forEach(v => {
            RoleItemApiService.table.insert({ roleId: data.roleId, itemId: v.itemId, apiId: v.apiId });
        });
    }
}

export class ItemService {
    private static table = new AutoTable<Item>(CacheData.items, (data) => data.id);


    public static toTreeNode(array: ItemNode[]) {
        let nodes = [];
        let childrens = {};
        let t: ItemNode, children: ItemNode[];
        for (let i in array) {
            t = array[i];
            if ((t.children = childrens[t.id]) == undefined) {
                t.children = childrens[t.id] = [];
            }
            if (!t.parentId) {
                nodes.push(t);
            } else {
                if ((children = childrens[t.parentId]) == undefined) {
                    children = childrens[t.parentId] = [];
                }
                children.push(t);
            }
        }
        return nodes;
    }

    public static findAll(): Item[] {
        return ItemService.table.findAll();
    }

    public static insert(data: Item) {
        return ItemService.table.insert(data);
    }

    public static update(data: Item) {
        return ItemService.table.update(data);
    }

    public static delete(data: Item) {
        return ItemService.table.delete(data);
    }

    public static findAllByIds(ids: number[]): RoleItem[] {
        let map = {};
        ids.forEach(i => map[i] = i);
        let result = [];
        ItemService.findAll().forEach((v) => {
            if (map[v.id]) {
                result.push(v);
            }
        });
        return result;
    }
}



function defaultItems(): Item[] {
    return [
        { id: 1, parentId: 0, name: '一廠' }
        , { id: 2, parentId: 0, name: '二廠' }
        , { id: 3, parentId: 0, name: '三廠' }
        , { id: 4, parentId: 1, name: 'A區' }
        , { id: 5, parentId: 1, name: 'B區' }
        , { id: 6, parentId: 1, name: 'C區' }
        , { id: 7, parentId: 1, name: 'D區' }
        , { id: 8, parentId: 2, name: 'A區' }
        , { id: 9, parentId: 2, name: 'B區' }
        , { id: 10, parentId: 2, name: 'C區' }
        , { id: 11, parentId: 3, name: 'D區' }
        , { id: 12, parentId: 4, name: '機台1' }
        , { id: 13, parentId: 4, name: '機台2' }
        , { id: 14, parentId: 5, name: '機台3' }
        , { id: 15, parentId: 8, name: '機台1' }
        , { id: 16, parentId: 8, name: '機台2' }
        , { id: 17, parentId: 8, name: '機台3' }
    ];
}

function defaultRoles(): Role[] {
    return [
        { id: 1, name: '管理者' }
        , { id: 2, name: '一廠長' }
        , { id: 3, name: '二廠長' }
        , { id: 4, name: '總廠長' }
        , { id: 5, name: 'A區主任' }
        , { id: 6, name: '課長' }
    ];
}


function defaultRoleItems(): RoleItem[] {
    return [
        {
            "roleId": 1,
            "itemId": 1
        },
        {
            "roleId": 1,
            "itemId": 2
        },
        {
            "roleId": 1,
            "itemId": 3
        },
        {
            "roleId": 1,
            "itemId": 4
        },
        {
            "roleId": 1,
            "itemId": 5
        },
        {
            "roleId": 1,
            "itemId": 6
        },
        {
            "roleId": 1,
            "itemId": 7
        },
        {
            "roleId": 1,
            "itemId": 8
        },
        {
            "roleId": 1,
            "itemId": 9
        },
        {
            "roleId": 1,
            "itemId": 10
        },
        {
            "roleId": 1,
            "itemId": 11
        },
        {
            "roleId": 1,
            "itemId": 12
        },
        {
            "roleId": 1,
            "itemId": 13
        },
        {
            "roleId": 1,
            "itemId": 14
        },
        {
            "roleId": 1,
            "itemId": 15
        },
        {
            "roleId": 1,
            "itemId": 16
        },
        {
            "roleId": 1,
            "itemId": 17
        },
        {
            "roleId": 2,
            "itemId": 1
        },
        {
            "roleId": 2,
            "itemId": 4
        },
        {
            "roleId": 2,
            "itemId": 12
        },
        {
            "roleId": 2,
            "itemId": 13
        },
        {
            "roleId": 3,
            "itemId": 2
        },
        {
            "roleId": 3,
            "itemId": 8
        },
        {
            "roleId": 3,
            "itemId": 9
        },
        {
            "roleId": 3,
            "itemId": 10
        },
        {
            "roleId": 3,
            "itemId": 15
        },
        {
            "roleId": 3,
            "itemId": 16
        },
        {
            "roleId": 3,
            "itemId": 17
        },
        {
            "roleId": 2,
            "itemId": 5
        },
        {
            "roleId": 2,
            "itemId": 6
        },
        {
            "roleId": 2,
            "itemId": 7
        },
        {
            "roleId": 2,
            "itemId": 14
        },
        {
            "roleId": 4,
            "itemId": 1
        },
        {
            "roleId": 4,
            "itemId": 2
        },
        {
            "roleId": 4,
            "itemId": 3
        },
        {
            "roleId": 4,
            "itemId": 4
        },
        {
            "roleId": 4,
            "itemId": 5
        },
        {
            "roleId": 4,
            "itemId": 6
        },
        {
            "roleId": 4,
            "itemId": 7
        },
        {
            "roleId": 4,
            "itemId": 8
        },
        {
            "roleId": 4,
            "itemId": 9
        },
        {
            "roleId": 4,
            "itemId": 10
        },
        {
            "roleId": 5,
            "itemId": 1
        },
        {
            "roleId": 5,
            "itemId": 4
        },
        {
            "roleId": 5,
            "itemId": 12
        },
        {
            "roleId": 5,
            "itemId": 13
        },
        {
            "roleId": 6,
            "itemId": 1
        },
        {
            "roleId": 6,
            "itemId": 4
        },
        {
            "roleId": 6,
            "itemId": 12
        },
        {
            "roleId": 6,
            "itemId": 13
        }
    ];
}

function defaultRoleItemApis(): RoleItemApi[] {
    return [
        {
            "roleId": 1,
            "itemId": 6,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 6,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 6,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 7,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 7,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 7,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 9,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 9,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 9,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 10,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 10,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 10,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 11,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 11,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 11,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 12,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 12,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 12,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 13,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 13,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 13,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 14,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 14,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 14,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 15,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 15,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 15,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 16,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 16,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 16,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 17,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 17,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 17,
            "apiId": 3
        },
        {
            "roleId": 2,
            "itemId": 12,
            "apiId": 1
        },
        {
            "roleId": 2,
            "itemId": 12,
            "apiId": 2
        },
        {
            "roleId": 2,
            "itemId": 12,
            "apiId": 3
        },
        {
            "roleId": 2,
            "itemId": 13,
            "apiId": 1
        },
        {
            "roleId": 2,
            "itemId": 13,
            "apiId": 2
        },
        {
            "roleId": 2,
            "itemId": 13,
            "apiId": 3
        },
        {
            "roleId": 3,
            "itemId": 9,
            "apiId": 1
        },
        {
            "roleId": 3,
            "itemId": 9,
            "apiId": 2
        },
        {
            "roleId": 3,
            "itemId": 9,
            "apiId": 3
        },
        {
            "roleId": 3,
            "itemId": 10,
            "apiId": 1
        },
        {
            "roleId": 3,
            "itemId": 10,
            "apiId": 2
        },
        {
            "roleId": 3,
            "itemId": 10,
            "apiId": 3
        },
        {
            "roleId": 3,
            "itemId": 15,
            "apiId": 1
        },
        {
            "roleId": 3,
            "itemId": 15,
            "apiId": 2
        },
        {
            "roleId": 3,
            "itemId": 15,
            "apiId": 3
        },
        {
            "roleId": 3,
            "itemId": 16,
            "apiId": 1
        },
        {
            "roleId": 3,
            "itemId": 16,
            "apiId": 2
        },
        {
            "roleId": 3,
            "itemId": 16,
            "apiId": 3
        },
        {
            "roleId": 3,
            "itemId": 17,
            "apiId": 1
        },
        {
            "roleId": 3,
            "itemId": 17,
            "apiId": 2
        },
        {
            "roleId": 3,
            "itemId": 17,
            "apiId": 3
        },
        {
            "roleId": 2,
            "itemId": 6,
            "apiId": 1
        },
        {
            "roleId": 2,
            "itemId": 6,
            "apiId": 2
        },
        {
            "roleId": 2,
            "itemId": 6,
            "apiId": 3
        },
        {
            "roleId": 2,
            "itemId": 7,
            "apiId": 1
        },
        {
            "roleId": 2,
            "itemId": 7,
            "apiId": 2
        },
        {
            "roleId": 2,
            "itemId": 7,
            "apiId": 3
        },
        {
            "roleId": 2,
            "itemId": 14,
            "apiId": 1
        },
        {
            "roleId": 2,
            "itemId": 14,
            "apiId": 2
        },
        {
            "roleId": 2,
            "itemId": 14,
            "apiId": 3
        },
        {
            "roleId": 5,
            "itemId": 12,
            "apiId": 1
        },
        {
            "roleId": 5,
            "itemId": 12,
            "apiId": 2
        },
        {
            "roleId": 5,
            "itemId": 12,
            "apiId": 3
        },
        {
            "roleId": 5,
            "itemId": 13,
            "apiId": 1
        },
        {
            "roleId": 5,
            "itemId": 13,
            "apiId": 2
        },
        {
            "roleId": 5,
            "itemId": 13,
            "apiId": 3
        },
        {
            "roleId": 2,
            "itemId": 1,
            "apiId": 1
        },
        {
            "roleId": 2,
            "itemId": 1,
            "apiId": 2
        },
        {
            "roleId": 2,
            "itemId": 1,
            "apiId": 3
        },
        {
            "roleId": 3,
            "itemId": 2,
            "apiId": 1
        },
        {
            "roleId": 3,
            "itemId": 2,
            "apiId": 2
        },
        {
            "roleId": 3,
            "itemId": 2,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 1,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 1,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 1,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 2,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 2,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 2,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 3,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 3,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 3,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 4,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 4,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 4,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 5,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 5,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 5,
            "apiId": 3
        },
        {
            "roleId": 1,
            "itemId": 8,
            "apiId": 1
        },
        {
            "roleId": 1,
            "itemId": 8,
            "apiId": 2
        },
        {
            "roleId": 1,
            "itemId": 8,
            "apiId": 3
        },
        {
            "roleId": 4,
            "itemId": 1,
            "apiId": 1
        },
        {
            "roleId": 4,
            "itemId": 2,
            "apiId": 1
        },
        {
            "roleId": 4,
            "itemId": 3,
            "apiId": 1
        },
        {
            "roleId": 5,
            "itemId": 4,
            "apiId": 1
        },
        {
            "roleId": 5,
            "itemId": 4,
            "apiId": 2
        },
        {
            "roleId": 5,
            "itemId": 4,
            "apiId": 3
        },
        {
            "roleId": 6,
            "itemId": 12,
            "apiId": 1
        },
        {
            "roleId": 6,
            "itemId": 12,
            "apiId": 2
        },
        {
            "roleId": 6,
            "itemId": 12,
            "apiId": 3
        },
        {
            "roleId": 6,
            "itemId": 13,
            "apiId": 1
        },
        {
            "roleId": 6,
            "itemId": 13,
            "apiId": 2
        },
        {
            "roleId": 6,
            "itemId": 13,
            "apiId": 3
        },
        {
            "roleId": 2,
            "itemId": 4,
            "apiId": 1
        },
        {
            "roleId": 2,
            "itemId": 4,
            "apiId": 2
        },
        {
            "roleId": 2,
            "itemId": 4,
            "apiId": 3
        },
        {
            "roleId": 2,
            "itemId": 5,
            "apiId": 1
        },
        {
            "roleId": 2,
            "itemId": 5,
            "apiId": 2
        },
        {
            "roleId": 2,
            "itemId": 5,
            "apiId": 3
        },
        {
            "roleId": 3,
            "itemId": 8,
            "apiId": 1
        },
        {
            "roleId": 3,
            "itemId": 8,
            "apiId": 2
        },
        {
            "roleId": 3,
            "itemId": 8,
            "apiId": 3
        }
    ];
}