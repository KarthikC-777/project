import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { userDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { leaveDocument } from './leave.schema';
import { leaveDto } from './dto/leave.dto';
const userProjection={__v:false,_id:false,email:false}

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<userDocument>,
    private jwtService: JwtService,
    @InjectModel('Leave') private readonly leaveModel: Model<leaveDocument>,

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
  async getEmployee(req) {
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
  public async forgotPassword(body, req, res) {
    this.userModel.find({ email: req.body.email }, (error, user) => {
      if (user) {
        const payload2 = { email: user[0].email, name: user[0].name };
        const token2 = this.jwtService.sign(payload2, {
          expiresIn: '15m',
        });
        res.cookie('reset-password-cookie', token2);
        const link = `http://localhost:4000/user/reset-password?pa=${user[0].password}`;
        console.log(link);
        res.end('Reset password link is sent to mail');
      }
    });
  }
  async getEmployeeByEmail(req: any, res: any, Email: string) {
    try {
      const verifyUser = await this.jwtService.verify(
        req.cookies.userlogoutcookie,
      );
      if (!verifyUser) {
        throw new HttpException('Unautorized Admin ', 401);
      }
      return this.userModel.findOne({ email: Email }).exec();
    } catch (error) {
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }

  async applyleave(req,leaveDto: leaveDto,res){
    try{
      const ver = await this.jwtService.verify(req.cookies.userlogoutcookie);

      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      if('status' in leaveDto){
        throw new HttpException(' `Status` access in forbidden', 403)
      }
      
      const user = await this.userModel.findOne({email: ver.Email}).exec()
      if(!new Date(leaveDto.leaveDate).getTime() || (leaveDto.leaveDate).length<10){
        throw new HttpException(' `leaveDate` must be in the format yyyy/mm/dd',400)
      }

      const newDate = new Date(leaveDto.leaveDate)
      if(newDate.getTime()<Date.now() || user.availableLeaves<1){
        throw new HttpException("Cannot apply leave for older dates or No leaves available", 400)
      }

      const leaveExist= await this.leaveModel.findOne({email:ver.Email,leaveDate: newDate.toISOString()})
      if(leaveExist){
        throw new HttpException(`Leave already exists`, 200)
      }
      const newLeave = await new this.leaveModel({email:ver.Email, leaveDate: newDate.toISOString()})
      return await newLeave.save()
    }catch(error){
      throw new HttpException(error.message, error.status)
    }
  }
  
 /* async approveLeave(leaveDto: leaveDto,res,req){
    try{
      const ver = await this.jwtService.verify(req.cookies.userlogoutcookie);
      const emp = await this.userModel.findOne({
        email: leaveDto.email,
      });
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      const newDate = new Date(leaveDto.leaveDate)
      console.log('email:',leaveDto.email,'leaveDate:',newDate)
      console.log('dbdate:',"2022-10-31T00:00:00.000Z")
      
     const user=await this.leaveModel.findOneAndUpdate({email:leaveDto.email,leaveDate:newDate.toISOString(),status:"Pending"},{ $set:{status:"Approved"}})
      console.log(user)
      if (user) {
        emp.availableLeaves = emp.availableLeaves - 1;
        emp.save();
      }
  }
   catch(error){

    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
   }

  

  }
  */


  async viewLeaves(req){
    try {
      const ver = await this.jwtService.verify(req.cookies.userlogoutcookie);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      return this.leaveModel.find().exec();
    } catch (error) {
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }


  async viewPendingLeave(req, status: string, res) {
    try {
      const ver = this.jwtService.verify(req.cookies.userlogoutcookie);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      const existUser = await this.leaveModel.find({
        status: status,
      }).exec();
      if (!existUser) {
        throw new HttpException('Invalid User ', 404);
      }

      res.status(200).json({
        message: `Details of user with status ${status}`,
        result: existUser,
      });
    } catch (error) {
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }
  async viewLeave(req,  res) {
    try {
      const ver = this.jwtService.verify(req.cookies.userlogoutcookie);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      const existUser = await this.leaveModel.find({
        email: ver.Email,
      }).exec();
      if (!existUser) {
        throw new HttpException('Invalid User ', 404);
      }

      res.status(200).json({
        message: `Details of user with status ${ver.Email}`,
        result: existUser,
      });
    } catch (error) {
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }
      

  async viewPendingLeaveOfUser(req, Email: string, res) {
    try {
      const ver = this.jwtService.verify(req.cookies.userlogoutcookie);
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      const existUser = await this.leaveModel.find({
        status: 'Pending',email:Email
      },userProjection).exec();

      if (!existUser) {
        throw new HttpException('Invalid User ', 404);
      }

      res.status(200).json({
        message: `Details of user with email ${Email}`,
        result: existUser,
      });
    } catch (error) {
      throw new HttpException('Login again ,Admin user Not found', 404);
    }
  }


  async approveLeave(Email:string,date:string[],res,req){
    try{
      const ver = await this.jwtService.verify(req.cookies.userlogoutcookie);
      const emp = await this.userModel.findOne({
        email:Email,
      });
      if (!ver) {
        throw new HttpException('Unauthorized admin User error ', 401);
      }
      for(let i=0;i<date.length;i++){
      const newDate = new Date(date[i])
      const user=await this.leaveModel.findOneAndUpdate({email:Email,leaveDate:newDate.toISOString(),status:"Pending"},{ $set:{status:"Approved"}})
      if (user) {
        emp.availableLeaves = emp.availableLeaves - 1;
        emp.save();
      }
    }
  }
   catch(error){

    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
   }

  

  }
  
}
