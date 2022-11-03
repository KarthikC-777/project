import { IsOptional, Length } from 'class-validator';

export class EmployeeDto {
  readonly name: string;
  @IsOptional()
  @Length(10, 10, {
    message: 'Phone Number must be of length 10',
  })
  readonly phonenumber: number;

  readonly address: string;
}
