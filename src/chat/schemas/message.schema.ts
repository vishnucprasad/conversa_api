import { BaseEntity } from '@conversa/database';
import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MessageStatus, MessageType } from '../types';

@Schema({ versionKey: false, timestamps: true, collection: 'messages' })
export class Message extends BaseEntity {
  @Prop({ required: true })
  chatId: Types.ObjectId;

  @Prop({ required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  type: MessageType;

  @Prop({ required: true })
  content: any;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ default: MessageStatus.sent })
  status?: MessageStatus;

  @Prop()
  replayTo?: Types.ObjectId;

  @Prop({ default: false })
  forwarded?: boolean;
}
