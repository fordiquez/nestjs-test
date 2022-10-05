import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from "@nestjs/swagger";

export type UserDocument = User & Document;

@Schema()
export class User {
  @ApiProperty()
  @Prop()
  id: string;

  @ApiProperty({ uniqueItems: true })
  @Prop({ unique: true })
  name: string;

  @ApiProperty({ default: 0 })
  @Prop({ default: 0 })
  balance: number;

  @ApiProperty({ default: 'USD', maxLength: 3 })
  @Prop({ default: 'USD', maxlength: 3 })
  currency: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
