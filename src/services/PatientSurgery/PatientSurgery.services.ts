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

  // Note: No delete endpoint available for patient surgeries
}

export default PatientSurgeryServices;
