import { Injectable } from '@nestjs/common';
import { NewChatDto } from './dtos';
import { ChatRepository } from './repositories';
import { Chat } from './schemas';
import { UserRepository } from 'src/auth/repositories';
import { Types } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly userRepo: UserRepository,
  ) {}

  public async createNewChat(dto: NewChatDto): Promise<Chat> {
    const session = await this.chatRepo.startTransaction();

    try {
      const chat = await this.chatRepo.create({ ...dto }, { session });
      await this.updateNewChatToMembers(chat.members, chat._id);
      await session.commitTransaction();
      return chat;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  public async updateNewChatToMembers(
    members: Array<Types.ObjectId>,
    chatId: Types.ObjectId,
  ): Promise<void> {
    const session = await this.userRepo.startTransaction();

    try {
      await this.userRepo.updateMany(
        {
          _id: { $in: members },
        },
        {
          $push: { chats: chatId },
        },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
