export interface IRole {
  id: number;
  name: string;
}

export interface IAddRole {
  name: string;
}

export interface IUpdateRole extends IAddRole {
  id: number;
}
