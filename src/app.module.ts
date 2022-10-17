import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeModule } from './employee/employee.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest_admin_employee'),
    EmployeeModule,
    AdminModule,
  ],
})
export class AppModule {}
