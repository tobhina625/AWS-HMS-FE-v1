import GenericService from '../g-service';

class VitalServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  getAllByAdmission = async (admissionId: number) => {
    return await this._genericService.get(`api/admissions/${admissionId}/vitals`);
  };

  getLatest = async (admissionId: number) => {
    return await this._genericService.get(`api/admissions/${admissionId}/vitals/latest`);
  };

  getToday = async (admissionId: number) => {
    return await this._genericService.get(`api/admissions/${admissionId}/vitals/today`);
  };

  addVitalRecord = async (admissionId: number, payload: any) => {
    return await this._genericService.post(`api/admissions/${admissionId}/vitals`, payload);
  };

  deleteVitalRecord = async (admissionId: number, vitalId: number) => {
    return await this._genericService.delete(`api/admissions/${admissionId}/vitals/${vitalId}`);
  };
}

export default VitalServices;
