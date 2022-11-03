import { Equals, IsEnum, IsNumber, IsOptional, Length } from 'class-validator';
import { UserRole } from '../user.schema';

export class UpdateDto {
  readonly userId: string;

  readonly name: string;

  @IsOptional()
  @Length(10, 10, {
    message: 'Phone Number must be of length 10',
  })
  readonly phonenumber: number;

  @IsOptional()
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

  readonly address: string;

  @IsOptional()
  @IsNumber()
  readonly availableLeaves: number;
}
