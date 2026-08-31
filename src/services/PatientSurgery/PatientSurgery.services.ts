import GenericService from '../g-service';
import type { IAddPatientSurgery, IUpdatePatientSurgery } from './PatientSurgery.dto';

class PatientSurgeryServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getPatientSurgeries(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/patient-surgeries?${filters}` : 'api/patient-surgeries';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching patient surgeries:', error);
      throw error;
    }
  }

  async getPatientSurgeryById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-surgeries/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient surgery:', error);
      throw error;
    }
  }

  async getPatientSurgeriesByAdmissionId(admissionId: number, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await this._genericService.get('api/patient-surgeries/by-admission', `admissionId=${admissionId}&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient surgeries by admission:', error);
      throw error;
    }
  }

  async getPatientSurgeriesByPatientId(patientId: number, page: number = 0, size: number = 100): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-surgeries/by-patient/${patientId}`, `page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient surgeries by patient:', error);
      throw error;
    }
  }

  async addPatientSurgery(data: IAddPatientSurgery): Promise<any> {
    try {
      const response = await this._genericService.post('api/patient-surgeries/add', data);
      return response;
    } catch (error) {
      console.error('Error adding patient surgery:', error);
      throw error;
    }
  }

  async updatePatientSurgery(data: IUpdatePatientSurgery): Promise<any> {
    try {
      const response = await this._genericService.put('api/patient-surgeries/update', data);
      return response;
    } catch (error) {
      console.error('Error updating patient surgery:', error);
      throw error;
    }
  }

  async updateSurgeryStatus(id: number, status: string): Promise<any> {
    try {
      const response = await this._genericService.put(`api/patient-surgeries/${id}/status`, status);
      return response;
    } catch (error) {
      console.error('Error updating surgery status:', error);
      throw error;
    }
  }

  async getSurgeriesByTheatre(theatreId: number, page: number = 0, size: number = 100): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-surgeries/by-theatre/${theatreId}`, `page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching surgeries by theatre:', error);
      throw error;
    }
  }

  async deletePatientSurgery(id: number | string): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/patient-surgeries/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting patient surgery:', error);
      throw error;
    }
  }

  async bulkDeletePatientSurgeries(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/patient-surgeries/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting patient surgeries:', error);
      throw error;
    }
  }
}

export default PatientSurgeryServices;
