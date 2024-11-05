/**
 * User DTO (Data Transfer Object)
 * @description User DTO is utilized to validate the user create request data before invoking the API call.
 * Used at the beginning of the process.
 */
export class CreateUserDto {
  readonly email!: string;

  readonly firstName!: string;

  readonly lastName!: string;

  readonly phoneNumber!: string;

  readonly address?: string;

  readonly role?: string;

  readonly registration_status?: string;

  readonly verificationLink?: string;

  readonly profilePic?: string;

  readonly resetPasswordCode?: string;
}
