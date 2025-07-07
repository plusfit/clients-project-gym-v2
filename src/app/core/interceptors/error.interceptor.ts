import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { Observable, catchError, throwError } from 'rxjs';

export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Usar el servicio centralizado para manejar errores
      errorHandler.handleError(err);
      return throwError(() => err);
    }),
  );
}
