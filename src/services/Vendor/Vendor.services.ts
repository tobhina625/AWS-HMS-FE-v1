import GenericService from '../g-service';
import type { IAddVendor, IUpdateVendor } from './Vendor.dto';

class VendorServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getVendors(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/vendors?${filters}` : 'api/vendors';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  async getVendorById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/vendors/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  }

  async addVendor(data: IAddVendor): Promise<any> {
    try {
      const response = await this._genericService.post('api/vendors/add', data);
      return response;
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  }

  async updateVendor(data: IUpdateVendor): Promise<any> {
    try {
      const response = await this._genericService.put('api/vendors/update', data);
      return response;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  async deleteVendor(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/vendors/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  async bulkDeleteVendors(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/vendors/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting vendors:', error);
      throw error;
    }
  }
}

export default VendorServices;
