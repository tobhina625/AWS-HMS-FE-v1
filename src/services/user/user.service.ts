import GenericService from '../g-service';
import { CreateUserDto } from './user.dto';

class UserService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async createUser(userDetails: CreateUserDto): Promise<any> {
    try {
      const response = await this._genericService.post('api/trpc/user.create', userDetails);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await this._genericService.get('api/account/me');
      return response;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async updateCurrentUser(userDetails: any): Promise<any> {
    try {
      const response = await this._genericService.put('api/account/me', userDetails);
      return response;
    } catch (error) {
      console.error('Error updating current user:', error);
      throw error;
    }
  }

  async getMyAppointments(): Promise<any> {
    try {
      const response = await this._genericService.get('api/appointments/my-appointments');
      return response;
    } catch (error) {
      console.error('Error fetching my appointments:', error);
      throw error;
    }
  }

  async getMyPatients(): Promise<any> {
    try {
      const response = await this._genericService.get('api/patient-histories/my-patients');
      return response;
    } catch (error) {
      console.error('Error fetching my patients:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    try {
      const response = await this._genericService.post('api/account/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default UserService;
