import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsEmail, IsEnum, IsNumber, IsOptional, Length } from 'class-validator';
import { UserRole } from '../user.schema';

export class UpdateDto {
  @ApiProperty({
    description:"User Unique ID",
    example:"YML001"
  })
  readonly userId: string;

  @ApiProperty({
    description:"Name of the user",
    example:"Dave"
  })
  readonly name: string;


  @ApiProperty({
    description:"Designation of the user",
    example:"EM"
  })
  readonly designation: string;

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

  
  @IsOptional()
  @Equals('active', {
    message: 'Account status cannot be changed',
  })
  readonly status: boolean;

  @IsOptional()
  @Length(2, 30, {
    message: 'Provide proper address',
  })
  readonly address: string;

  @IsOptional()
  @IsNumber()
  readonly availableLeaves: number;
}
