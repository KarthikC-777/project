import {
  Equals,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  Length,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user.schema';

export class UserDto {
  readonly userId: string;

  readonly name: string;

  @IsEmail({
    message: 'Enter a valid email address',
  })
  readonly email: string;

  @MinLength(8, {
    message: 'Password must have a minimum of 8 characters',
  })
  readonly password: string;

  @Length(10, 10, {
    message: 'Phone Number must be of length 10',
  })
  readonly phonenumber: number;

  @IsNumber()
  readonly salary: number;

  // @IsEnum(UserRole)
  // @Equals('user', {
  //   message: 'role cannot be changed',
  // })
  readonly role: string[];

  readonly designation: string;

  @IsOptional()
  @Equals('active', {
    message: 'Account status cannot be changed',
  })
  readonly status: boolean;

  readonly address: string;

  @IsOptional()
  @IsNumber()
  @Equals('', {
    message: 'availableLeaves is not accessible',
  })
  readonly availableLeaves: number;
}

export class EmployeeDto {
  readonly name: string;

  @IsEmail({
    message: 'Enter a valid email address',
  })
  readonly email: string;
  readonly phonenumber: number;
  readonly address: string;
}
