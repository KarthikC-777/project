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
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { leaveDto } from './dto/leave.dto';
import { Roles } from './entities/roles.decorator';
import { UserRole } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async create(@Res() res, @Body() userDto: UserDto) {
    res.status(201).json({
      message: 'Successfully Registered',
      result: await this.userService.create(userDto),
    });
  }
  @Post('login')
  async loginUser(@Res() res, @Body() userDto: UserDto) {
    res.status(200).json({
      message: 'Logined Succesfully',
      JWT: await this.userService.loginUser(userDto, res),
    });
  }
  @Delete('logout')
  public async logout(@Res() res) {
    return this.userService.logout(res);
  }
  @Get('employee')
  @Roles(UserRole.Admin)
  async getEmployee(@Req() req, @Res() res) {
    res.status(200).json({
      message: 'Employee Details',
      result: await this.userService.getEmployee(req),
    });
  }
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
  @Post('forgot-password')
  public async forgotPassword(
    @Body() body: { email: string; password: string },
    @Req() req,
    @Res() res ,
  ) {
    this.userService.forgotPassword(body, req, res);
  }
   
  @Post('applyLeave')
  async postLeave(@Req() req,@Body() leaveDto: leaveDto, @Res() res){
    res.status(201).json({
      message: `Leave applied successfully`,
      result: await this.userService.applyleave(req,leaveDto,res)
    })
  }


  @Get('viewLeaves')
  @Roles(UserRole.Admin)
  public async checkLeaveStatus(@Res() res, @Req() req) {
    res.status(200).json({
      message: 'Details',
      result: await this.userService.viewLeaves(req,),
    });
  }

 /* @Patch('approveLeaves')
  @Roles(UserRole.Admin)
  async approveLeave(@Body() leaveDto: leaveDto,@Res() res,@Req () req)
  {
    res.status(201).json({
      message: `Leave applied successfully`,
      result: await this.userService.approveLeave(leaveDto,res,req)
    })

  }
  */
  @Patch('approveLeaves/:email')
  @Roles(UserRole.Admin)
  async approveLeave(@Body() date:string[],@Res() res,@Req () req,@Param('email') Email:string)
  {
    res.status(201).json({
      message: `Leave applied successfully`,
      result: await this.userService.approveLeave(Email,date,res,req)
    })

  }

  @Get('viewPendingLeaves/:status')
  @Roles(UserRole.Admin)
  async viewPendingLeave(@Req() req, @Res() res, @Param('status') status: string) {
    return this.userService.viewPendingLeave(req, status, res);
  }
  
  @Get('checkStatus')
  async viewLeave(@Req() req, @Res() res) {
    return this.userService.viewLeave(req,res);
  }
  
  @Get('viewPendingLeavesOfUser/:email')
  @Roles(UserRole.Admin)
  async viewPendingLeaveOfUser(@Req() req, @Res() res, @Param('email') email: string) {
    return this.userService.viewPendingLeaveOfUser(req, email, res);
  }

  
}



