import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { employeeSchema, leaveSchema } from 'src/Schema/nest_Schema';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Employee',
        schema: employeeSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'Leave',
        schema: leaveSchema,
      },
    ]),
    JwtModule.register({
      secret: 'Employee-secret',
    }),
  ],

  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
