import {
  Equals,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  Length,
  MinLength,
} from 'class-validator';
import { UserDesignation, UserRole } from '../user.schema';

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

  @IsOptional()
  @Length(10, 10, {
    message: 'Phone Number must be of length 10',
  })
  readonly phonenumber: number;

  @IsNumber()
  readonly salary: number;

  @IsOptional()
  @IsEnum(UserRole)
  readonly role: string[];

  readonly designation: string;

  @IsOptional()
  @Equals('active', {
    message: 'Account status cannot be changed',
  })
  readonly status: boolean;
  @Length(2, 30, {
    message: 'Provide proper address',
  })
  readonly address: string;

  @IsOptional()
  @IsNumber()
  @Equals('', {
    message: 'availableLeaves is not accessible',
  })
  readonly availableLeaves: number;
}
