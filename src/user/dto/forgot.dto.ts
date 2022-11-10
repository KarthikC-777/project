import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class forgotDto {

  @ApiProperty({
    description:"Email of the user",
    example:"john@email.com"
  })
  @IsEmail({
    message: 'Enter a valid email address',
  })
  readonly email: string;
}
