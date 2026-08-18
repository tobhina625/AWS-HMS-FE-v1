import GenericService from '../g-service';
import type { IAddPatientBills, IPatientBills } from '../PatientBill/Patientbill.dto';

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

  async getBillingSummary(searchTerm: string = '', dateFilter: string = ''): Promise<any> {
    try {
      const params = [];
      if (searchTerm) params.push(`searchTerm=${encodeURIComponent(searchTerm)}`);
      if (dateFilter) params.push(`dateFilter=${encodeURIComponent(dateFilter)}`);
      const url = params.length > 0 ? `api/patient-bills/summary?${params.join('&')}` : 'api/patient-bills/summary';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching billing summary:', error);
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

  /**
   * Appends a charge to the single consolidated admission bill (creates it on
   * demand). All charges for an admission accumulate on ONE bill instead of
   * creating separate bills per charge.
   */
  async addChargeToAdmissionBill(admissionId: number, data: { reason: string; totalAmount: number }): Promise<any> {
    try {
      const response = await this._genericService.post(`api/patient-bills/by-admission/${admissionId}/add-charge`, data);
      return response;
    } catch (error) {
      console.error('Error adding charge to admission bill:', error);
      throw error;
    }
  }

  // Update existing patient bill
  async updatePatientBill(data: IPatientBills): Promise<any> {
    try {
      const response = await this._genericService.put('api/patient-bills/update', data);
      return response;
    } catch (error) {
      console.error('Error updating patient bill:', error);
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
