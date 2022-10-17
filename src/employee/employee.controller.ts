import { Body, Controller, Delete, Post, Req, Res } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeDto } from './EmployeeDto';
import { LeaveDto } from './LeaveDto';

@Controller('employee')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post('register')
  async create(@Res() res, @Body() employeeDto: EmployeeDto) {
    res.status(201).json({
      message: 'Successfully Added Employee',
      result: await this.employeeService.create(employeeDto),
    });
    // return await this.employeeService.create(res, employeeDto);
  }
  @Post('login')
  async loginEmployee(@Res() res, @Body() employeeDto: EmployeeDto) {
    res.status(200).json({
      message: 'Logined Succesfully',
      JWT: await this.employeeService.loginEmployee(employeeDto, res),
    });
  }
  @Delete('logout')
  public async logout(@Res() res) {
    return this.employeeService.logout(res);
  }
  @Post('leavesApply')
  public async applyLeave(@Body() newLeave: LeaveDto, @Req() req, @Res() res) {
    try {
      return this.employeeService.applyLeave(newLeave, req, res);
    } catch (err) {
      return err;
    }
  }
}
