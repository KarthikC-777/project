import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type userDocument = user & Document;

export enum UserRole {
  User = 'user',
  Admin = 'admin',
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

  @Prop({ default: 'active' })
  status: string;

  @Prop({ required: true, default: 10 })
  availableLeaves: number;
}
export const userSchema = SchemaFactory.createForClass(user);
