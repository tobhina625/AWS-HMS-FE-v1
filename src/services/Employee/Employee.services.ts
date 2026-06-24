import GenericService from '../g-service';
import type { IAddEmployee, IUpdateEmployee, IEmployeeShift } from './Employee.interface';

class EmployeesServices {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async getEmployees(otherFilters?: string): Promise<any> {
    try {
      const response = await this._genericService.get('api/employees', otherFilters);
      return response;
    } catch (error) {
      console.error('Error Employees List:', error);
      throw error;
    }
  }

  async getEmployeesByRole(roleId: number, otherFilters?: string): Promise<any> {
    try {
      const urlParam = otherFilters ? `id=${roleId}&${otherFilters}` : `id=${roleId}`;
      const response = await this._genericService.get('api/employees/by-role', urlParam);
      return response;
    } catch (error) {
      console.error('Error Employees List:', error);
      throw error;
    }
  }

  async getEmployeesByDesignation(designationId: number, otherFilters?: string): Promise<any> {
    try {
      const urlParam = otherFilters ? `id=${designationId}&${otherFilters}` : `id=${designationId}`;
      const response = await this._genericService.get('api/employees/by-designation', urlParam);
      return response;
    } catch (error) {
      console.error('Error fetching employees by designation:', error);
      throw error;
    }
  }

  async getEmployeesById(id: string): Promise<any> {
    try {
      const response = await this._genericService.get(`api/employees/${id}`);
      return response;
    } catch (error) {
      console.error('Error Employee Details:', error);
      throw error;
    }
  }

  async deleteEmployeeById(id: string): Promise<any> {
    try {
      const response = await this._genericService.delete(`api/employees/delete?id=${id}`);
      return response;
    } catch (error) {
      console.error('Error Deleting Employee:', error);
      throw error;
    }
  }

  async bulkDeleteEmployees(ids: number[]): Promise<any> {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await this._genericService['makeRequest'](`${baseUrl}/api/employees/bulk-delete`, 'DELETE', ids);
      return response;
    } catch (error) {
      console.error('Error bulk deleting employees:', error);
      throw error;
    }
  }

  async getEmployeesByName(name: string): Promise<any> {
    try {
      const response = await this._genericService.get('api/employees', `searchTerm=${name}`);
      return response;
    } catch (error) {
      console.error('Error Employees List:', error);
      throw error;
    }
  }

  async addEmployee(data: IAddEmployee): Promise<any> {
    try {
      const response = await this._genericService.post('api/employees/add', data);
      return response;
    } catch (error) {
      console.error('Error Adding Employee:', error);
      throw error;
    }
  }

  async updateEmployee(data: IUpdateEmployee): Promise<any> {
    try {
      const response = await this._genericService.put('api/employees/update', data);
      return response;
    } catch (error) {
      console.error('Error Updating Employee:', error);
      throw error;
    }
  }

  async getEmployeeStatistics(): Promise<any> {
    try {
      const response = await this._genericService.get('api/employees/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching employee statistics:', error);
      throw error;
    }
  }

  async getEmployeeShifts(employeeId: number): Promise<any> {
    try {
      const response = await this._genericService.get(`api/employees/${employeeId}/shifts`);
      return response;
    } catch (error) {
      console.error('Error fetching employee shifts:', error);
      throw error;
    }
  }

  async getTodayShifts(): Promise<any> {
    try {
      const response = await this._genericService.get('api/employees/shifts/today');
      return response;
    } catch (error) {
      console.error('Error fetching today shifts:', error);
      throw error;
    }
  }

  async getUpcomingShifts(): Promise<any> {
    try {
      const response = await this._genericService.get('api/employees/shifts/upcoming');
      return response;
    } catch (error) {
      console.error('Error fetching upcoming shifts:', error);
      throw error;
    }
  }

  async addShift(employeeId: number, data: IEmployeeShift): Promise<any> {
    try {
      const response = await this._genericService.post(`api/employees/${employeeId}/shifts`, data);
      return response;
    } catch (error) {
      console.error('Error adding shift:', error);
      throw error;
    }
  }

  async updateShift(shiftId: number, data: IEmployeeShift): Promise<any> {
    try {
      const response = await this._genericService.put(`api/employees/shifts/${shiftId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  }

  async startShift(shiftId: number): Promise<any> {
    try {
      const response = await this._genericService.post(`api/employees/shifts/${shiftId}/start`, {});
      return response;
    } catch (error) {
      console.error('Error starting shift:', error);
      throw error;
    }
  }

  async endShift(shiftId: number): Promise<any> {
    try {
      const response = await this._genericService.post(`api/employees/shifts/${shiftId}/end`, {});
      return response;
    } catch (error) {
      console.error('Error ending shift:', error);
      throw error;
    }
  }

  async cancelShift(shiftId: number, reason: string): Promise<any> {
    try {
      const response = await this._genericService.post(`api/employees/shifts/${shiftId}/cancel`, reason);
      return response;
    } catch (error) {
      console.error('Error cancelling shift:', error);
      throw error;
    }
  }

  async getShiftsByDateRange(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await this._genericService.get('api/employees/shifts/date-range', `startDate=${startDate}&endDate=${endDate}`);
      return response;
    } catch (error) {
      console.error('Error fetching shifts by date range:', error);
      throw error;
    }
  }

  async getShiftsByDepartment(departmentId: number): Promise<any> {
    try {
      const response = await this._genericService.get('api/employees/shifts/by-department', `departmentId=${departmentId}`);
      return response;
    } catch (error) {
      console.error('Error fetching shifts by department:', error);
      throw error;
    }
  }
}

export default EmployeesServices;
