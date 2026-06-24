import GenericService from '../g-service';
import type { IAddAppointment, IUpdateAppointment } from './appointment.interface';

class AppointmentServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getAppointments(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/appointments?${filters}` : 'api/appointments';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async getAppointmentById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/appointments/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  }

  async getAppointmentsByPatientId(patientId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/appointments/by-patient/${patientId}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  }

  async getMyAppointments(): Promise<any> {
    try {
      const response = await this._genericService.get('api/appointments/my-appointments');
      return response;
    } catch (error) {
      console.error('Error fetching my appointments:', error);
      throw error;
    }
  }

  async addAppointment(data: IAddAppointment): Promise<any> {
    try {
      const response = await this._genericService.post('api/appointments/add', data);
      return response;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  }

  async updateAppointment(data: IUpdateAppointment): Promise<any> {
    try {
      const response = await this._genericService.put('api/appointments/update', data);
      return response;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async deleteAppointmentById(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/appointments/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  async bulkDeleteAppointments(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/appointments/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting appointments:', error);
      throw error;
    }
  }

  async getAppointmentStatistics(): Promise<any> {
    try {
      const response = await this._genericService.get('api/appointments/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching appointment statistics:', error);
      throw error;
    }
  }

  async getAppointmentsByDate(date: string): Promise<any> {
    try {
      const response = await this._genericService.get(`api/appointments/by-date?date=${date}`);
      return response;
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      throw error;
    }
  }

  async getAvailableDoctors(departmentId: number, date: string, startTime: string): Promise<any> {
    const q = new URLSearchParams({
      departmentId: String(departmentId),
      date,
      startTime,
    });
    return this._genericService.get(`api/appointments/available-doctors?${q.toString()}`);
  }

  async getAvailableSlots(employeeId: number, startDate: string, endDate: string): Promise<any> {
    const q = new URLSearchParams({
      startDate,
      endDate,
    });
    return this._genericService.get(`api/appointments/available-slots/${employeeId}?${q.toString()}`);
  }
}

export default AppointmentServices;
