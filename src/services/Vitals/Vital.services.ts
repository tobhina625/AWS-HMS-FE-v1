import GenericService from '../g-service';

class VitalServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  getAllByAdmission = async (admissionId: number) => {
    return await this._genericService.get(`admissions/${admissionId}/vitals`);
  };

  getLatest = async (admissionId: number) => {
    return await this._genericService.get(`admissions/${admissionId}/vitals/latest`);
  };

  getToday = async (admissionId: number) => {
    return await this._genericService.get(`admissions/${admissionId}/vitals/today`);
  };

  addVitalRecord = async (admissionId: number, payload: any) => {
    return await this._genericService.post(`admissions/${admissionId}/vitals`, payload);
  };
}

export default VitalServices;
