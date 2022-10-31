import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './entities/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    try {
      const request = context.switchToHttp().getRequest();
      if (request.cookies['userlogoutcookie'] === undefined) {
        throw new HttpException('please Login again ', HttpStatus.UNAUTHORIZED);
      }
      const verify = this.jwtService.verify(request.cookies.userlogoutcookie);
      if (!verify) {
        throw new HttpException(
          'Unauthorized admin User error ',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return requiredRoles.some((role) => verify.role?.includes(role));
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
