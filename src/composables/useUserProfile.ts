import { ref } from 'vue';
import UserService from '@/services/user/user.service';
import { useAuth } from './useAuth';

export function useUserProfile() {
  const userService = new UserService();
  const { updateUserData } = useAuth();

  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCurrentUser = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.getCurrentUser();

      if (response.isSuccess) {
        const userData = response.data;

        // Update localStorage with fresh data
        updateUserData({
          userName: userData.name,
          email: userData.email,
          roles: userData.designations?.map((d: any) => d.role?.name).filter(Boolean) || [],
          designations: userData.designations || [],
        });

        return userData;
      } else {
        error.value = response.error || 'Failed to fetch user profile';
        return null;
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching profile';
      console.error('Error fetching current user:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrentUser = async (userDetails: any) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.updateCurrentUser(userDetails);

      if (response.isSuccess) {
        // Refresh user data after update
        await fetchCurrentUser();
        return true;
      } else {
        error.value = response.error || 'Failed to update profile';
        return false;
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while updating profile';
      console.error('Error updating user:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchMyAppointments = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.getMyAppointments();

      if (response.isSuccess) {
        return response.data;
      } else {
        error.value = response.error || 'Failed to fetch appointments';
        return [];
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching appointments';
      console.error('Error fetching appointments:', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchMyPatients = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await userService.getMyPatients();

      if (response.isSuccess) {
        return response.data;
      } else {
        error.value = response.error || 'Failed to fetch patients';
        return [];
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching patients';
      console.error('Error fetching patients:', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    fetchCurrentUser,
    updateCurrentUser,
    fetchMyAppointments,
    fetchMyPatients,
  };
}
