export interface IPermission {
  id: number;
  name: string;
  isAdd: boolean;
  isView: boolean;
  isEdit: boolean;
  isDelete: boolean;
}

export interface IPermissionCreate {
  moduleId: number;
  canAdd: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface IPermissionUpdate {
  id: number;
  moduleId: number;
  canAdd: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}
