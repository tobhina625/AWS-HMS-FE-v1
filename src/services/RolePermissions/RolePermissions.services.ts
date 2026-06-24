import GenericService from '../g-service';
import type { IAddRolePermission } from './RolePermissions.interface';

class RolePermissionsServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getRolePermissions(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/rolepermission/${id}`);
      return response;
    } catch (error) {
      console.error('Error Permissions List:', error);
      throw error;
    }
  }

  async addRolePermissions(data: IAddRolePermission): Promise<any> {
    try {
      const response = await this._genericService.post('api/rolepermission/add', data);
      return response;
    } catch (error) {
      console.error('Error Adding Permissions:', error);
      throw error;
    }
  }
}

export default RolePermissionsServices;
