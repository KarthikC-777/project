import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class EmployeeDto {

  @ApiProperty({
    description:"Name of the user",
    example:""
  })
  readonly name: string;

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
    description:"Adress of the user",
    example:""
  })
  @Length(2, 30, {
    message: 'Provide proper address',
  })
  readonly address: string;
}
