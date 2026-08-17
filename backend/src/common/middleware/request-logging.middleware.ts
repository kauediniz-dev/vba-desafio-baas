import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = Date.now();

    const correlationId =
      request.header('x-correlation-id')?.trim() || randomUUID();

    response.setHeader('x-correlation-id', correlationId);

    this.logger.log(
      `[${correlationId}] ${request.method} ${request.originalUrl}`,
    );

    response.on('finish', () => {
      const duration = Date.now() - startedAt;

      this.logger.log(
        `[${correlationId}] ${response.statusCode} ${request.method} ${request.originalUrl} - ${duration}ms`,
      );
    });

    next();
  }
}
