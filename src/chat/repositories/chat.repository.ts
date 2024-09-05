import { BaseEntityRepository } from '@conversa/database';
import { Injectable, Logger } from '@nestjs/common';
import { Chat } from '../schemas';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

@Injectable()
export class ChatRepository extends BaseEntityRepository<Chat> {
  protected readonly logger = new Logger(ChatRepository.name);

  constructor(
    @InjectModel(Chat.name) protected readonly chatModel: Model<Chat>,
    @InjectConnection() protected readonly connection: Connection,
  ) {
    super(chatModel, connection);
  }
}
