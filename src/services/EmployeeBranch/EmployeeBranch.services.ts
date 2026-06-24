import GService from '../g-service';

export interface EmployeeBranchDto {
  id: number;
  employeeId: number;
  employeeName: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  assignmentType: string;
  requireLocationVerification: boolean;
  assignedFrom?: string;
  assignedTo?: string;
}

export interface AssignEmployeeToBranchDto {
  employeeId: number;
  branchId: number;
  assignmentType: number;
  requireLocationVerification: boolean;
  assignedFrom?: string;
  assignedTo?: string;
}

class EmployeeBranchService extends GService {
  async getByEmployeeId(employeeId: number) {
    return this.get(`api/employee-branches/employee/${employeeId}`);
  }

  async getByBranchId(branchId: number) {
    return this.get(`api/employee-branches/branch/${branchId}`);
  }

  async checkAssignment(employeeId: number, branchId: number) {
    return this.get(`api/employee-branches/check?employeeId=${employeeId}&branchId=${branchId}`);
  }

  async assignEmployee(data: AssignEmployeeToBranchDto) {
    return this.post('api/employee-branches/assign', data);
  }

  async updateAssignment(id: number, data: Partial<AssignEmployeeToBranchDto>) {
    return this.put(`api/employee-branches/update/${id}`, data);
  }

  async removeAssignment(employeeId: number, branchId: number) {
    return this.delete(`api/employee-branches/remove?employeeId=${employeeId}&branchId=${branchId}`);
  }
}

export default new EmployeeBranchService();
