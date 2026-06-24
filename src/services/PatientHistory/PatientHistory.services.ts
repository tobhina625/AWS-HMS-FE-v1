import GenericService from '../g-service';
import type { IPatientHistory } from './PatientHistory.interface';

class PatientHistoryServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async addPatientHistory(data: IPatientHistory): Promise<any> {
    try {
      const response = await this._genericService.post('api/patient-histories/add', data);
      return response;
    } catch (error) {
      console.error('Error Adding Patient History:', error);
      throw error;
    }
  }

  async getPatientHistoryByPatientId(patientId: number, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-histories/by-patient?id=${patientId}&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient history:', error);
      throw error;
    }
  }

  async getPatientHistoryWithDetails(id: number, includeDetails: string = ''): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-histories/with-details?id=${id}&includeDetails=${includeDetails}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient history details:', error);
      throw error;
    }
  }

  async updatePatientHistory(data: any): Promise<any> {
    try {
      const response = await this._genericService.put('api/patient-histories/update', data);
      return response;
    } catch (error) {
      console.error('Error updating patient history:', error);
      throw error;
    }
  }

  async deletePatientHistory(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/patient-histories/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting patient history:', error);
      throw error;
    }
  }

  async updatePrescription(id: number, prescriptions: any[]): Promise<any> {
    try {
      const response = await this._genericService.put(`api/patient-histories/update-prescription/${id}`, prescriptions);
      return response;
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  }
}

export default PatientHistoryServices;
