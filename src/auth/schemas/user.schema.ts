import { BaseEntity } from '@conversa/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'users' })
export class User extends BaseEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hash: string;

  @Prop()
  rtHash?: string;

  @Prop({ default: Date.now() })
  lastSeen?: Date;

  @Prop({ default: false })
  isOnline?: boolean;

  @Prop({ default: [] })
  chats?: Array<Types.ObjectId>;
}

export const UserSchema = SchemaFactory.createForClass(User);
