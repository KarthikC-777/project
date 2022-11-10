import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class loginDto {

  @ApiProperty({
    description:"Email of the user",
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
}
