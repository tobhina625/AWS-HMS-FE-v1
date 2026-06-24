import GenericService from '../g-service';

class DoctorsChatService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getDoctorsinfo(page = 0, size = 5): Promise<any> {
    try {
      const response = await this._genericService.get(`api/employees/by-role?id=2&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error Doctors Chat List:', error);
      throw error;
    }
  }
}

export default DoctorsChatService;
