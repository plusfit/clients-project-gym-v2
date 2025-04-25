import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { ToastService } from "@shared/services/toast.service";
import { jwtDecode } from "jwt-decode";
import { Observable, from, of, throwError } from "rxjs";
import { catchError, exhaustMap, switchMap, tap } from "rxjs/operators";
import {
	AuthResponse,
	FirebaseAuthResponse,
	FirebaseRegisterResponse,
	RegisterCredentials,
	RegisterResponse,
	User,
} from "../interfaces/user.interface";
import { AuthService } from "../services/auth.service";
import { GetCurrentUser, GetNewToken, GoogleLogin, GoogleRegister, Login, Logout, RefreshSession, Register, SetMockUser, SetOnboardingCompleted, UpdateUser } from "./auth.actions";

// Estado
export interface AuthStateModel {
	user: User | null;
	loading: boolean;
	error: string | null;
	auth: any;
}

@Injectable()
@State<AuthStateModel>({
	name: "auth",
	defaults: {
		user: null,

		loading: false,
		error: null,
		auth: null,
	},
})
export class AuthState {
	constructor(
		private authService: AuthService,
		private toastService: ToastService,
	) {}

	@Selector()
	static accessToken(state: AuthStateModel): string | undefined {
		return state.auth?.accessToken;
	}

	@Selector()
	static refreshToken(state: AuthStateModel): string | undefined {
		return state.auth?.refreshToken;
	}

	@Selector()
	static getUser(state: AuthStateModel): User | null {
		return state.user;
	}

	@Selector()
	static isAuthenticated(state: AuthStateModel): boolean {
		return !!state.user;
	}

	@Selector()
	static isLoading(state: AuthStateModel): boolean {
		return state.loading;
	}

	@Selector()
	static getError(state: AuthStateModel): string | null {
		return state.error;
	}

	@Action(Login, { cancelUncompleted: true })
	login(ctx: StateContext<AuthStateModel>, action: Login): Observable<AuthResponse> {
		ctx.patchState({ loading: true });

		return this.authService.loginFirebase(action.credentials).pipe(
			exhaustMap((response: FirebaseAuthResponse) => {
				return this.authService.login(response._tokenResponse.idToken).pipe(
					tap((authResponse: any) => {
						const { accessToken, refreshToken } = authResponse.data;

						const decodedUser = jwtDecode<User>(accessToken);

						ctx.patchState({
							auth: {
								accessToken,
								refreshToken,
							},
							user: decodedUser,
						});
					}),
				);
			}),
			tap(() => {
				ctx.patchState({ loading: false });
			}),
			catchError((err: HttpErrorResponse) => {
				ctx.patchState({
					loading: false,
					error: err.message || "Error al ingresar",
				});
				this.toastService.showError("Login Erróneo");
				return throwError(() => err);
			}),
		);
	}

	@Action(Logout)
	logout(ctx: StateContext<AuthStateModel>) {
		ctx.patchState({ loading: true });

		return this.authService.logout().pipe(
			tap(() => {
				ctx.setState({
					user: null,
					loading: false,
					error: null,
					auth: null,
				});
			}),
			catchError((error) => {
				ctx.patchState({
					loading: false,
					error: error.message || "Error al cerrar sesión",
				});
				return of(error);
			}),
		);
	}

	@Action(GetCurrentUser)
	getCurrentUser(ctx: StateContext<AuthStateModel>) {
		ctx.patchState({ loading: true });

		return this.authService.getCurrentUser().pipe(
			tap((user) => {
				ctx.patchState({
					user,
					loading: false,
					error: null,
				});
			}),
			catchError((error) => {
				ctx.patchState({
					loading: false,
					error: error.message || "Error al obtener usuario",
				});
				// Desconectamos al usuario en caso de error
				ctx.dispatch(new Logout());
				return of(error);
			}),
		);
	}

	@Action(SetMockUser, { cancelUncompleted: true })
	setMockUser(ctx: StateContext<AuthStateModel>, action: SetMockUser) {
		ctx.patchState({
			user: action.user,
			loading: false,
			error: null,
		});
	}

	@Action(Register, { cancelUncompleted: true })
	register(ctx: StateContext<AuthStateModel>, action: Register): Observable<RegisterResponse> {
		ctx.patchState({ loading: true });
		const { email, password } = action.credentials;
		return this.authService.registerFirebase(email, password).pipe(
			exhaustMap((firebaseResponse: FirebaseRegisterResponse) => {
				return this.authService.register(firebaseResponse.user.email).pipe(
					tap((res: RegisterResponse) => {
						this.toastService.showSuccess("Usuario registrado correctamente");
					}),
				);
			}),
			tap(() => {
				ctx.patchState({ loading: false });
			}),
			catchError((err: any) => {
				ctx.patchState({
					loading: false,
					error: err.message || "Error al registrar usuario",
				});
				this.toastService.showError(ctx.getState().error || "Error al registrar usuario");
				return throwError(() => err);
			}),
		);
	}

	@Action(GetNewToken, { cancelUncompleted: true })
	getNewToken(ctx: StateContext<AuthStateModel>, action: GetNewToken): Observable<AuthResponse> {
		const refreshToken = action.payload;
		return this.authService.getNewToken(refreshToken).pipe(
			tap((authResponse: any) => {
				const { accessToken, refreshToken } = authResponse.data;
				ctx.patchState({
					auth: {
						accessToken,
						refreshToken,
					},
				});
			}),
			catchError((err: HttpErrorResponse) => {
				this.toastService.showError("Sesion Expirada. Por favor inicie sesion nuevamente");
				//ctx.dispatch(new Logout());
				return throwError(() => err);
			}),
		);
	}

	@Action(GoogleLogin, { cancelUncompleted: true })
	googleLogin(ctx: StateContext<AuthStateModel>): Observable<any> {
		ctx.patchState({ loading: true });

		return this.authService.signInWithGoogle().pipe(
			switchMap((response: any) => {
				// Convertir Promise a Observable con casting a string
				return from(response.user.getIdToken() as Promise<string>).pipe(
					switchMap((idToken: string) => {
						const displayName = response.user.displayName || '';
						const photoURL = response.user.photoURL || '';

						return this.authService.googleAuth(idToken, displayName, photoURL).pipe(
							tap((authResponse: any) => {

								// La respuesta tiene estructura {success: true, data: {accessToken, refreshToken}}
								if (!authResponse || !authResponse.data) {
									throw new Error('Invalid response structure from server');
								}

								const { accessToken, refreshToken } = authResponse.data;

								if (!accessToken || typeof accessToken !== 'string') {
									throw new Error('Invalid access token received from server');
								}

								const decodedUser = jwtDecode<User>(accessToken);

								ctx.patchState({
									auth: {
										accessToken,
										refreshToken,
									},
									user: decodedUser,
								});
							})
						);
					})
				);
			}),
			tap(() => {
				ctx.patchState({ loading: false });
				this.toastService.showSuccess("Inicio de sesión con Google exitoso");
			}),
			catchError((err: HttpErrorResponse) => {
				ctx.patchState({
					loading: false,
					error: err.message || "Error al ingresar con Google",
				});
				this.toastService.showError("Error al ingresar con Google");
				return throwError(() => err);
			}),
		);
	}

	@Action(GoogleRegister, { cancelUncompleted: true })
	googleRegister(ctx: StateContext<AuthStateModel>): Observable<any> {
		ctx.patchState({ loading: true });

		return this.authService.signInWithGoogle().pipe(
			switchMap((response: any) => {
				// Convertir Promise a Observable con casting a string
				return from(response.user.getIdToken() as Promise<string>).pipe(
					switchMap((idToken: string) => {
						const displayName = response.user.displayName || '';
						const photoURL = response.user.photoURL || '';

						return this.authService.googleAuth(idToken, displayName, photoURL).pipe(
							tap((authResponse: any) => {

								// La respuesta tiene estructura {success: true, data: {accessToken, refreshToken}}
								if (!authResponse || !authResponse.data) {
									throw new Error('Invalid response structure from server');
								}

								const { accessToken, refreshToken } = authResponse.data;

								if (!accessToken || typeof accessToken !== 'string') {
									throw new Error('Invalid access token received from server');
								}

								const decodedUser = jwtDecode<User>(accessToken);

								ctx.patchState({
									auth: {
										accessToken,
										refreshToken,
									},
									user: decodedUser,
								});
							})
						);
					})
				);
			}),
			tap(() => {
				ctx.patchState({ loading: false });
				this.toastService.showSuccess("Registro con Google exitoso");
			}),
			catchError((err: HttpErrorResponse) => {
				ctx.patchState({
					loading: false,
					error: err.message || "Error al registrarse con Google",
				});
				this.toastService.showError("Error al registrarse con Google");
				return throwError(() => err);
			}),
		);
	}

	@Action(SetOnboardingCompleted)
	setOnboardingCompleted(ctx: StateContext<AuthStateModel>) {
		const state = ctx.getState();
		const user = state.user;

		if (user) {
			ctx.patchState({
				user: {
					...user,
					onboardingCompleted: true
				}
			});
		}
	}

	@Action(UpdateUser)
	updateUser(ctx: StateContext<AuthStateModel>, action: UpdateUser) {
		ctx.patchState({ user: action.user });
	}
}
