import GenericService from '../g-service';
import type { IPermissionCreate, IPermissionUpdate } from './Permission.interface';

class PermissionServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getAllPermissions(): Promise<any> {
    try {
      const response = await this._genericService.get('api/permission');
      return response;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  async getPermissionById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/permission/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching permission:', error);
      throw error;
    }
  }

  async getPermissionsByModuleId(moduleId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/permission/by-module/${moduleId}`);
      return response;
    } catch (error) {
      console.error('Error fetching permissions by module:', error);
      throw error;
    }
  }

  async addPermission(data: IPermissionCreate): Promise<any> {
    try {
      const response = await this._genericService.post('api/permission/add', data);
      return response;
    } catch (error) {
      console.error('Error adding permission:', error);
      throw error;
    }
  }

  async updatePermission(data: IPermissionUpdate): Promise<any> {
    try {
      const response = await this._genericService.put('api/permission/update', data);
      return response;
    } catch (error) {
      console.error('Error updating permission:', error);
      throw error;
    }
  }

  async deletePermission(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/permission/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting permission:', error);
      throw error;
    }
  }
}

export default PermissionServices;
