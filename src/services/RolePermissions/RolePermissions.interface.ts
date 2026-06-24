export interface IRole {
  id: number;
  name: string;
}

export interface IPermission {
  id: number;
  name: string;
  isAdd: boolean;
  isView: boolean;
  isEdit: boolean;
  isDelete: boolean;
}

export interface IAddRolePermission {
  Role: IRole;
  Permission: IPermission[];
}
