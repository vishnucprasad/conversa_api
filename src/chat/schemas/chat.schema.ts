import { BaseEntity } from '@conversa/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ChatType } from '../types/chat.types';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: 'chats' })
export class Chat extends BaseEntity {
  @Prop({ type: String, enum: ChatType, requried: true })
  type: ChatType;

  @Prop({ required: true, minlength: 2 })
  members: Array<Types.ObjectId>;

  @Prop()
  chatName?: string;

  @Prop()
  chatIcon?: string;

  @Prop()
  admins?: Array<Types.ObjectId>;

  @Prop({ default: [] })
  messages?: Array<Types.ObjectId>;

  @Prop()
  lastMessage?: Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
