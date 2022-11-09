import { IsOptional, Length } from 'class-validator';

export class EmployeeDto {
  readonly name: string;
  @IsOptional()
  @Length(10, 10, {
    message: 'Phone Number must be of length 10',
  })
  readonly phonenumber: number;
  @Length(2, 30, {
    message: 'Provide proper address',
  })
  readonly address: string;
}
