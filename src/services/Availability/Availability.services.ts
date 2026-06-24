import GenericService from '../g-service';
import type { IAddAvailability, IUpdateAvailability, IEmployeeAvailabilityDetail } from './Availability.dto';

class AvailabilityServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getAvailabilities(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/availability?${filters}` : 'api/availability';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      throw error;
    }
  }

  async getAvailabilityById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/availability/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  }

  async getAvailabilitiesByEmployee(employeeId: number): Promise<IEmployeeAvailabilityDetail> {
    try {
      const response = await this._genericService.get(`api/availability/by-employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee availabilities:', error);
      throw error;
    }
  }

  async addAvailability(data: IAddAvailability): Promise<any> {
    try {
      const response = await this._genericService.post('api/availability/add_availability', data);
      return response;
    } catch (error) {
      console.error('Error adding availability:', error);
      throw error;
    }
  }

  async addMultipleAvailabilities(data: IAddAvailability[]): Promise<any> {
    try {
      const response = await this._genericService.post('api/availability/add-multiple-availabilities', data);
      return response;
    } catch (error) {
      console.error('Error adding multiple availabilities:', error);
      throw error;
    }
  }

  async updateAvailability(data: IUpdateAvailability): Promise<any> {
    try {
      const response = await this._genericService.put('api/availability/update-availability', data);
      return response;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  }

  async deleteAvailability(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/availability/delete-Availability?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting availability:', error);
      throw error;
    }
  }

  async bulkDeleteAvailabilities(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/availability/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting availabilities:', error);
      throw error;
    }
  }
}

export default AvailabilityServices;
