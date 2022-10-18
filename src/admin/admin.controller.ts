import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminDto } from './AdminDto';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeDto } from 'src/employee/EmployeeDto';
import { LeaveDto } from '../employee/LeaveDto';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private employeeService: EmployeeService,
  ) {}
  @Post()
  async register(@Res() res, @Body() adminDto: AdminDto) {
    res.status(201).json({
      message: 'Successfully Added Admin',
      result: await this.adminService.register(adminDto),
    });
  }
  @Post('login')
  async loginAdmin(@Res() res, @Body() adminDto: AdminDto) {
    res.status(200).json({
      message: 'Logined Succesfully',
      result: await this.adminService.loginAdmin(res, adminDto),
    });
  }
  @Delete('logout')
  public async logout(@Res() res) {
    return this.adminService.logout(res);
  }
  @Get('employee')
  async getemployee(@Req() req, @Res() res) {
    console.log('Hi');
    res.status(200).json({
      message: 'Employee Details',
      result: await this.employeeService.getemployee(req),
    });
  }
  @Get('/employee/:email')
  async getEmployeeByEmail(@Req() req, @Res() res, @Param('email') Id: string) {
    console.log('Controller', Id);
    return this.employeeService.getEmployeeByEmail(req, Id, res);
  }
  @Patch('/employee/updatebyemail/:email')
  async updateEmployee(
    @Req() req,
    @Res() res,
    @Param('email') Email: string,
    @Body() employeeDto: EmployeeDto,
  ) {
    return this.employeeService.updateEmployee(req, res, Email, employeeDto);
  }
  @Delete('/employee/deletebyemail/:email')
  async DeleteEmployee(@Req() req, @Res() res, @Param('email') email: string) {
    return this.employeeService.DeleteEmployee(req, res, email);
  }
  @Post('approveLeave')
  async ApproveLeaveByAdmin(
    @Res() res,
    @Req() req,
    @Body() DateApprove: LeaveDto,
  ) {
    console.log('controller', DateApprove.date);
    if (this.adminService.ApproveLeaveByAdmin(req)) {
      this.employeeService.ApproveLeaveByAdmin(req, res, DateApprove);
    }
  }
}
