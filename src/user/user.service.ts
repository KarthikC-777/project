import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { EmployeeDto } from './dto/employee.dto';
import { user, userDocument, UserDesignation } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { leave, leaveDocument, statusEnum } from './leave.schema';
import { leaveDto } from './dto/leave.dto';
import { randomBytes } from 'crypto';
import { loginDto } from './dto/login.dto';
import { forgotDto } from './dto/forgot.dto';
import { resetDto } from './dto/reset.dto';
import { UpdateDto } from './dto/update.dto';
const userProjection = {
  __v: false,
  _id: false,
  approveLink: false,
  rejectLink: false,
};

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

  async signup(userDto: UserDto): Promise<UserDto> {
    try {
      const designationKey = Object.keys(UserDesignation).find(
        (key) => key === userDto.designation,
      );
      if (designationKey === undefined) {
        throw new HttpException('Designation Not Found', HttpStatus.NOT_FOUND);
      }
      const existingUser = await this.userModel.findOne({
        email: userDto.email,
      });
      if (existingUser) {
        throw new HttpException('Email already taken', HttpStatus.CONFLICT);
      }
      const createdUser = new this.userModel(userDto);
      const salt = await bcrypt.genSalt();
      createdUser.password = await bcrypt.hash(createdUser.password, salt);
      createdUser.designation = UserDesignation[userDto.designation];
      return await createdUser.save();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async signin(req, userDto: loginDto, res): Promise<string> {
    try {
      if (req.cookies['userlogoutcookie'] !== undefined) {
        const checkAlredySignin = await this.functionVerify(
          req.cookies['userlogoutcookie'],
        );
        if (checkAlredySignin.Email === userDto.email) {
          throw new HttpException(
            'You are already signed In',
            HttpStatus.FORBIDDEN,
          );
        }
      }
      const checkUser = await this.userModel.findOne({
        email: userDto.email,
      });
      if (!checkUser) {
        throw new HttpException(
          'Incorrect Email',
          HttpStatus.NON_AUTHORITATIVE_INFORMATION,
        );
      }
      if (checkUser.status == false) {
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
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
  generateJwt(userId: string, name: string, email: string, role: string[]) {
    return this.jwtService.sign({
      userId: userId,
      Name: name,
      Email: email,
      role: role,
    });
  }

  public async signout(req, res): Promise<void> {
    try {
      if (req.cookies['userlogoutcookie'] === undefined) {
        throw new HttpException(
          'You are already signed out',
          HttpStatus.FORBIDDEN,
        );
      }
      res.clearCookie('userlogoutcookie');
      res.end('User signed out successfully');
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getEmployee(req): Promise<user[]> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      return this.userModel.find().exec();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  public async forgotPassword(body: forgotDto, req, res): Promise<void> {
    try {
      const user = await this.userModel.findOne({ email: body.email });
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).send('Email not found');
      }
      const salt = await bcrypt.genSalt();
      const resetHash = await bcrypt.hash(
        randomBytes(32).toString('hex'),
        salt,
      );
      await this.userModel.updateOne(
        { email: body.email },
        { resetToken: resetHash },
      );
      res.send(
        `http://localhost:3000/user/reset-password?resetId=${resetHash}`,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  public async resetPassword(body: resetDto, req, res, query) {
    try {
      this.userModel.findOne(
        { resetToken: query.resetId },
        async (error, data) => {
          if (error) throw error;
          const salt = await bcrypt.genSalt();
          const newPassword = await bcrypt.hash(body.password, salt);
          await this.userModel.updateOne(
            { resetToken: query.resetId },
            { password: newPassword, resetToken: 0 },
          );
          res.send('password updated successfuly login agin');
        },
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getEmployeeByEmail(req, res, Email: string) {
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
    userDto: UpdateDto,
  ): Promise<void> {
    try {
      if (userDto.designation) {
        const designationKey = Object.keys(UserDesignation).find(
          (key) => key === userDto.designation,
        );
        if (designationKey === undefined) {
          throw new HttpException(
            'Designation Not Found',
            HttpStatus.NOT_FOUND,
          );
        }
      }
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOneAndUpdate(
        { email: Email },
        {
          userId: userDto.userId,
          name: userDto.name,
          phonenumber: userDto.phonenumber,
          salary: userDto.salary,
          designation: UserDesignation[userDto.designation],
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

  async updateOwnInfo(req, res, employeeDto: EmployeeDto): Promise<void> {
    try {
      const verifyUser = await this.functionVerify(
        req.cookies['userlogoutcookie'],
      );
      const existUser = await this.userModel.findOneAndUpdate(
        { email: verifyUser.Email },
        {
          name: employeeDto.name,
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
      if (leaveExist && leaveExist.rejected === true) {
        throw new HttpException(
          `For this date Leave is rejected`,
          HttpStatus.OK,
        );
      }
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

  async checkEmployeeLeave(req): Promise<leaveDto[]> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      return this.leaveModel.find({}, userProjection).exec();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async viewEmployeePendingLeave(req, Status: string, res): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const statusEnum_key = Object.keys(statusEnum).find(
        (key) => statusEnum[key] === Status,
      );
      const existUser = await this.leaveModel
        .find({
          status: statusEnum_key,
          rejected: { $exists: false },
        })
        .exec();
      if (!existUser) {
        throw new HttpException('Invalid User ', HttpStatus.NOT_FOUND);
      }
      if (Status === 'Pending')
        for (let i = 0; i < existUser.length; i++) {
          existUser[
            i
          ].approveLink = `http://localhost:3000/user/approveLeaves?leaveDate=${existUser[i].leaveDate}&email=${existUser[i].email}`;
          existUser[
            i
          ].rejectLink = `http://localhost:3000/user/rejectLeaves?leaveDate=${existUser[i].leaveDate}&email=${existUser[i].email}`;
          existUser[i].save();
        }
      res.status(200).json({
        message: `Details of user with status ${Status}`,
        result: existUser,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async viewOwnLeave(req, res): Promise<void> {
    try {
      const verifyUser = await this.functionVerify(
        req.cookies['userlogoutcookie'],
      );
      const existUser = await this.leaveModel
        .find(
          {
            email: verifyUser.Email,
          },
          userProjection,
        )
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

  async viewEmployeePendingLeaveByEmail(
    req,
    Email: string,
    res,
  ): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.leaveModel
        .find(
          {
            status: false,
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

  async approveEmployeeLeaves(
    Email: string,
    date: string,
    res,
    req,
  ): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const emp = await this.userModel.findOne({
        email: Email,
      });
      const newDate = new Date(date);
      const user = await this.leaveModel.findOneAndUpdate(
        {
          email: Email,
          leaveDate: newDate.toISOString(),
          status: false,
          approveLink: `http://localhost:3000/user/approveLeaves?leaveDate=${date}&email=${Email}`,
        },
        {
          $set: { status: true },
          $unset: {
            approveLink: `http://localhost:3000/user/approveLeaves?leaveDate=${date}&email=${Email}`,
            rejectLink: `http://localhost:3000/user/rejectLeaves?leaveDate=${date}&email=${Email}`,
          },
        },
      );
      if (user) {
        emp.availableLeaves = emp.availableLeaves - 1;
      } else {
        throw new HttpException('Link expired', HttpStatus.GONE);
      }
      emp.save();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async rejectEmployeeLeaves(
    Email: string,
    date: string,
    res,
    req,
  ): Promise<void> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);

      const newDate = new Date(date);
      const user = await this.leaveModel.findOneAndUpdate(
        {
          email: Email,
          leaveDate: newDate.toISOString(),
          status: false,
          rejectLink: `http://localhost:3000/user/rejectLeaves?leaveDate=${date}&email=${Email}`,
        },
        {
          $unset: {
            rejectLink: `http://localhost:3000/user/rejectLeaves?leaveDate=${date}&email=${Email}`,
            approveLink: `http://localhost:3000/user/approveLeaves?leaveDate=${date}&email=${Email}`,
          },
        },
      );
      if (user) {
        user.rejected = true;
        user.save();
      } else {
        throw new HttpException('Link expired', HttpStatus.GONE);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async deactivateEmployee(Email: string, req): Promise<user> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOneAndUpdate(
        { email: Email },
        { $set: { status: false } },
      );

      if (!existUser) {
        throw new HttpException('Invalid User Email', HttpStatus.NOT_FOUND);
      }
      return existUser;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async activateEmployee(Email: string, req): Promise<user> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOneAndUpdate(
        { email: Email },
        { $set: { status: true } },
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
