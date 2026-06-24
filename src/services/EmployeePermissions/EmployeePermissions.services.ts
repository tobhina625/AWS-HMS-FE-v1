import GenericService from '../g-service';
import type { IAddEmployeePermission } from './EmployeePermissions.interface';

class EmployeePermissionsServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getEmployeesPermissions(empId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/employeepermission/${empId}`);
      return response;
    } catch (error) {
      console.error('Error Permissions List:', error);
      throw error;
    }
  }

  async addEmployeePermissions(data: IAddEmployeePermission): Promise<any> {
    try {
      const response = await this._genericService.post('api/employeepermission/add', data);
      return response;
    } catch (error) {
      console.error('Error Adding Permissions:', error);
      throw error;
    }
  }
}

export default EmployeePermissionsServices;
