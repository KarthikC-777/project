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
    example:""
  })
  readonly name: string;


  @ApiProperty({
    description:"Email adress of the user",
    example:""
  })
  @IsEmail({
    message: 'Enter a valid email address',
  })
  readonly email: string;


  @ApiProperty({
    description:"Password of the user",
    example:""
  })
  @MinLength(8, {
    message: 'Password must have a minimum of 8 characters',
  })
  readonly password: string;


  @ApiProperty({
    description:"Phone Number of the user",
    example:""
  })
  @IsOptional()
  @Length(10, 10, {
    message: 'Phone Number must be of length 10',
  })
  readonly phonenumber: number;


  @ApiProperty({
    description:"Salary of the user",
    example:""
  })
  @IsOptional()
  @IsNumber()
  readonly salary: number;


  
  @IsOptional()
  @IsEnum(UserRole)
  readonly role: string[];

  @ApiProperty({
    description:"Designation of the user",
    example:""
  })
  readonly designation: string;

  @IsOptional()
  @Equals('active', {
    message: 'Account status cannot be changed',
  })
  readonly status: boolean;

  @ApiProperty({
    description:"Adress of the user",
    example:""
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
