import GenericService from '../g-service';
import type { IAddAdmission, IUpdateAdmission, IAdmissionQueueSummary } from './Admission.dto';

class AdmissionServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getAdmissions(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/admissions?${filters}` : 'api/admissions';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching admissions:', error);
      throw error;
    }
  }

  async getQueueSummary(): Promise<IAdmissionQueueSummary | null> {
    try {
      const response = (await this._genericService.get('api/admissions/queue-summary')) as {
        data?: IAdmissionQueueSummary;
        Data?: IAdmissionQueueSummary;
        isSuccess?: boolean;
      };
      const payload = response.data ?? response.Data;
      return payload ?? null;
    } catch (error) {
      console.error('Error fetching admission queue summary:', error);
      throw error;
    }
  }

  async getAdmissionById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/admissions/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching admission:', error);
      throw error;
    }
  }

  async addAdmission(data: IAddAdmission): Promise<any> {
    try {
      const response = await this._genericService.post('api/admissions/add', data);
      return response;
    } catch (error) {
      console.error('Error adding admission:', error);
      throw error;
    }
  }

  async updateAdmission(data: IUpdateAdmission): Promise<any> {
    try {
      const response = await this._genericService.put('api/admissions/update', data);
      return response;
    } catch (error) {
      console.error('Error updating admission:', error);
      throw error;
    }
  }

  async deleteAdmission(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/admissions/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting admission:', error);
      throw error;
    }
  }

  async bulkDeleteAdmissions(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/admissions/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting admissions:', error);
      throw error;
    }
  }
}

export default AdmissionServices;
