import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date } from "mongoose";

export type leaveDocument = leave & Document;

@Schema()
export class leave {
    @Prop({})
    email: string;

    @Prop({required:true})
    leaveDate: string;

    @Prop({default: "Pending"})
    status: string;
}

export const leaveSchema = SchemaFactory.createForClass(leave);