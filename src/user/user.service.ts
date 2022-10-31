import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto, EmployeeDto } from './dto/user.dto';
import { user, userDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { leave, leaveDocument } from './leave.schema';
import { leaveDto } from './dto/leave.dto';
const userProjection = { __v: false, _id: false, email: false };

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<userDocument>,
    private jwtService: JwtService,
    @InjectModel('Leave') private readonly leaveModel: Model<leaveDocument>,
  ) {}

  functionVerify = async (token: string | undefined) => {
    try {
      if (token === undefined) {
        throw new HttpException('Please Login Again ', HttpStatus.NOT_FOUND);
      }
      const verifyUser = await this.jwtService.verify(token);
      if (!verifyUser) {
        throw new HttpException(
          'Unauthorized  User error ',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return verifyUser;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  };

  async create(userDto: UserDto): Promise<UserDto> {
    const existingUser = await this.userModel.findOne({
      email: userDto.email,
    });
    if (existingUser) {
      throw new HttpException('Email taken', HttpStatus.FORBIDDEN);
    }
    const createdUser = new this.userModel(userDto);
    const salt = await bcrypt.genSalt();
    createdUser.password = await bcrypt.hash(createdUser.password, salt);
    return await createdUser.save();
  }

  async loginUser(userDto: UserDto, res): Promise<string> {
    const checkUser = await this.userModel.findOne({
      email: userDto.email,
    });
    if (!checkUser) {
      throw new HttpException(
        'Incorrect Email',
        HttpStatus.NON_AUTHORITATIVE_INFORMATION,
      );
    }
    if (checkUser.status == 'Inactive') {
      throw new HttpException('Employee Not found', HttpStatus.NOT_FOUND);
    }
    const passwordCheck = await bcrypt.compare(
      userDto.password,
      checkUser.password,
    );
    if (!passwordCheck) {
      throw new HttpException('Incorrect Password', HttpStatus.BAD_REQUEST);
    }
    const token = this.generateJwt(
      checkUser.userId,
      checkUser.name,
      checkUser.email,
      checkUser.role,
    );
    res.cookie('userlogoutcookie', token);
    return token;
  }
  generateJwt(userId: string, name: string, email: string, role: string[]) {
    return this.jwtService.sign({
      userId: userId,
      Name: name,
      Email: email,
      role: role,
    });
  }

  public async logout(res) {
    res.clearCookie('userlogoutcookie');
    res.end('User logged out sucessfuly');
  }

  async getEmployee(req): Promise<user[]> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      return this.userModel.find().exec();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  public async forgotPassword(body, req, res): Promise<void> {
    this.userModel.find({ email: req.body.email }, (error, user) => {
      if (user) {
        const payload2 = { email: user[0].email, name: user[0].name };
        const token2 = this.jwtService.sign(payload2, {
          expiresIn: '15m',
        });
        res.cookie('resetPasswordCookie', token2);
        const link = `http://localhost:3000/user/reset-password?hash=${user[0].password}`;
        console.log(link);
        res.end('Reset password link is sent to mail');
      }
    });
  }

  public async resetPassword(body, req, res, query): Promise<void> {
    const user = this.userModel.find({
      password: query.hash,
    });
    user
      .then(async (user) => {
        if (user) {
          const verify = this.jwtService.verify(
            req.cookies.resetPasswordCookie,
          );
          if (verify) {
            const updatePass = await bcrypt.hash(req.body.password, 10);
            const result = this.userModel.findOneAndUpdate(
              { email: verify.email },
              { $set: { password: updatePass } },
            );
            res.clearCookie('reset_password_cookie');
            result.then(res.send('password updated please login again'));
          }
        }
      })
      .catch((error) => {
        res.send(error.message);
      });
  }

  async getEmployeeByEmail(req: any, res: any, Email: string) {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      return this.userModel.findOne({ email: Email }).exec();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async updateEmployee(
    req,
    res,
    Email: string,
    userDto: UserDto,
  ): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOneAndUpdate(
        { email: Email },
        {
          userId: userDto.userId,
          name: userDto.name,
          email: userDto.email,
          phonenumber: userDto.phonenumber,
          salary: userDto.salary,
          designation: userDto.designation,
          status: userDto.status,
          address: userDto.address,
          availableLeaves: userDto.availableLeaves,
        },
      );
      if (!existUser) {
        throw new HttpException(
          'Invalid User Email',
          HttpStatus.NON_AUTHORITATIVE_INFORMATION,
        );
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async updateEmployeeUser(
    req,
    res,
    Email: string,
    employeeDto: EmployeeDto,
  ): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOneAndUpdate(
        { email: Email },
        {
          name: employeeDto.name,
          email: employeeDto.email,
          phonenumber: employeeDto.phonenumber,
          address: employeeDto.address,
        },
      );
      if (!existUser) {
        throw new HttpException('Invalid User Email', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async applyLeave(req, leaveDto: leaveDto): Promise<leaveDto> {
    try {
      const verifyUser = await this.functionVerify(
        req.cookies['userlogoutcookie'],
      );
      if ('status' in leaveDto) {
        throw new HttpException(
          ' `Status` access in forbidden',
          HttpStatus.FORBIDDEN,
        );
      }
      const user = await this.userModel
        .findOne({ email: verifyUser.Email })
        .exec();
      if (
        !new Date(leaveDto.leaveDate).getTime() ||
        leaveDto.leaveDate.length < 10
      ) {
        throw new HttpException(
          ' `leaveDate` must be in the format yyyy/mm/dd',
          HttpStatus.BAD_REQUEST,
        );
      }
      const newDate = new Date(leaveDto.leaveDate);
      if (newDate.getTime() < Date.now() || user.availableLeaves < 1) {
        throw new HttpException(
          'Cannot apply leave for older dates or No leaves available',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      const leaveExist = await this.leaveModel.findOne({
        email: verifyUser.Email,
        leaveDate: newDate.toISOString(),
      });
      if (leaveExist) {
        throw new HttpException(`Leave already exists`, HttpStatus.OK);
      }
      const newLeave = await new this.leaveModel({
        email: verifyUser.Email,
        leaveDate: newDate.toISOString(),
      });
      return await newLeave.save();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async viewLeaves(req): Promise<leaveDto[]> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      return this.leaveModel.find().exec();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async viewPendingLeave(req, status: string, res): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.leaveModel
        .find({
          status: status,
        })
        .exec();
      if (!existUser) {
        throw new HttpException('Invalid User ', HttpStatus.NOT_FOUND);
      }

      res.status(200).json({
        message: `Details of user with status ${status}`,
        result: existUser,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async viewLeave(req, res): Promise<void> {
    try {
      const verifyUser = await this.functionVerify(
        req.cookies['userlogoutcookie'],
      );
      const existUser = await this.leaveModel
        .find({
          email: verifyUser.Email,
        })
        .exec();
      if (!existUser) {
        throw new HttpException('Invalid User ', HttpStatus.NOT_FOUND);
      }
      res.status(HttpStatus.OK).json({
        message: `Details of user with status ${verifyUser.Email}`,
        result: existUser,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async viewPendingLeaveOfUser(req, Email: string, res): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.leaveModel
        .find(
          {
            status: 'Pending',
            email: Email,
          },
          userProjection,
        )
        .exec();
      if (!existUser) {
        throw new HttpException('Invalid User ', HttpStatus.NOT_FOUND);
      } else if (existUser.length == 0) {
        throw new HttpException(
          'no Pending leaves or invalid email',
          HttpStatus.NOT_FOUND,
        );
      }
      res.status(200).json({
        message: `Details of user with email ${Email}`,
        result: existUser,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async approveLeave(Email: string, date: string[], res, req): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const emp = await this.userModel.findOne({
        email: Email,
      });
      for (let i = 0; i < date.length; i++) {
        const newDate = new Date(date[i]);
        const user = await this.leaveModel.findOneAndUpdate(
          { email: Email, leaveDate: newDate.toISOString(), status: 'Pending' },
          { $set: { status: 'Approved' } },
        );
        if (user) {
          emp.availableLeaves = emp.availableLeaves - 1;
        }
      }
      emp.save();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async deleteUser(Email: string, req): Promise<user> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOneAndUpdate(
        { email: Email },
        { $set: { status: 'Inactive' } },
      );

      if (!existUser) {
        throw new HttpException('Invalid User Email', HttpStatus.NOT_FOUND);
      }
      return existUser;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async activateUser(Email: string, req): Promise<user> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOneAndUpdate(
        { email: Email },
        { $set: { status: 'Active' } },
      );

      if (!existUser) {
        throw new HttpException('Invalid User Email', HttpStatus.NOT_FOUND);
      }
      return existUser;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
