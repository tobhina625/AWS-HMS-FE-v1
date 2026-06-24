import GenericService from '../g-service';
import type { IAddEmployeeDesignation, IUpdateEmployeeDesignation } from './EmployeeDesignation.dto';

class EmployeeDesignationServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getEmployeeDesignations(filters: string = ''): Promise<any> {
    try {
      const url = filters ? `api/employee-designations?${filters}` : 'api/employee-designations';
      const response = await this._genericService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching employee designations:', error);
      throw error;
    }
  }

  async getEmployeeDesignationById(id: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/employee-designations/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching employee designation:', error);
      throw error;
    }
  }

  async getEmployeeDesignationsByEmployeeId(employeeId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/employee-designations?employeeId=${employeeId}`);
      return response;
    } catch (error) {
      console.error('Error fetching employee designations by employee:', error);
      throw error;
    }
  }

  async addEmployeeDesignation(data: IAddEmployeeDesignation): Promise<any> {
    try {
      const response = await this._genericService.post('api/employee-designations/add', data);
      return response;
    } catch (error) {
      console.error('Error adding employee designation:', error);
      throw error;
    }
  }

  async updateEmployeeDesignation(data: IUpdateEmployeeDesignation): Promise<any> {
    try {
      const response = await this._genericService.put('api/employee-designations/update', data);
      return response;
    } catch (error) {
      console.error('Error updating employee designation:', error);
      throw error;
    }
  }

  async deleteEmployeeDesignation(id: number): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/employee-designations/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting employee designation:', error);
      throw error;
    }
  }
}

export default EmployeeDesignationServices;
