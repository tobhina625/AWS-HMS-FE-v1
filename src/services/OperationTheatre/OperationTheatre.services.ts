// services/OperationTheatre/OperationTheatre.services.ts

import GenericService from '../g-service';
import type { IAddOperationTheatre, IUpdateOperationTheatre, ITheatreStatistics, ITheatreSchedule, IAddTheatreSchedule } from './OperationTheatre.dto';

class OperationTheatreService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  // Get all operation theatres
  async getOperationTheatres(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/operation-theatres?${filters}` : 'api/operation-theatres';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching operation theatres:', error);
      throw error;
    }
  }

  // Get operation theatre by ID
  async getOperationTheatreById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/operation-theatres/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching operation theatre by ID:', error);
      throw error;
    }
  }

  // Add new operation theatre
  async addOperationTheatre(data: IAddOperationTheatre): Promise<any> {
    try {
      const response = await this._genericService.post('api/operation-theatres/add', data);
      return response;
    } catch (error) {
      console.error('Error adding operation theatre:', error);
      throw error;
    }
  }

  // Update existing operation theatre
  async updateOperationTheatre(data: IUpdateOperationTheatre): Promise<any> {
    try {
      const response = await this._genericService.put('api/operation-theatres/update', data);
      return response;
    } catch (error) {
      console.error('Error updating operation theatre:', error);
      throw error;
    }
  }

  // Delete operation theatre by ID
  async deleteOperationTheatreById(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/operation-theatres/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting operation theatre:', error);
      throw error;
    }
  }

  // Bulk delete operation theatres
  async bulkDeleteOperationTheatres(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/operation-theatres/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting operation theatres:', error);
      throw error;
    }
  }

  // Get theatre statistics
  async getTheatreStatistics(): Promise<ITheatreStatistics> {
    try {
      const response = await this._genericService.get('api/operation-theatres/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching theatre statistics:', error);
      throw error;
    }
  }

  // Get schedules for a specific theatre
  async getTheatreSchedules(theatreId: number): Promise<ITheatreSchedule[]> {
    try {
      const response = await this._genericService.get(`api/operation-theatres/${theatreId}/schedules`);
      return response.data;
    } catch (error) {
      console.error('Error fetching theatre schedules:', error);
      throw error;
    }
  }

  // Get today's schedules
  async getTodaySchedules(): Promise<ITheatreSchedule[]> {
    try {
      const response = await this._genericService.get('api/operation-theatres/schedules/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today schedules:', error);
      throw error;
    }
  }

  // Get upcoming schedules
  async getUpcomingSchedules(): Promise<ITheatreSchedule[]> {
    try {
      const response = await this._genericService.get('api/operation-theatres/schedules/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming schedules:', error);
      throw error;
    }
  }

  // Add new schedule
  async addSchedule(theatreId: number, data: IAddTheatreSchedule): Promise<any> {
    try {
      const response = await this._genericService.post(`api/operation-theatres/${theatreId}/schedules`, data);
      return response;
    } catch (error) {
      console.error('Error adding schedule:', error);
      throw error;
    }
  }

  // Update schedule
  async updateSchedule(scheduleId: number, data: Partial<ITheatreSchedule>): Promise<any> {
    try {
      const response = await this._genericService.put(`api/operation-theatres/schedules/${scheduleId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  // Start surgery
  async startSurgery(scheduleId: number): Promise<any> {
    try {
      const response = await this._genericService.post(`api/operation-theatres/schedules/${scheduleId}/start`, {});
      return response;
    } catch (error) {
      console.error('Error starting surgery:', error);
      throw error;
    }
  }

  // Complete surgery
  async completeSurgery(scheduleId: number): Promise<any> {
    try {
      const response = await this._genericService.post(`api/operation-theatres/schedules/${scheduleId}/complete`, {});
      return response;
    } catch (error) {
      console.error('Error completing surgery:', error);
      throw error;
    }
  }

  // Cancel schedule
  async cancelSchedule(scheduleId: number, reason: string): Promise<any> {
    try {
      const response = await this._genericService.post(`api/operation-theatres/schedules/${scheduleId}/cancel`, reason);
      return response;
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      throw error;
    }
  }

  // Get schedules by date range
  async getSchedulesByDateRange(startDate: string, endDate: string): Promise<ITheatreSchedule[]> {
    try {
      const response = await this._genericService.get(`api/operation-theatres/schedules/date-range?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules by date range:', error);
      throw error;
    }
  }
}

export default OperationTheatreService;
