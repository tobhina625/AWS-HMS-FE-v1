import GenericService from '../g-service';
import type { IPatientPayment } from './Patientpayment.dto';

class PatientPaymentService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async recordPayment(payment: IPatientPayment): Promise<any> {
    try {
      const response = await this._genericService.post('api/patient-payments/add', payment);
      return response;
    } catch (error) {
      console.error('Error recording patient payment:', error);
      throw error;
    }
  }

  async getPaymentsByBillId(billId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/patient-payments/by-bill/${billId}`);
      return response;
    } catch (error) {
      console.error('Error fetching patient payments:', error);
      throw error;
    }
  }
}

export default PatientPaymentService;
