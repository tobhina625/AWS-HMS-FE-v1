import GenericService from '../g-service';
import { SignInDto } from './Signin.dto';

class AutenticationService {
  private readonly _genericService: GenericService;

  constructor() {
    this._genericService = new GenericService();
  }

  async signInUser(userCredential: SignInDto, IsPatient: boolean = false): Promise<any> {
    try {
      const response = await this._genericService.post(`api/account/login?IsPatient=${IsPatient}`, userCredential);
      return response;
    } catch (error) {
      console.error('Error Signin:', error);
      throw error;
    }
  }

  async verifyLocation(locationData: { latitude: number; longitude: number }, token: string): Promise<any> {
    try {
      // Get employee branches to check which branch to verify against
      const branchesResponse = await this._genericService.get('api/account/employee-branches', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (branchesResponse.isSuccess && branchesResponse.data && branchesResponse.data.length > 0) {
        // Get the first branch (primary branch)
        const primaryBranch = branchesResponse.data.find((b: any) => b.assignmentType === 'Primary') || branchesResponse.data[0];

        // Verify location against this branch
        const verificationData = {
          branchId: primaryBranch.branchId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };

        const response = await this._genericService.post('api/account/verify-location', verificationData);
        return response;
      }

      // No branches assigned, skip verification
      return {
        isSuccess: true,
        data: {
          isWithinRange: true,
          distance: 0,
          allowedRadius: null,
          message: 'No branch verification required',
        },
      };
    } catch (error) {
      console.error('Error verifying location:', error);
      throw error;
    }
  }
}

export default AutenticationService;
