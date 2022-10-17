import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type employeeDocument = employee & Document;
@Schema()
export class employee {
  @Prop({ required: true })
  empId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phonenumber: number;

  @Prop({})
  address: string;

  @Prop({ required: true })
  salary: number;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true, default: 10 })
  availableLeaves: number;
}
export const employeeSchema = SchemaFactory.createForClass(employee);
export type adminDocument = admin & Document;
@Schema()
export class admin {
  @Prop({ required: true })
  adminId: string;

  @Prop({ required: true })
  adminName: string;

  @Prop({ required: true })
  adminEmail: string;

  @Prop({ required: true })
  password: string;
}
export const adminSchema = SchemaFactory.createForClass(admin);

export type leaveDocument = leave & Document;

@Schema()
export class leave {
  @Prop()
  email: string;

  @Prop({
    type: [
      { date: { type: Date }, status: { type: String, default: 'pending' } },
    ],
  })
  leave: [
    {
      date: Date;

      status: string;
    },
  ];
}
export const leaveSchema = SchemaFactory.createForClass(leave);
