import GService from '../g-service';

export interface BranchDto {
  id: number;
  name: string;
  code: string;
  address: string;
  city?: string;
  phoneNumber?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  allowedRadiusMeters?: number;
  branchHeadId?: number;
  branchHeadName?: string;
  requireLocationLogin: boolean;
  status: string;
  employeeCount: number;
}

export interface CreateBranchDto {
  name: string;
  code: string;
  address: string;
  city?: string;
  phoneNumber?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  allowedRadiusMeters?: number;
  branchHeadId?: number;
  requireLocationLogin: boolean;
  status: number;
}

export interface LocationVerificationDto {
  branchId: number;
  latitude: number;
  longitude: number;
}

export interface LocationVerificationResultDto {
  isWithinRange: boolean;
  distance: number;
  allowedRadius?: number;
  message: string;
}

class BranchService extends GService {
  async getAllBranches(page: number = 0, size: number = 10, sort: string = '', searchTerm: string = '') {
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (size) params.append('size', size.toString());
    if (sort) params.append('sort', sort);
    if (searchTerm) params.append('searchTerm', searchTerm);

    return this.get(`api/branches?${params.toString()}`);
  }

  async getBranchById(id: number) {
    return this.get(`api/branches/${id}`);
  }

  async getBranchByCode(code: string) {
    return this.get(`api/branches/code/${code}`);
  }

  async getBranchEmployees(id: number) {
    return this.get(`api/branches/${id}/employees`);
  }

  async addBranch(branch: CreateBranchDto) {
    return this.post('api/branches/add', branch);
  }

  async updateBranch(id: number, branch: CreateBranchDto) {
    return this.put(`api/branches/update/${id}`, branch);
  }

  async deleteBranch(id: number) {
    return this.delete(`api/branches/delete/${id}`);
  }

  async verifyLocation(data: LocationVerificationDto) {
    return this.post('api/account/verify-location', data);
  }

  async getCurrentUserBranches() {
    return this.get('api/account/employee-branches');
  }
}

export default new BranchService();
