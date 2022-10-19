import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { userDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<userDocument>,
    private jwtService: JwtService,
  ) {}

  async create(userDto: UserDto) {
    const existingUser = await this.userModel.findOne({
      email: userDto.email,
    });
    if (existingUser) {
      throw new HttpException('Email taken', 403);
    }
    const createdUser = new this.userModel(userDto);

    createdUser.password = await bcrypt.hash(createdUser.password, 10);
    return await createdUser.save();
  }
  async loginUser(userDto: UserDto, res): Promise<string> {
    // console.log(userDto.email);
    const checkEmployee = await this.userModel.findOne({
      email: userDto.email,
    });

    if (!checkEmployee) {
      throw new HttpException('Incorrect Email', 404);
    }

    const passwordCheck = await bcrypt.compare(
      userDto.password,
      checkEmployee.password,
    );
    if (!passwordCheck) {
      throw new HttpException('Incorrect Password', 401);
    }
    const token = this.generateJwt(
      checkEmployee.userId,
      checkEmployee.name,
      checkEmployee.email,
    );
    res.cookie('userlogoutcookie', token);
    return token;
  }
  generateJwt(userId: string, name: string, email: string) {
    return this.jwtService.sign({
      userId: userId,
      Name: name,
      Email: email,
    });
  }

  public async logout(res) {
    res.clearCookie('userlogoutcookie');
    res.end('User logged out sucessfuly');
  }
  async getemployee(req) {
    try {
      const ver = await this.jwtService.verify(req.cookies.userlogoutcookie);
      console.log(ver);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      return this.userModel.find().exec();
    } catch (error) {
      console.log(error.message);
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }

  public async findRole() {
    // const ver = await this.jwtService.verify(req.cookies.userlogoutcookie);
    // if (!ver) {
    //   throw new HttpException('Unauthorized admin User error ', 401);
    // }
    // return this.userModel.findOne({ email: ver.Email }).exec();
  }
}
