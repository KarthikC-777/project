import { MinLength } from 'class-validator';

export class resetDto {
  @MinLength(8, {
    message: 'Password must have a minimum of 8 characters',
  })
  readonly password: string;
}
