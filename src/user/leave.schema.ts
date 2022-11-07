import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type leaveDocument = leave & Document;

export enum statusEnum {
  false = 'Pending',
  true = 'Approved',
}

@Schema()
export class leave {
  @Prop({})
  email: string;

  @Prop({ required: true })
  leaveDate: string;

  @Prop({ default: false })
  status: boolean;
  @Prop()
  approveLink: string;
  @Prop()
  rejectLink: string;
  @Prop()
  rejected: boolean;
}

export const leaveschema = SchemaFactory.createForClass(leave);
