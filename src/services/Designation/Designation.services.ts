import GenericService from '../g-service';
import type { IAddDesignation, IUpdateDesignation } from './Designation.dto';

class DesignationsService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getDesignations(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/designation?${filters}` : 'api/designation';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching designations:', error);
      throw error;
    }
  }

  async getDesignationById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/designation/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching designation by ID:', error);
      throw error;
    }
  }

  async getDesignationsByRole(roleId: number, otherFilters?: string): Promise<any> {
    try {
      const base = `api/designation/by-role?roleId=${roleId}`;
      const url = otherFilters ? `${base}&${otherFilters}` : base;
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching designations by role:', error);
      throw error;
    }
  }

  async addDesignation(data: IAddDesignation): Promise<any> {
    try {
      const response = await this._genericService.post('api/designation/add', data);
      return response;
    } catch (error) {
      console.error('Error adding designation:', error);
      throw error;
    }
  }

  async updateDesignation(data: IUpdateDesignation): Promise<any> {
    try {
      const response = await this._genericService.put('api/designation/update', data);
      return response;
    } catch (error) {
      console.error('Error updating designation:', error);
      throw error;
    }
  }

  async deleteDesignationbyId(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/designation/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting designation:', error);
      throw error;
    }
  }

  async bulkDeleteDesignations(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/designation/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting designations:', error);
      throw error;
    }
  }

  async getDesignationStatistics(): Promise<any> {
    try {
      const response = await this._genericService.get('api/designation/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching designation statistics:', error);
      throw error;
    }
  }
}

export default DesignationsService;
