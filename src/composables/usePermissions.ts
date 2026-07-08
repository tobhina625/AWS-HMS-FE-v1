import { ref, computed } from 'vue';
import { useAuth } from './useAuth';
import RolePermissionsServices from '@/services/RolePermissions/RolePermissions.services';

export interface UserPermission {
  id: number;
  name: string;
  isAdd: boolean;
  isView: boolean;
  isEdit: boolean;
  isDelete: boolean;
  isList: boolean;
}

export function usePermissions() {
  const { getUser, hasRole } = useAuth();
  const rolePermissionService = new RolePermissionsServices();

  const permissions = ref<UserPermission[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadUserPermissions = async () => {
    const user = getUser();
    if (!user) {
      error.value = 'User not authenticated';
      console.error('No user found in localStorage');
      return;
    }

    // Admin users have all permissions
    if (hasRole('Admin') || hasRole('SuperAdmin') || hasRole('System Administrator') || hasRole('Hospital Administrator')) {
      localStorage.setItem('hms-is-admin', 'true');
      return;
    } else {
      localStorage.removeItem('hms-is-admin');
    }

    // ── Fast path: permissions already stored from login response ──────────
    const storedPerms = getStoredPermissions();
    if (storedPerms.length > 0) {
      permissions.value = storedPerms;
      return;
    }

    // ── Fallback: fetch permissions from API (role-based) ──────────────────
    loading.value = true;
    error.value = null;

    try {
      const userDesignations = user.designations || [];

      if (userDesignations.length === 0) {
        error.value = 'User has no assigned roles';
        console.error('No designations found for user');
        return;
      }

      const firstDesignation = userDesignations[0];
      const roleId = (firstDesignation.role?.id as number | undefined) || (firstDesignation as any).roleId;

      if (!roleId) {
        error.value = 'Invalid role configuration';
        console.error('No role ID found in designation');
        return;
      }

      const response = await rolePermissionService.getRolePermissions(roleId);

      if (response.isSuccess) {
        permissions.value = response.data.permission || [];
        localStorage.setItem('hms-permissions', JSON.stringify(permissions.value));
      } else {
        error.value = response.error || 'Failed to load permissions';
        console.error('Failed to load permissions:', response.error);
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while loading permissions';
      console.error('Error loading permissions:', err);
    } finally {
      loading.value = false;
    }
  };

  const getStoredPermissions = (): UserPermission[] => {
    const stored = localStorage.getItem('hms-permissions');
    if (!stored) return [];

    try {
      return JSON.parse(stored) as UserPermission[];
    } catch {
      return [];
    }
  };

  const isAdmin = (): boolean => {
    return localStorage.getItem('hms-is-admin') === 'true' || hasRole('Admin') || hasRole('SuperAdmin') || hasRole('System Administrator') || hasRole('Hospital Administrator');
  };

  const hasPermission = (moduleName: string, action?: 'add' | 'view' | 'edit' | 'delete' | 'list'): boolean => {
    // Admin users have all permissions
    if (isAdmin()) {
      return true;
    }

    const userPermissions = permissions.value.length > 0 ? permissions.value : getStoredPermissions();

    const permission = userPermissions.find((p) => p.name.toLowerCase() === moduleName.toLowerCase());

    if (!permission) return false;

    if (!action) {
      // If no specific action, check if user has any permission for this module
      return permission.isList || permission.isView || permission.isAdd || permission.isEdit || permission.isDelete;
    }

    switch (action) {
      case 'list':
        return permission.isList;
      case 'add':
        return permission.isAdd;
      case 'view':
        return permission.isView;
      case 'edit':
        return permission.isEdit;
      case 'delete':
        return permission.isDelete;
      default:
        return false;
    }
  };

  // For sidebar visibility: user must have isList (can see the listing page)
  // OR isView (can view individual records) — either grants sidebar access.
  const canViewModule = (moduleName: string): boolean => {
    if (isAdmin()) return true;
    return hasPermission(moduleName, 'list') || hasPermission(moduleName, 'view');
  };

  const canAddToModule = (moduleName: string): boolean => {
    return hasPermission(moduleName, 'add');
  };

  const canEditModule = (moduleName: string): boolean => {
    return hasPermission(moduleName, 'edit');
  };

  const canDeleteFromModule = (moduleName: string): boolean => {
    return hasPermission(moduleName, 'delete');
  };

  const clearPermissions = () => {
    permissions.value = [];
    localStorage.removeItem('hms-permissions');
    localStorage.removeItem('hms-is-admin');
  };

  const userPermissions = computed(() => (permissions.value.length > 0 ? permissions.value : getStoredPermissions()));

  const canListModule = (moduleName: string): boolean => {
    return hasPermission(moduleName, 'list');
  };

  return {
    permissions: userPermissions,
    loading,
    error,
    loadUserPermissions,
    hasPermission,
    canViewModule,
    canListModule,
    canAddToModule,
    canEditModule,
    canDeleteFromModule,
    clearPermissions,
    isAdmin,
  };
}
