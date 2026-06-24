export interface IEmployee {
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

export interface IAddEmployeePermission {
  employee: IEmployee;
  permissions: IPermission[];
}
