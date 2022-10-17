import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { adminSchema } from 'src/Schema/nest_Schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Admin',
        schema: adminSchema,
      },
    ]),
    JwtModule.register({
      secret: 'Employee-secret',
    }),
    EmployeeModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
