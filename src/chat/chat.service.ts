import { Injectable } from '@nestjs/common';
import { NewChatDto } from './dtos';
import { ChatRepository } from './repositories';
import { Chat } from './schemas';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepo: ChatRepository) {}

  public async createNewChat(dto: NewChatDto): Promise<Chat> {
    const session = await this.chatRepo.startTransaction();

    try {
      const chat = await this.chatRepo.create({ ...dto }, { session });
      await session.commitTransaction();
      return chat;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
