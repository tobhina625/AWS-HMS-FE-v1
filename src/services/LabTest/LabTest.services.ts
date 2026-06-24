import GenericService from '../g-service';
import type { IAddLabTest, IUpdateLabTest } from './LabTest.dto';

class LabTestServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getLabTests(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/lab-tests?${filters}` : 'api/lab-tests';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      throw error;
    }
  }

  async getLabTestById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/lab-tests/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching lab test:', error);
      throw error;
    }
  }

  async addLabTest(data: IAddLabTest): Promise<any> {
    try {
      const response = await this._genericService.post('api/lab-tests/add', data);
      return response;
    } catch (error) {
      console.error('Error adding lab test:', error);
      throw error;
    }
  }

  async updateLabTest(data: IUpdateLabTest): Promise<any> {
    try {
      const response = await this._genericService.put('api/lab-tests/update', data);
      return response;
    } catch (error) {
      console.error('Error updating lab test:', error);
      throw error;
    }
  }

  async deleteLabTest(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/lab-tests/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting lab test:', error);
      throw error;
    }
  }

  async bulkDeleteLabTests(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/lab-tests/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting lab tests:', error);
      throw error;
    }
  }
}

export default LabTestServices;
