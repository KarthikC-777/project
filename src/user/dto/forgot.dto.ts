import { IsEmail } from 'class-validator';

export class forgotDto {
  // @IsOptional()
  @IsEmail({
    message: 'Enter a valid email address',
  })
  readonly email: string;
}
