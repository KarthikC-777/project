import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { employeeDocument, leaveDocument } from '../Schema/nest_Schema';
import { EmployeeDto } from './EmployeeDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LeaveDto } from './LeaveDto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel('Employee')
    private readonly EmployeeModel: Model<employeeDocument>,
    private jwtService: JwtService,
    @InjectModel('Leave') private readonly LeaveModel: Model<leaveDocument>,
  ) {}
  async create(employeeDto: EmployeeDto) {
    const existingUser = await this.EmployeeModel.findOne({
      email: employeeDto.email,
    });
    if (existingUser) {
      throw new HttpException('Email taken', 403);
    }
    const createdEmployee = new this.EmployeeModel(employeeDto);

    createdEmployee.password = await bcrypt.hash(createdEmployee.password, 10);
    return await createdEmployee.save();
  }
  async loginEmployee(employeeDto: EmployeeDto, res): Promise<string> {
    console.log(employeeDto.email);
    const checkEmployee = await this.EmployeeModel.findOne({
      email: employeeDto.email,
    });

    if (!checkEmployee) {
      throw new HttpException('Incorrect Email', 404);
    }

    const passwordCheck = await bcrypt.compare(
      employeeDto.password,
      checkEmployee.password,
    );
    if (!passwordCheck) {
      throw new HttpException('Incorrect Password', 401);
    }
    const token = this.GenerateJwt(
      checkEmployee.id,
      checkEmployee.name,
      checkEmployee.email,
    );
    res.cookie('employeelogoutcookie', token);
    return token;
  }
  GenerateJwt(EmpId: number, name: string, email: string) {
    return this.jwtService.sign({
      EmployeeId: EmpId,
      Name: name,
      Email: email,
    });
  }
  public async logout(res) {
    res.clearCookie('employeelogoutcookie');
    res.end('User logged out sucessfuly');
  }
  async getemployee(req) {
    try {
      console.log('hello');
      console.log(req.cookies['adminlogoutcookie']);
      const ver = await this.jwtService.verify(req.cookies.adminlogoutcookie);
      console.log(ver);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      return this.EmployeeModel.find().exec();
    } catch (error) {
      console.log(error.message);
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }
  async getEmployeeByEmail(req, Id: string, res) {
    try {
      console.log('service', Id);
      const ver = this.jwtService.verify(req.cookies.adminlogoutcookie);
      console.log(ver);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      const existUser = await this.EmployeeModel.findOne({
        email: Id,
      }).exec();
      console.log(existUser);
      if (!existUser) {
        throw new HttpException('Invalid User Id', 404);
      }

      res.status(200).json({
        message: `Details of employee with email id ${Id}`,
        result: existUser,
      });
    } catch (error) {
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }
  async updateEmployee(req, res, Email: string, employeeDto: EmployeeDto) {
    try {
      const ver = this.jwtService.verify(req.cookies.adminlogoutcookie);
      console.log(ver);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      const existUser = await this.EmployeeModel.findOneAndUpdate(
        { email: Email },
        { role: employeeDto.role, salary: employeeDto.salary },
      );

      if (!existUser) {
        throw new HttpException('Invalid User Email', 404);
      }
      res.status(200).json({
        message: `updated successfully of employee with ${Email}`,
      });
    } catch (error) {
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }
  async DeleteEmployee(req, res, Email: string) {
    try {
      const ver = this.jwtService.verify(req.cookies.adminlogoutcookie);
      console.log(ver);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      const existUser = await this.EmployeeModel.deleteOne({
        email: Email,
      });

      if (!existUser) {
        throw new HttpException('Invalid User Email', 404);
      }
      res.status(200).json({
        message: `Deleted successfully of employee with ${Email}`,
      });
    } catch (error) {
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }
  async applyLeave(newLeave: LeaveDto, req, res) {
    try {
      const ver = this.jwtService.verify(req.cookies.employeelogoutcookie);

      if (!ver) {
        throw new HttpException('Please Login,User Not Found', 404);
      }

      const emp = await this.EmployeeModel.findOne({
        email: ver.Email,
      });

      if (emp.availableLeaves < 1) {
        throw new HttpException(
          {
            error: 'No available leaves',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const dat = new Date(newLeave.date);

      if (dat.getTime() < Date.now()) {
        throw new HttpException(
          {
            error: 'Cannot apply leave for older dates',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const existUser = await this.LeaveModel.findOne({ email: ver.Email });

      // emp.availableLeaves = emp.availableLeaves - 1;
      // emp.save();
      if (!existUser) {
        const temp = { email: ver.Email, leave: [newLeave] };
        const lev = await new this.LeaveModel(temp);
        await lev.save();
        res.send(lev);
      } else {
        for (let i = 0; i < existUser.leave.length; i++) {
          if (existUser.leave[i]['date'].toISOString() === dat.toISOString()) {
            throw new HttpException(
              'Already leave is apllied for this date',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
        await this.LeaveModel.updateOne(
          { email: ver.Email },
          { $push: { leave: [newLeave] } },
        );

        res.json({
          Message: 'Apllied for this leave date Successful ',
          date: newLeave.date,
        });
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async ApproveLeaveByAdmin(req, res, DateApprove: LeaveDto) {
    const NumberOfLeaveDoc = await this.LeaveModel.find();
    const dat = new Date(DateApprove.date);

    for (let i = 0; i < NumberOfLeaveDoc.length; i++) {
      const emp = await this.EmployeeModel.findOne({
        email: NumberOfLeaveDoc[i].email,
      });

      const checkEmp = await this.LeaveModel.findOneAndUpdate(
        {
          email: NumberOfLeaveDoc[i].email,
          'leave.date': dat,
          'leave.status': 'pending',
        },
        {
          $set: { 'leave.$.status': 'Approved' },
        },
      );
      if (checkEmp) {
        emp.availableLeaves = emp.availableLeaves - 1;
        emp.save();
      }
    }

    res.status(200).json({
      message: 'Successfully Approved for the date ',
      Date: DateApprove.date,
    });
  }
  async checkLeaveStatus(req) {
    try {
      const ver = this.jwtService.verify(req.cookies.employeelogoutcookie);
      console.log(ver);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      return await this.LeaveModel.findOne({ email: ver.Email });
    } catch (error) {
      console.log(error.message);
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }
}
