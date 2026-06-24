import GenericService from '../g-service';
import type { IAddWard, IEditWard } from './ward.interface';

class WardServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getWards(otherFilters?: string): Promise<any> {
    try {
      const response = await this._genericService.get('api/wards', otherFilters);
      return response;
    } catch (error) {
      console.error('Error Ward List:', error);
      throw error;
    }
  }

  async deleteWard(id: string): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/wards/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error Ward:', error);
      throw error;
    }
  }

  async bulkDeleteWards(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/wards/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting wards:', error);
      throw error;
    }
  }

  async addWard(ward: IAddWard): Promise<any> {
    try {
      const response = await this._genericService.post(`api/wards/add`, ward);
      return response;
    } catch (error) {
      console.error('Error Ward:', error);
      throw error;
    }
  }

  async getWardById(id: string): Promise<any> {
    try {
      const response = await this._genericService.get(`api/wards/${id}`);
      return response;
    } catch (error) {
      console.error('Error Ward Details:', error);
      throw error;
    }
  }

  async updateWard(data: IEditWard): Promise<any> {
    try {
      const response = await this._genericService.put('api/wards/update', data);
      return response;
    } catch (error) {
      console.error('Error Updating Ward:', error);
      throw error;
    }
  }

  async getWardStatistics(): Promise<any> {
    try {
      const response = await this._genericService.get('api/wards/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching ward statistics:', error);
      throw error;
    }
  }

  async getWardBeds(wardId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/wards/${wardId}/beds`);
      return response;
    } catch (error) {
      console.error('Error fetching ward beds:', error);
      throw error;
    }
  }

  async addBedToWard(wardId: number, bedData: any): Promise<any> {
    try {
      const response = await this._genericService.post(`api/wards/${wardId}/beds`, bedData);
      return response;
    } catch (error) {
      console.error('Error adding bed:', error);
      throw error;
    }
  }

  async updateBed(bedId: number, bedData: any): Promise<any> {
    try {
      const response = await this._genericService.put(`api/wards/beds/${bedId}`, bedData);
      return response;
    } catch (error) {
      console.error('Error updating bed:', error);
      throw error;
    }
  }

  async assignBedToPatient(bedId: number, patientId: number): Promise<any> {
    try {
      const response = await this._genericService.post(`api/wards/beds/${bedId}/assign`, patientId);
      return response;
    } catch (error) {
      console.error('Error assigning bed:', error);
      throw error;
    }
  }

  async releaseBed(bedId: number): Promise<any> {
    try {
      const response = await this._genericService.post(`api/wards/beds/${bedId}/release`, {});
      return response;
    } catch (error) {
      console.error('Error releasing bed:', error);
      throw error;
    }
  }

  async getAvailableBeds(withOxygen: boolean = false): Promise<any> {
    try {
      const response = await this._genericService.get(`api/wards/beds/available?withOxygen=${withOxygen}`);
      return response;
    } catch (error) {
      console.error('Error fetching available beds:', error);
      throw error;
    }
  }

  async addBulkBeds(wardId: number, beds: any[]): Promise<any> {
    try {
      const response = await this._genericService.post(`api/wards/${wardId}/beds/bulk`, beds);
      return response;
    } catch (error) {
      console.error('Error bulk adding beds:', error);
      throw error;
    }
  }
}

export default WardServices;
