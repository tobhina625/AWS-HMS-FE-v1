import GenericService from '../g-service';

class DepartmentsServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getDepartments(page = 0, size = 5): Promise<any> {
    try {
      const response = await this._genericService.get(`api/departments?&page=${page}&size=${size}`);
      return response;
    } catch (error) {
      console.error('Error Departments List:', error);
      throw error;
    }
  }
}
export default DepartmentsServices;
