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
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiGoneResponse, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //For registering employee Input:json{name,email,address,password}
  @Post('register')
  @Roles(UserRole.Admin)
  @ApiCreatedResponse({ description:"User Registered Successfully"})
  @ApiNotFoundResponse({ description:"Designation Not Found"})
  @ApiConflictResponse({ description:"Email already taken"})
  async signup(@Res() res, @Body() userDto: UserDto) {
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully Registered',
      result: await this.userService.signup(userDto),
    });
  }

  //For login Input:json{email,password}
  @Post('login')
  @ApiOkResponse({ description:"User Logged in"})
  @ApiForbiddenResponse({ description:"You are already signed In"})
  @ApiNotFoundResponse({ description:"Employee Not found"})
  @ApiBadRequestResponse({ description:"Incorrect Password"})
  async signin(@Req() req, @Res() res, @Body() userDto: loginDto) {
    res.status(HttpStatus.OK).json({
      message: 'Signed in Succesfully',
      JWT: await this.userService.signin(req, userDto, res),
    });
  }

  //For Logout
  @Delete('logout')
  @ApiOkResponse({ description: "User logged out successfully"})
  @ApiForbiddenResponse({ description:"You are already signed out"})
  public async signout(@Req() req, @Res() res) {
    return this.userService.signout(req, res);
  }

  //access:admin, For getting all employee details
  @Get('employee')
  @Roles(UserRole.Admin)
  @ApiOkResponse({description: "All the employee details listed below"})
  async getEmployee(@Req() req, @Res() res) {
    res.status(HttpStatus.OK).json({
      message: 'Employee Details',
      result: await this.userService.getEmployee(req),
    });
  }

  //access:admin, getting employee by email
  @Get('employeeByEmail/:email')
  @Roles(UserRole.Admin)
  @ApiOkResponse({description : "Employee Detail"})
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
  @ApiOkResponse({description: "Employee Details Updated"})
  @ApiNotFoundResponse({ description:"Designation Not Found"})
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
  @ApiOkResponse({description: "Employee Details Updated"})
  @ApiNotFoundResponse({ description:"Invalid User Email"})
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
  @ApiNotFoundResponse({ description: "Email does not exist"})
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
  @ApiCreatedResponse({ description: "Leave applied successfully"})
  @ApiBadRequestResponse({ description:"leaveDate must be in the format yyyy-mm-dd"})
  @ApiNotAcceptableResponse({ description:"Cannot apply leave for older dates or No leaves available"})
  async applyLeave(@Req() req, @Body() leaveDto: leaveDto, @Res() res) {
    res.status(HttpStatus.CREATED).json({
      message: `Leave applied successfully`,
      result: await this.userService.applyLeave(req, leaveDto),
    });
  }

  //access:admin fetching all applied leaves
  @Get('viewLeaves')
  @Roles(UserRole.Admin)
  @ApiOkResponse({ description: "All Leave Details Displayed Below"})
  public async checkEmployeeLeave(@Res() res, @Req() req) {
    res.status(HttpStatus.OK).json({
      message: 'Details',
      result: await this.userService.checkEmployeeLeave(req),
    });
  }

  //access:admin For approving employee leaves
  @Patch('approveLeaves')
  @Roles(UserRole.Admin)
  @ApiCreatedResponse({ description: "Leave Approved"})
  async approveEmployeeLeaves(
    @Res() res,
    @Req() req,
    @Query() query: { leaveDate: string; email: string },
  ) {
    res.status(HttpStatus.CREATED).json({
      message: `Leave approved successfully for date ${query.leaveDate}`,
      result: await this.userService.approveEmployeeLeaves(
        query.email,
        query.leaveDate,
        res,
        req,
      ),
    });
  }

  @Patch('rejectLeaves')
  @Roles(UserRole.Admin)
  @ApiCreatedResponse({ description: "Leave Rejected"})
  @ApiGoneResponse({ description: "Link Expired"})
  async rejectEmployeeLeaves(
    @Res() res,
    @Req() req,
    @Query() query: { leaveDate: string; email: string },
  ) {
    res.status(HttpStatus.CREATED).json({
      message: `Leave rejected  for date ${query.leaveDate}`,
      result: await this.userService.rejectEmployeeLeaves(
        query.email,
        query.leaveDate,
        res,
        req,
      ),
    });
  }

  //access:admin fetching pending leaves of all employees
  @Get('viewPendingLeaves/:status')
  @Roles(UserRole.Admin)
  @ApiOkResponse({ description: "All the pending leaves displayed"})
  @ApiNotFoundResponse({ description: "Invalid User"})
  async viewEmployeePendingLeave(
    @Req() req,
    @Res() res,
    @Param('status') status: string,
  ) {
    return this.userService.viewEmployeePendingLeave(req, status, res);
  }

  //For fetching employee his own leave status
  @Get('checkStatus')
  @ApiOkResponse({ description:"Own Leaves"})
  @ApiNotFoundResponse({ description: "Invalid User"})
  async viewOwnLeave(@Req() req, @Res() res) {
    return this.userService.viewOwnLeave(req, res);
  }

  @Get('checkOwnDetails')
  @ApiOkResponse({description: "Details"})
  @ApiNotFoundResponse({ description: "Invalid User"})
  async viewOwnDetails(@Req() req, @Res() res) {
    return this.userService.viewOwnDetails(req, res);
  }

  //access:admin fetching pending leaves by email
  @Get('viewPendingLeavesOfUser/:email')
  @Roles(UserRole.Admin)
  @ApiOkResponse({ description: "Pending Leaves"})
  @ApiNotFoundResponse({ description: "No pending leaves or Invalid Email"})
  async viewEmployeePendingLeaveByEmail(
    @Req() req,
    @Res() res,
    @Param('email') email: string,
  ) {
    return this.userService.viewEmployeePendingLeaveByEmail(req, email, res);
  }

  //access:admin soft deleting the user/employee
  @Patch('deleteUser/:email')
  @Roles(UserRole.Admin)
  @ApiOkResponse({ description: "User Disabled"})
  @ApiForbiddenResponse({ description: "User is already disabled"})
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
  @ApiOkResponse({ description: "User Activated"})
  @ApiForbiddenResponse({ description: "User Account is already active"})
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
