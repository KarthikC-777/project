import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type userDocument = user & Document;

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export enum UserDesignation {
  ASE = 'Associate Software Engineer',
  SE = 'Software Engineer',
  SSE = 'Senior Software Engineer',
  EM = 'Engineering Manager',
  BD = 'Backend Developer',
}

@Schema()
export class user {
  @Prop({})
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({})
  phonenumber: number;

  @Prop({})
  address: string;

  @Prop({})
  salary: number;

  @Prop({ default: UserRole.User })
  role: string[];

  @Prop({})
  designation: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ required: true, default: 10 })
  availableLeaves: number;

  @Prop({ required: false, default: 0 })
  resetToken: string;
}
export const userSchema = SchemaFactory.createForClass(user);
