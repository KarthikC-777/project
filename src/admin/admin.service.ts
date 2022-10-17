import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { adminDocument } from '../Schema/nest_Schema';
import { AdminDto } from './AdminDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Admin') private readonly AdminModel: Model<adminDocument>,
    private jwtService: JwtService,
  ) {}
  async register(adminDto: AdminDto) {
    const existingUser = await this.AdminModel.findOne({
      adminName: adminDto.adminName,
    });
    if (existingUser) {
      throw new HttpException('Email taken', 403);
    }
    const createdEmployee = new this.AdminModel(adminDto);

    createdEmployee.password = await bcrypt.hash(createdEmployee.password, 10);
    return await createdEmployee.save();
  }
  async loginAdmin(res, adminDto: AdminDto): Promise<string> {
    console.log(adminDto.adminName);
    const checkAdmin = await this.AdminModel.findOne({
      adminEmail: adminDto.adminEmail,
    });

    if (!checkAdmin) {
      throw new HttpException('No Employee found', 404);
    }

    const passwordCheck = await bcrypt.compare(
      adminDto.password,
      checkAdmin.password,
    );
    if (!passwordCheck) {
      throw new HttpException('Incorrect Password', 401);
    }
    const token = this.GenerateJwt(checkAdmin.adminEmail);
    res.cookie('adminlogoutcookie', token);
    return token;
  }
  GenerateJwt(adminEmail: string) {
    return this.jwtService.sign({
      AdminEmail: adminEmail,
    });
  }

  public async logout(res) {
    res.clearCookie('adminlogoutcookie');
    res.end('User logged out sucessfuly');
  }
  async ApproveLeaveByAdmin(req) {
    const ver = this.jwtService.verify(req.cookies.adminlogoutcookie);
    console.log(ver);
    if (!ver) {
      throw new HttpException('Please Login,User Not Found', 404);
    }
    return true;
  }
}
