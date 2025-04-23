import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { ErrorMessages } from "@core/enums/messages.enum";
import { ToastService } from "@shared/services/toast.service";
import { Observable, catchError, throwError } from "rxjs";

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
	const snackBar = inject(ToastService);

	return next(req).pipe(
		catchError((err: HttpErrorResponse) => {
			let message = "";
			if (err.error instanceof ProgressEvent) {
				// Client Side
				switch (err.status) {
					case 0:
						message = ErrorMessages.ConnectionError;
						break;
					case 503:
						message = ErrorMessages.ServiceUnavailable;
						break;
					default:
						message = err.statusText;
						break;
				}
			} else {
				// Server Side
				message = err.error.message ? err.error.message : err.statusText;
			}

			if (message === "Failed to fetch") {
				message = "Por favor recargue la página";
			}
			snackBar.showError(message);
			return throwError(() => err);
		}),
	);
}
