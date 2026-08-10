import GenericService from '../g-service';
import type { IPatientLabs, ICreateLabOrder, IUpdateLabResult } from './PatientLabs.interface';

class PatientLabsService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getAll(status: string = '', branchId: number = 0, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-labs?status=${status}&branchId=${branchId}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lab orders:', error);
      throw error;
    }
  }

  async getByPatientId(patientId: number): Promise<IPatientLabs[]> {
    try {
      const response = await this._genericService.get(`api/patient-labs/by-patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient lab orders:', error);
      throw error;
    }
  }

  async getByEncounterId(encounterId: number): Promise<IPatientLabs[]> {
    try {
      // The backend exposes GetAll with a historyId filter (there is no /by-encounter route).
      const response = await this._genericService.get(`api/patient-labs?historyId=${encounterId}&size=100`);
      const data = response as any;
      return Array.isArray(data) ? data : data?.content || data?.data || [];
    } catch (error) {
      console.error('Error fetching encounter lab orders:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<IPatientLabs> {
    try {
      const response = await this._genericService.get(`api/patient-labs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lab order details:', error);
      throw error;
    }
  }

  async createLabOrder(data: ICreateLabOrder): Promise<IPatientLabs> {
    try {
      const response = await this._genericService.post('api/patient-labs/order', data);
      return response.data;
    } catch (error) {
      console.error('Error creating lab order:', error);
      throw error;
    }
  }

  async updateLabResult(data: IUpdateLabResult): Promise<IPatientLabs> {
    try {
      const response = await this._genericService.put('api/patient-labs/result', data);
      return response.data;
    } catch (error) {
      console.error('Error updating lab result:', error);
      throw error;
    }
  }
}

export default PatientLabsService;
