import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { NewChatDto } from './dtos';
import { WsExceptionFilter } from '@conversa/common';

@WebSocketGateway()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(new WsExceptionFilter())
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  private logger: Logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  private server: Server;

  public afterInit(server: Server): void {
    this.logger.log('Gateway Initialized!');
  }

  public handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  public handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('JOIN_CHAT')
  public handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(chatId);
    client.emit('JOINED_IN_CHAT', chatId);
  }

  @SubscribeMessage('LEAVE_CHAT')
  public handleLeaveChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(chatId);
    client.emit('LEFT_FROM_CHAT', chatId);
  }

  @SubscribeMessage('NEW_CHAT')
  public async handleNewChat(
    @MessageBody() dto: NewChatDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const chat = await this.chatService.createNewChat(dto);
    client.emit('NEW_CHAT_CREATED', chat);
  }
}
