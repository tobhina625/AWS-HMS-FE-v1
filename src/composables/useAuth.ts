import { ref, computed } from 'vue';
import type { UserData } from '../services/Authentication/Signin.dto';

interface JwtPayload {
  nameid?: string;
  unique_name?: string;
  email?: string;
  role?: string | string[];
  exp?: number;
  iss?: string;
  aud?: string;
}

export function useAuth() {
  const getUser = (): UserData | null => {
    const userStr = localStorage.getItem('hms-user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as UserData;
    } catch {
      return null;
    }
  };

  const getToken = (): string | null => {
    return localStorage.getItem('hms-token');
  };

  const decodeToken = (token: string): JwtPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const getUserId = (): number | null => {
    const token = getToken();
    if (!token) return null;

    const payload = decodeToken(token);
    if (!payload || !payload.nameid) return null;

    return parseInt(payload.nameid, 10);
  };

  const isTokenExpired = (): boolean => {
    const token = getToken();
    if (!token) return true;

    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  };

  const isAuthenticated = computed(() => {
    const token = getToken();
    if (!token) return false;
    return !isTokenExpired();
  });

  const user = ref<UserData | null>(getUser());

  const hasRole = (role: string): boolean => {
    const userData = getUser();
    if (!userData) return false;
    return userData.roles.some((r) => r.toLowerCase() === role.toLowerCase());
  };

  const hasAnyRole = (roles: string[]): boolean => {
    const userData = getUser();
    if (!userData) return false;
    return roles.some((role) => userData.roles.some((r) => r.toLowerCase() === role.toLowerCase()));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    const userData = getUser();
    if (!userData) return false;
    return roles.every((role) => userData.roles.some((r) => r.toLowerCase() === role.toLowerCase()));
  };

  const refreshUser = () => {
    user.value = getUser();
  };

  const updateUserData = (userData: UserData) => {
    localStorage.setItem('hms-user', JSON.stringify(userData));
    user.value = userData;
  };

  const logout = () => {
    localStorage.removeItem('hms-token');
    localStorage.removeItem('hms-user');
    localStorage.removeItem('hms-permissions');
    localStorage.removeItem('hms-is-admin');
    user.value = null;
  };

  const getTokenExpirationTime = (): Date | null => {
    const token = getToken();
    if (!token) return null;

    const payload = decodeToken(token);
    if (!payload || !payload.exp) return null;

    return new Date(payload.exp * 1000);
  };

  return {
    user,
    isAuthenticated,
    getUser,
    getToken,
    getUserId,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    refreshUser,
    updateUserData,
    isTokenExpired,
    getTokenExpirationTime,
    logout,
  };
}
