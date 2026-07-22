import GenericService from '../g-service';
import type { IPatientAllergy } from './PatientAllergy.interface';

class PatientAllergyService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getByPatientId(patientId: number): Promise<IPatientAllergy[]> {
    try {
      const response = await this._genericService.get(`api/patient-allergies/by-patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient allergies:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<IPatientAllergy> {
    try {
      const response = await this._genericService.get(`api/patient-allergies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient allergy:', error);
      throw error;
    }
  }

  async create(data: IPatientAllergy): Promise<IPatientAllergy> {
    try {
      const response = await this._genericService.post('api/patient-allergies', data);
      return response.data;
    } catch (error) {
      console.error('Error creating patient allergy:', error);
      throw error;
    }
  }

  async update(id: number, data: IPatientAllergy): Promise<IPatientAllergy> {
    try {
      const response = await this._genericService.put(`api/patient-allergies/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating patient allergy:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const response = await this._genericService.delete(`api/patient-allergies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient allergy:', error);
      throw error;
    }
  }
}

export default PatientAllergyService;
