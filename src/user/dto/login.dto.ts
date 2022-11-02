import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class loginDto {
  @IsEmail({
    message: 'Enter a valid email address',
  })
  readonly email: string;

  @MinLength(8, {
    message: 'Password must have a minimum of 8 characters',
  })
  readonly password: string;
}

export class forgotDto {
  // @IsOptional()
  @IsEmail({
    message: 'Enter a valid email address',
  })
  readonly email: string;
}

export class resetDto {
  @MinLength(8, {
    message: 'Password must have a minimum of 8 characters',
  })
  readonly password: string;
}
