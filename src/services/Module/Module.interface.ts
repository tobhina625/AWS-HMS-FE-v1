export interface IModule {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  route?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface IModuleCreate {
  name: string;
  description?: string;
  icon?: string;
  route?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface IModuleUpdate {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  route?: string;
  displayOrder: number;
  isActive: boolean;
}
