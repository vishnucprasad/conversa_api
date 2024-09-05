import { BaseEntity } from '@conversa/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ChatType } from '../types/chat.types';
import { Model, Types } from 'mongoose';
import { ConflictException } from '@nestjs/common';

@Schema({ versionKey: false, timestamps: true, collection: 'chats' })
export class Chat extends BaseEntity {
  @Prop({ type: String, enum: ChatType, required: true })
  type: ChatType;

  @Prop({ type: [Types.ObjectId], required: true })
  members: Array<Types.ObjectId>;

  @Prop()
  chatName?: string;

  @Prop()
  chatIcon?: string;

  @Prop({ type: [Types.ObjectId] })
  admins?: Array<Types.ObjectId>;

  @Prop({ type: [Types.ObjectId], default: [] })
  messages?: Array<Types.ObjectId>;

  @Prop({ type: Types.ObjectId })
  lastMessage?: Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.pre('save', async function (next) {
  if (this.isNew && this.type === ChatType.PRIVATE) {
    const existingChat = await (this.constructor as Model<Chat & Document>)
      .findOne({
        type: ChatType.PRIVATE,
        members: { $all: this.members },
      })
      .exec();

    if (existingChat) {
      return next(
        new ConflictException(
          'A private chat with the same members already exists.',
        ),
      );
    }
  }
  next();
});
