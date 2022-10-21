import {
  Body,
  Controller,
  Post,
  Res,
  Delete,
  Req,
  Get,
  Param,
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
  // @Post('forgot-password')
  // public async forgotPassword(
  //   @Body() body: { email: string; password: string },
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ) {
  //   this.userService.forgotPassword(body, req, res);
  // }

  @Post('applyLeave')
  async postLeave(@Req() req,@Body() leaveDto: leaveDto, @Res() res){
    res.status(201).json({
      message: `Leave applied successfully`,
      result: await this.userService.applyleave(req,leaveDto,res)
    })
  }

}
