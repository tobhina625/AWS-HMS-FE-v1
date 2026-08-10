import GenericService from '../g-service';
import type { IPrescription } from './Prescription.interface';

class PrescriptionService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getByPatientId(patientId: number): Promise<IPrescription[]> {
    try {
      const response = await this._genericService.get(`api/prescriptions/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      throw error;
    }
  }

  async getByEncounterId(encounterId: number): Promise<IPrescription[]> {
    try {
      // The backend exposes GetAll with a historyId filter (there is no /by-encounter route).
      const response = await this._genericService.get(`api/prescriptions?historyId=${encounterId}&size=100`);
      const data = response as any;
      return Array.isArray(data) ? data : data?.content || data?.data || [];
    } catch (error) {
      console.error('Error fetching encounter prescriptions:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<IPrescription> {
    try {
      const response = await this._genericService.get(`api/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      throw error;
    }
  }

  async create(data: IPrescription): Promise<IPrescription> {
    try {
      const response = await this._genericService.post('api/prescriptions/add', data);
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  async update(id: number, data: IPrescription): Promise<IPrescription> {
    try {
      const response = await this._genericService.put(`api/prescriptions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const response = await this._genericService.delete(`api/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  }
}

export default PrescriptionService;
