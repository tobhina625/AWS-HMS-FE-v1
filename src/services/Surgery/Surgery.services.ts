import GenericService from '../g-service';
import type { IAddSurgery, IEditSurgery } from './Surgery.dto';

class SurgeryService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getSurgeries(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/surgeries?${filters}` : 'api/surgeries';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching surgeries:', error);
      throw error;
    }
  }

  async getSurgeryById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/surgeries/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching surgery by ID:', error);
      throw error;
    }
  }

  async getSurgeriesByDepartment(departmentId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/surgeries/by-department/${departmentId}`);
      return response;
    } catch (error) {
      console.error('Error fetching surgeries by department:', error);
      throw error;
    }
  }

  async addSurgery(data: IAddSurgery): Promise<any> {
    try {
      const response = await this._genericService.post('api/surgeries/add', data);
      return response;
    } catch (error) {
      console.error('Error adding surgery:', error);
      throw error;
    }
  }

  async updateSurgery(data: IEditSurgery): Promise<any> {
    try {
      const response = await this._genericService.put('api/surgeries/update', data);
      return response;
    } catch (error) {
      console.error('Error updating surgery:', error);
      throw error;
    }
  }

  async deleteSurgeryById(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/surgeries/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting surgery:', error);
      throw error;
    }
  }

  async bulkDeleteSurgeries(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/surgeries/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting surgeries:', error);
      throw error;
    }
  }

  async getSurgeryStatistics(): Promise<any> {
    try {
      const response = await this._genericService.get('api/surgeries/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching surgery statistics:', error);
      throw error;
    }
  }
}

export default SurgeryService;
