import { ApiProperty } from '@nestjs/swagger';
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



  @ApiProperty({
    description:"Name of the user",
    example:"John"
  })
  readonly name: string;


  @ApiProperty({
    description:"Email address of the user",
    example:"john@email.com"
  })
  @IsEmail({
    message: 'Enter a valid email address',
  })
  readonly email: string;


  @ApiProperty({
    description:"Password of the user",
    example:"Qzw@170.xz"
  })
  @MinLength(8, {
    message: 'Password must have a minimum of 8 characters',
  })
  readonly password: string;


  @ApiProperty({
    description:"Phone Number of the user",
    example:"9000477890"
  })
  @IsOptional()
  @Length(10, 10, {
    message: 'Phone Number must be of length 10',
  })
  readonly phonenumber: number;


  @ApiProperty({
    description:"Salary of the user",
    example:"100000"
  })
  @IsOptional()
  @IsNumber()
  readonly salary: number;


  
  @IsOptional()
  @IsEnum(UserRole)
  readonly role: string[];

  @ApiProperty({
    description:"Designation of the user",
    example:"ASE"
  })
  readonly designation: string;

  @IsOptional()
  @Equals('active', {
    message: 'Account status cannot be changed',
  })
  readonly status: boolean;

  @ApiProperty({
    description:"Address of the user",
    example:"California, US"
  })
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
