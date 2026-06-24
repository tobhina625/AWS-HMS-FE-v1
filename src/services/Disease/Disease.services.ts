import GenericService from '../g-service';
import type { IAddDisease, IUpdateDisease } from './Disease.dto';

class DiseasesServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getDiseases(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/diseases?${filters}` : 'api/diseases';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error Disease List:', error);
      throw error;
    }
  }

  async addDisease(data: IAddDisease): Promise<any> {
    try {
      const response = await this._genericService.post('api/diseases/add', data);
      return response;
    } catch (error) {
      console.error('Error Adding Disease:', error);
      throw error;
    }
  }

  async getDiseaseById(id: string): Promise<any> {
    try {
      const response = await this._genericService.get(`api/diseases/${id}`);
      return response;
    } catch (error) {
      console.error('Error Getting Disease By ID:', error);
      throw error;
    }
  }

  async updateDisease(data: IUpdateDisease): Promise<any> {
    try {
      const response = await this._genericService.put('api/diseases/update', data);
      return response;
    } catch (error) {
      console.error('Error Updating Disease:', error);
      throw error;
    }
  }

  async deleteDiseaseById(id: string): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/diseases/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error Deleting Disease:', error);
      throw error;
    }
  }

  async bulkDeleteDiseases(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/diseases/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting diseases:', error);
      throw error;
    }
  }

  async getDiseaseStatistics(): Promise<any> {
    try {
      const response = await this._genericService.get('api/diseases/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching disease statistics:', error);
      throw error;
    }
  }
}

export default DiseasesServices;
