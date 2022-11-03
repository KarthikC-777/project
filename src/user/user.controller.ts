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
import { UserDto } from './dto/user.dto';
import { EmployeeDto } from './dto/employee.dto';
import { Request, Response } from 'express';
import { leaveDto } from './dto/leave.dto';
import { Roles } from './entities/roles.decorator';
import { UserRole } from './user.schema';
import { UserService } from './user.service';
import { HttpStatus } from '@nestjs/common';
import { loginDto } from './dto/login.dto';
import { UpdateDto } from './dto/update.dto';
import { forgotDto } from './dto/forgot.dto';
import { resetDto } from './dto/reset.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //For registering employee Input:json{name,email,address,password}
  @Post('register')
  @Roles(UserRole.Admin)
  async signup(@Res() res, @Body() userDto: UserDto) {
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully Registered',
      result: await this.userService.signup(userDto),
    });
  }

  //For login Input:json{email,password}
  @Post('login')
  async signin(@Req() req, @Res() res, @Body() userDto: loginDto) {
    res.status(HttpStatus.OK).json({
      message: 'Signed in Succesfully',
      JWT: await this.userService.signin(req, userDto, res),
    });
  }

  //For Logout
  @Delete('logout')
  public async signout(@Req() req, @Res() res) {
    return this.userService.signout(req, res);
  }

  //access:admin, For getting all employee details
  @Get('employee')
  @Roles(UserRole.Admin)
  async getEmployee(@Req() req, @Res() res) {
    res.status(HttpStatus.OK).json({
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
    res.status(HttpStatus.OK).json({
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
    @Body() userDto: UpdateDto,
  ) {
    res.status(HttpStatus.OK).json({
      message: `Employee ${Email} updated`,
      result: await this.userService.updateEmployee(req, res, Email, userDto),
    });
  }

  //update employee details Input:json{name,email,address,phonenumber}
  @Patch('updateEmployeeUser')
  async updateOwnInfo(
    @Req() req,
    @Res() res,
    @Body() employeeDto: EmployeeDto,
  ) {
    res.status(HttpStatus.OK).json({
      message: `Employee  updated`,
      result: await this.userService.updateOwnInfo(req, res, employeeDto),
    });
  }

  //For getting resetpassword link Input:json{email}
  @Post('forgot-password')
  public async forgotPassword(@Body() body: forgotDto, @Req() req, @Res() res) {
    res.send(await this.userService.forgotPassword(body, req, res));
  }

  //For changing password Input:json{email, password}
  @Put('reset-password')
  public async resetPassword(
    @Body() body: resetDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: { resetId: string },
  ) {
    this.userService.resetPassword(body, req, res, query);
  }

  //For applying leave Input:json{leaveDate:"YYYY-MM-DD"}
  @Post('applyLeave')
  async applyLeave(@Req() req, @Body() leaveDto: leaveDto, @Res() res) {
    res.status(HttpStatus.CREATED).json({
      message: `Leave applied successfully`,
      result: await this.userService.applyLeave(req, leaveDto),
    });
  }

  //access:admin fetching all applied leaves
  @Get('viewLeaves')
  @Roles(UserRole.Admin)
  public async checkEmployeeLeave(@Res() res, @Req() req) {
    res.status(HttpStatus.OK).json({
      message: 'Details',
      result: await this.userService.checkEmployeeLeave(req),
    });
  }

  //access:admin For approving employee leaves Input:["YYYY-MM-DD"...]
  @Patch('approveLeaves/:email')
  @Roles(UserRole.Admin)
  async approveEmployeeLeave(
    @Body() date: string[],
    @Res() res,
    @Req() req,
    @Param('email') Email: string,
  ) {
    const existUser = await this.userService.viewEmployeePendingLeaveByEmail(
      req,
      Email,
      res,
    );
    let verifyLength = 0;
    for (let i = 0; i < date.length; i++) {
      for (let j = 0; j < existUser.length; j++) {
        if (
          new Date(date[i]).toISOString() ===
          new Date(existUser[j]['leaveDate']).toISOString()
        ) {
          verifyLength++;
        }
      }
    }
    if (verifyLength === date.length) {
      res.status(HttpStatus.CREATED).json({
        message: `Leave approved successfully`,
        result: await this.userService.approveEmployeeLeave(
          Email,
          date,
          res,
          req,
        ),
      });
    } else {
      res
        .status(HttpStatus.CONFLICT)
        .send(
          'Invalid Date Occur :Either date is already approved or Employee not apllied leave for that date',
        );
    }
  }

  //access:admin fetching pending leaves of all employees
  @Get('viewPendingLeaves/:status')
  @Roles(UserRole.Admin)
  async viewEmployeePendingLeave(
    @Req() req,
    @Res() res,
    @Param('status') status: string,
  ) {
    return this.userService.viewEmployeePendingLeave(req, status, res);
  }

  //For fetching employee his own leave status
  @Get('checkStatus')
  async viewOwnLeave(@Req() req, @Res() res) {
    return this.userService.viewOwnLeave(req, res);
  }

  //access:admin fetching pending leaves by email
  @Get('viewPendingLeavesOfUser/:email')
  @Roles(UserRole.Admin)
  async viewEmployeePendingLeaveByEmail(
    @Req() req,
    @Res() res,
    @Param('email') email: string,
  ) {
    res.status(200).json({
      message: `Details of user with email ${email}`,
      result: await this.userService.viewEmployeePendingLeaveByEmail(
        req,
        email,
        res,
      ),
    });
  }

  //access:admin soft deleting the user/employee
  @Patch('deleteUser/:email')
  @Roles(UserRole.Admin)
  async deactivateEmployee(
    @Req() req,
    @Res() res,
    @Param('email') Email: string,
  ) {
    res.status(HttpStatus.OK).json({
      message: 'User Deleted',
      result: await this.userService.deactivateEmployee(Email, req),
    });
  }

  //access:admin activating the user/employee
  @Patch('activateUser/:email')
  @Roles(UserRole.Admin)
  async activateEmployee(
    @Req() req,
    @Res() res,
    @Param('email') Email: string,
  ) {
    res.status(HttpStatus.OK).json({
      message: 'User Activated',
      result: await this.userService.activateEmployee(Email, req),
    });
  }
}
