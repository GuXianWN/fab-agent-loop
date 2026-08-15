import { ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { R } from './r';

interface ErrorResponse {
  message?: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.getMessage(exception);

    response.status(status).json(R.error(status, message));
  }

  private getMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) return 'Internal server error';

    const errorResponse = exception.getResponse();
    if (typeof errorResponse === 'string') return errorResponse;

    const { message } = errorResponse as ErrorResponse;
    if (Array.isArray(message)) return message.join(', ');
    return message ?? exception.message;
  }
}
