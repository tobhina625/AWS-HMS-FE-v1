import GenericService from '../g-service';
import type { IAddTreatment, IUpdateTreatment } from './Treatment.dto';

class TreatmentServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getTreatments(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/treatments?${filters}` : 'api/treatments';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching treatments:', error);
      throw error;
    }
  }

  async getTreatmentById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/treatments/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching treatment:', error);
      throw error;
    }
  }

  async getTreatmentsByAdmissionId(admissionId: number, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await this._genericService.get('api/treatments/by-admission', `admissionId=${admissionId}&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching treatments by admission:', error);
      throw error;
    }
  }

  async addTreatment(data: IAddTreatment): Promise<any> {
    try {
      const response = await this._genericService.post('api/treatments/add', data);
      return response;
    } catch (error) {
      console.error('Error adding treatment:', error);
      throw error;
    }
  }

  async updateTreatment(data: IUpdateTreatment): Promise<any> {
    try {
      const response = await this._genericService.put('api/treatments/update', data);
      return response;
    } catch (error) {
      console.error('Error updating treatment:', error);
      throw error;
    }
  }

  async deleteTreatment(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/treatments/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting treatment:', error);
      throw error;
    }
  }

  async bulkDeleteTreatments(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/treatments/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting treatments:', error);
      throw error;
    }
  }
}

export default TreatmentServices;
