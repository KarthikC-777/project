import {
  Body,
  Controller,
  Post,
  Res,
  Delete,
  Req,
  Get,
  Param,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { EmployeeDto, UserDto } from './dto/user.dto';
import { leaveDto } from './dto/leave.dto';
import { Roles } from './entities/roles.decorator';
import { UserRole } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //For registering employee Input:json{name,email,address,password}
  @Post('register')
  async create(@Res() res, @Body() userDto: UserDto) {
    res.status(201).json({
      message: 'Successfully Registered',
      result: await this.userService.create(userDto),
    });
  }

  //For login Input:json{email,password}
  @Post('login')
  async loginUser(@Res() res, @Body() userDto: UserDto) {
    res.status(200).json({
      message: 'Logined Succesfully',
      JWT: await this.userService.loginUser(userDto, res),
    });
  }

  //For Logout
  @Delete('logout')
  public async logout(@Res() res) {
    return this.userService.logout(res);
  }

  //access:admin, For getting all employee details
  @Get('employee')
  @Roles(UserRole.Admin)
  async getEmployee(@Req() req, @Res() res) {
    res.status(200).json({
      message: 'Employee Details',
      result: await this.userService.getEmployee(req),
    });
  }

  //access:admin, getting employee by email
  @Get('employeeByEmail/:email')
  @Roles(UserRole.Admin)
  async getEmployeeByEmail(
    @Req() req,
    @Res() res,
    @Param('email') email: string,
  ) {
    res.status(200).json({
      message: `Employee details with Email: ${email}`,
      result: await this.userService.getEmployeeByEmail(req, res, email),
    });
  }

  //access:admin update employee details Input:json{userId,salary,designation}
  @Patch('updateEmployee/:email')
  @Roles(UserRole.Admin)
  async updateEmployee(
    @Req() req,
    @Res() res,
    @Param('email') Email: string,
    @Body() userDto: UserDto,
  ) {
    res.status(200).json({
      message: `Employee ${Email} updated`,
      result: await this.userService.updateEmployee(req, res, Email, userDto),
    });
  }

  //update employee details Input:json{name,email,address,phonenumber}
  @Patch('updateEmployeeUser/:email')
  async updateEmployeeUser(
    @Req() req,
    @Res() res,
    @Param('email') Email: string,
    @Body() employeeDto: EmployeeDto,
  ) {
    res.status(200).json({
      message: `Employee ${Email} updated`,
      result: await this.userService.updateEmployeeUser(
        req,
        res,
        Email,
        employeeDto,
      ),
    });
  }

  //For getting resetpassword link Input:json{email}
  @Post('forgot-password')
  public async forgotPassword(
    @Body() body: { email: string; password: string },
    @Req() req,
    @Res() res,
  ) {
    this.userService.forgotPassword(body, req, res);
  }

  //For changing password Input:json{email, password}
  @Put('reset-password')
  public async resetPassword(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: { hash: string },
  ) {
    this.userService.resetPassword(body, req, res, query);
  }

  //For applying leave Input:json{leaveDate:"YYYY-MM-DD"}
  @Post('applyLeave')
  async postLeave(@Req() req, @Body() leaveDto: leaveDto, @Res() res) {
    res.status(201).json({
      message: `Leave applied successfully`,
      result: await this.userService.applyLeave(req, leaveDto),
    });
  }

  //access:admin fetching all applied leaves
  @Get('viewLeaves')
  @Roles(UserRole.Admin)
  public async checkLeaveStatus(@Res() res, @Req() req) {
    res.status(200).json({
      message: 'Details',
      result: await this.userService.viewLeaves(req),
    });
  }

  //access:admin For approving employee leaves Input:["YYYY-MM-DD"...]
  @Patch('approveLeaves/:email')
  @Roles(UserRole.Admin)
  async approveLeave(
    @Body() date: string[],
    @Res() res,
    @Req() req,
    @Param('email') Email: string,
  ) {
    res.status(201).json({
      message: `Leave applied successfully`,
      result: await this.userService.approveLeave(Email, date, res, req),
    });
  }

  //access:admin fetching pending leaves of all employees
  @Get('viewPendingLeaves/:status')
  @Roles(UserRole.Admin)
  async viewPendingLeave(
    @Req() req,
    @Res() res,
    @Param('status') status: string,
  ) {
    return this.userService.viewPendingLeave(req, status, res);
  }

  //For checking leave status by employee
  @Get('checkStatus')
  async viewLeave(@Req() req, @Res() res) {
    return this.userService.viewLeave(req, res);
  }

  //access:admin fetching pending leaves by email
  @Get('viewPendingLeavesOfUser/:email')
  @Roles(UserRole.Admin)
  async viewPendingLeaveOfUser(
    @Req() req,
    @Res() res,
    @Param('email') email: string,
  ) {
    return this.userService.viewPendingLeaveOfUser(req, email, res);
  }
}
