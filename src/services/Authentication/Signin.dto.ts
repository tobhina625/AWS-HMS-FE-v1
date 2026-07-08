/**
 * User DTO (Data Transfer Object)
 * @description Sign In DTO is utilized to validate the sign in credentials.
 * Used at the beginning of the process.
 */
export class SignInDto {
  readonly email!: string;

  readonly password!: string;
}

export interface DesignationDto {
  id: number;
  name: string;
  role?: {
    id: number;
    name: string;
  };
}

export interface UserPermissionDto {
  id: number;
  name: string;
  isAdd: boolean;
  isView: boolean;
  isEdit: boolean;
  isDelete: boolean;
  isList: boolean;
}

export interface LoginResponseDto {
  token: string;
  userName: string;
  email: string;
  roles: string[];
  designations: DesignationDto[];
  permissions: UserPermissionDto[];
}

export interface UserData {
  userName: string;
  email: string;
  roles: string[];
  designations: DesignationDto[];
}
