import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Request, Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request as any).correlationId || 'unknown';
    const i18n = I18nContext.current();

    // Handle NotFoundException for non-API routes - try to serve frontend
    if (exception instanceof NotFoundException && !request.path.startsWith('/api')) {
      const frontendPath = join(process.cwd(), 'frontend');
      const indexPath = join(frontendPath, 'index.html');
      
      if (existsSync(indexPath)) {
        this.logger.log(`[${correlationId}] Serving frontend for ${request.path}`);
        return response.sendFile(indexPath);
      }
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = i18n?.t('common.INTERNAL_SERVER_ERROR') || 'Internal server error';
    let code = 'UNKNOWN_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const rawMessage = (exceptionResponse as any).message || exception.message;
        // If message is already translated or is a simple string, use it as is
        // Otherwise, try to translate it
        message = rawMessage;
        code = (exceptionResponse as any).code || 'HTTP_EXCEPTION';
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = 'ERROR';
    }

    const errorResponse = {
      code,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}

