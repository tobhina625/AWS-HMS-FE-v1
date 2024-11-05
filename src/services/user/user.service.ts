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
}

export default UserService;
