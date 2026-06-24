import GenericService from '../g-service';
import type { IAddPatient, IEditPatient } from './patient.interface';

class PatientServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getPatientById(id: string): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patients/${id}`);
      return response;
    } catch (error) {
      console.error('Error Patient:', error);
      throw error;
    }
  }

  async getPatients(otherFilters?: string): Promise<any> {
    try {
      const response = await this._genericService.get('api/patients', otherFilters);
      return response;
    } catch (error) {
      console.error('Error Patient List:', error);
      throw error;
    }
  }

  async getWards(otherFilters?: string): Promise<any> {
    try {
      const response = await this._genericService.get('api/wards', otherFilters);
      return response;
    } catch (error) {
      console.error('Error Patient List:', error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/patients/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  async bulkDeletePatients(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/patients/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting patients:', error);
      throw error;
    }
  }

  async addPatient(patient: IAddPatient): Promise<any> {
    try {
      const response = await this._genericService.post(`api/patients/add`, patient);
      return response;
    } catch (error) {
      console.error('Error Patient:', error);
      throw error;
    }
  }

  async updatePatient(patient: IEditPatient): Promise<any> {
    try {
      const response = await this._genericService.put(`api/patients/update`, patient);
      return response;
    } catch (error) {
      console.error('Error Patient:', error);
      throw error;
    }
  }

  async getPatientStatistics(otherFilters?: string): Promise<any> {
    try {
      const response = await this._genericService.get('api/patients/statistics', otherFilters);
      return response;
    } catch (error) {
      console.error('Error fetching patient statistics:', error);
      throw error;
    }
  }
}

export default PatientServices;
