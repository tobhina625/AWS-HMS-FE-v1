import GenericService from '../g-service';
import type { IPatientDiagnosis } from './PatientDiagnosis.interface';

class PatientDiagnosisService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getByPatientId(patientId: number): Promise<IPatientDiagnosis[]> {
    try {
      const response = await this._genericService.get(`api/patient-diagnoses/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient diagnoses:', error);
      throw error;
    }
  }

  async getByEncounterId(encounterId: number): Promise<IPatientDiagnosis[]> {
    try {
      const response = await this._genericService.get(`api/patient-diagnoses/by-encounter/${encounterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching encounter diagnoses:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<IPatientDiagnosis> {
    try {
      const response = await this._genericService.get(`api/patient-diagnoses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching diagnosis details:', error);
      throw error;
    }
  }

  async create(data: IPatientDiagnosis): Promise<IPatientDiagnosis> {
    try {
      const response = await this._genericService.post('api/patient-diagnoses', data);
      return response.data;
    } catch (error) {
      console.error('Error creating patient diagnosis:', error);
      throw error;
    }
  }

  async update(id: number, data: IPatientDiagnosis): Promise<IPatientDiagnosis> {
    try {
      const response = await this._genericService.put(`api/patient-diagnoses/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating patient diagnosis:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const response = await this._genericService.delete(`api/patient-diagnoses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient diagnosis:', error);
      throw error;
    }
  }
}

export default PatientDiagnosisService;
