import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException, BadRequestException, ConflictException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();

    let code = 'UNEXPECTED_EXCEPTION';
    let errorMessage = 'An error occurred';

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response['message']) {
        code = 'VALIDATION_EXCEPTION';
        errorMessage = response['message']; // Extract validation errors
      }
    } else if (exception instanceof ConflictException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response['message']) {
        code = 'CONFLICT_EXCEPTION';
        errorMessage = response['message']; // Extract validation errors
      }
    } else if (
      exception instanceof WsException ||
      exception instanceof HttpException
    ) {
      errorMessage = exception.message;
    }

    client.emit('EXCEPTION', {
      code: code,
      message: errorMessage,
    });
  }
}
