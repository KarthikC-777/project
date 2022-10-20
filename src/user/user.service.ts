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
    const checkUser = await this.userModel.findOne({
      email: userDto.email,
    });

    if (!checkUser) {
      throw new HttpException('Incorrect Email', 404);
    }

    const passwordCheck = await bcrypt.compare(
      userDto.password,
      checkUser.password,
    );
    if (!passwordCheck) {
      throw new HttpException('Incorrect Password', 401);
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
  async getemployee(req) {
    try {
      const ver = await this.jwtService.verify(req.cookies.userlogoutcookie);

      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      return this.userModel.find().exec();
    } catch (error) {
      console.log(error.message);
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }
  public async forgotpassword(body, req, res) {
    this.userModel.find({ email: req.body.email }, (error, user) => {
      if (user) {
        const payload2 = { email: user[0].email, name: user[0].name };
        const token2 = this.jwtService.sign(payload2, {
          expiresIn: '15m',
        });
        res.cookie('reset_password_cookie', token2);
        const link = `http://localhost:4000/user/reset-password?pa=${user[0].password}`;
        console.log(link);
        res.end('Reset password link is sent to mail');
      }
    });
  }
}
