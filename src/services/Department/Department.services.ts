import GenericService from '../g-service';
import type { IAddDepartment, IUpdateDepartment } from './Department.dto';

class DepartmentsServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getDepartments(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/departments?${filters}` : 'api/departments';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error Department List:', error);
      throw error;
    }
  }

  async addDepartment(data: IAddDepartment): Promise<any> {
    try {
      const response = await this._genericService.post('api/departments/add', data);
      return response;
    } catch (error) {
      console.error('Error Adding Department:', error);
      throw error;
    }
  }

  async getDepartmentById(id: string): Promise<any> {
    try {
      const response = await this._genericService.get(`api/departments/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  }

  async updateDepartment(data: IUpdateDepartment): Promise<any> {
    try {
      const response = await this._genericService.put('api/departments/update', data);
      return response;
    } catch (error) {
      console.error('Error Updating Department:', error);
      throw error;
    }
  }

  async deleteDepartmentById(id: string): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/departments/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error Deleting Department:', error);
      throw error;
    }
  }

  async bulkDeleteDepartments(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/departments/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting departments:', error);
      throw error;
    }
  }

  async getDepartmentStatistics(): Promise<any> {
    try {
      const response = await this._genericService.get('api/departments/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      throw error;
    }
  }
}

export default DepartmentsServices;
