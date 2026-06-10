import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  InvalidStatusTransition,
  NotAssignedReviewer,
  NotRequestOwner,
  RequestNotEditable,
} from '../../requests/domain/errors';

// Translates framework-free domain errors into HTTP responses at the edge,
// so the domain layer never needs to know about status codes.
@Catch(
  NotRequestOwner,
  RequestNotEditable,
  InvalidStatusTransition,
  NotAssignedReviewer,
)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const [status, message] = this.mapToHttp(exception);
    response.status(status).json({ statusCode: status, message });
  }

  private mapToHttp(exception: Error): [number, string] {
    if (exception instanceof NotRequestOwner) {
      return [HttpStatus.FORBIDDEN, 'Not your request'];
    }
    if (exception instanceof NotAssignedReviewer) {
      return [
        HttpStatus.FORBIDDEN,
        'Another reviewer is assigned to this request',
      ];
    }
    if (exception instanceof InvalidStatusTransition) {
      return [
        HttpStatus.UNPROCESSABLE_ENTITY,
        'This status transition is not allowed',
      ];
    }
    return [
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Request is not editable in its current status',
    ];
  }
}
