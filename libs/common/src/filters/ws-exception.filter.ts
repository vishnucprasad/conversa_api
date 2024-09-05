import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException, BadRequestException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();

    let errorMessage = 'An error occurred';

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response['message']) {
        errorMessage = response['message']; // Extract validation errors
      }
    } else if (
      exception instanceof WsException ||
      exception instanceof HttpException
    ) {
      errorMessage = exception.message;
    }

    client.emit('EXCEPTION', {
      status: 'Web socket exception',
      message: errorMessage,
    });
  }
}
