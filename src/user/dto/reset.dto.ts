import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class resetDto {

  @ApiProperty({
    description:"Password of the user",
    example:"Qzw@170.xz"
  })
  @MinLength(8, {
    message: 'Password must have a minimum of 8 characters',
  })
  readonly password: string;
}
