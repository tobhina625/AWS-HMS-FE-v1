import GenericService from '../g-service';
import type { IAddPatientBills } from '../PatientBill/Patientbill.dto';

class PatientBillsService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getPatientBills(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/patient-bills?${filters}` : 'api/patient-bills';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching patient bills:', error);
      throw error;
    }
  }

  async getPatientBillsByPatientId(patientId: number, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await this._genericService.get('api/patient-bills/by-patient', `id=${patientId}&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient bills by patient:', error);
      throw error;
    }
  }

  async getPatientBillsByAdmissionId(admissionId: number, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await this._genericService.get('api/patient-bills/by-admission', `admissionId=${admissionId}&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient bills by admission:', error);
      throw error;
    }
  }

  async getPatientBillsID(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-bills/${id}`);
      return response;
    } catch (error) {
      console.error('Error Patient bill List:', error);
      throw error;
    }
  }
  // Add new operation theatre
  async addPatientBills(data: IAddPatientBills): Promise<any> {
    try {
      const response = await this._genericService.post('api/patient-bills/add', data);
      return response;
    } catch (error) {
      console.error('Error adding patient bills:', error);
      throw error;
    }
  }

  async deletePatientBill(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/patient-bills/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting patient bill:', error);
      throw error;
    }
  }
}

export default PatientBillsService;
