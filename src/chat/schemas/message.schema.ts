import { BaseEntity } from '@conversa/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { MessageStatus, MessageType } from '../types';

@Schema({ versionKey: false, timestamps: true, collection: 'messages' })
export class Message extends BaseEntity {
  @Prop({ required: true })
  chatId: Types.ObjectId;

  @Prop({ required: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, enum: MessageType, required: true })
  type: MessageType;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  content: any;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: String, enum: MessageStatus, default: MessageStatus.SENT })
  status?: MessageStatus;

  @Prop()
  replayTo?: Types.ObjectId;

  @Prop({ default: false })
  forwarded?: boolean;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
