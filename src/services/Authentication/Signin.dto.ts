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

export interface LoginResponseDto {
  token: string;
  userName: string;
  email: string;
  roles: string[];
  designations: DesignationDto[];
}

export interface UserData {
  userName: string;
  email: string;
  roles: string[];
  designations: DesignationDto[];
}
