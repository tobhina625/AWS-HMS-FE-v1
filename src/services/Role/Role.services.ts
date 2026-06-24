import GenericService from '../g-service';
import type { IAddRole, IUpdateRole } from './Role.dto';

class RoleServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getRoles(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/role?${filters}` : 'api/role';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  async getRoleById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/role/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  async addRole(data: IAddRole): Promise<any> {
    try {
      const response = await this._genericService.post('api/role/add', data);
      return response;
    } catch (error) {
      console.error('Error adding role:', error);
      throw error;
    }
  }

  async updateRole(data: IUpdateRole): Promise<any> {
    try {
      const response = await this._genericService.put('api/role/update', data);
      return response;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/role/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  async bulkDeleteRoles(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/role/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting roles:', error);
      throw error;
    }
  }
}

export default RoleServices;
