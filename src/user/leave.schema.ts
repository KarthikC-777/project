import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type leaveDocument = leave & Document;

@Schema()
export class leave {
  @Prop({})
  email: string;

  @Prop({ required: true })
  leaveDate: string;

  @Prop({ default: 'Pending' })
  status: string;
}

export const leaveschema = SchemaFactory.createForClass(leave);
