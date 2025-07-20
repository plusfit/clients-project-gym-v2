import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { UtilsService } from "@core/services/utils.service";
import { GetNewToken, Logout } from "@feature/auth/state/auth.actions";
import { AuthState } from "@feature/auth/state/auth.state";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import { Observable, catchError, throwError } from "rxjs";

const handleUnauthorizedError = (
	actions: Actions,
	err: HttpErrorResponse,
	isAccessTokenExpired: boolean,
	isRefreshTokenExpired: boolean,
	store: Store,
	utilsService: UtilsService,
	zone: NgZone,
	router: Router,
): void => {

	if (err.status === 401 || err.status === 0) {
		console.log('Error 401 detectado. Procesando logout automático...');
		if (isAccessTokenExpired && !isRefreshTokenExpired) {
			console.log('Intentando renovar token...');
			store.dispatch(
				new GetNewToken({
					refreshToken: store.selectSnapshot(AuthState.refreshToken),
				}),
			);
		} else {
			console.log('Cerrando sesión automáticamente...');
			utilsService.cleanStorage();
			store.dispatch(new Logout()).subscribe({
				complete: () => {
					console.log('Logout completado, navegando a login...');
					zone.run(() => router.navigate(['/login'], { replaceUrl: true }));
				},
				error: (error) => {
					console.error('Error en logout, navegando a login de todas formas:', error);
					zone.run(() => router.navigate(['/login'], { replaceUrl: true }));
				}
			});
		}
	}
};

export const authorizeInterceptor: HttpInterceptorFn = (
	request: HttpRequest<unknown>,
	next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
	const actions = inject(Actions);
	const router = inject(Router);
	const zone = inject(NgZone);
	const store = inject(Store);
	const utilsService = inject(UtilsService);
	const accessToken = store.selectSnapshot(AuthState.accessToken);
	const refreshToken = store.selectSnapshot(AuthState.refreshToken);
	if (!accessToken) {
		return next(request);
	}
	if (!refreshToken) {
		return next(request);
	}

	const isAccessTokenExpired = utilsService.isTokenExpired(accessToken);

	const isRefreshTokenExpired = utilsService.isTokenExpired(refreshToken);

	return next(request).pipe(
		catchError((err: HttpErrorResponse) => {
			if (err instanceof HttpErrorResponse) {
				handleUnauthorizedError(
					actions,
					err,
					isAccessTokenExpired,
					isRefreshTokenExpired,
					store,
					utilsService,
					zone,
					router,
				);
			}
			return throwError(() => err);
		}),
	);
};
