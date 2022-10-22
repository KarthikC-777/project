import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

import { RolesGuard } from './roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { leaveschema } from './leave.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: userSchema,
      },
      {
        name: 'Leave',
        schema: leaveschema
      }
    ]),
    JwtModule.register({
      secret: 'User-secret',
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
