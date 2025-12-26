import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "@core/services/error-handler.service";
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
import {
	ForgotPassword,
	GetCurrentUser,
	GetNewToken,
	GoogleLogin,
	GoogleRegister,
	HidePasswordReminder,
	Login,
	Logout,
	RefreshSession,
	Register,
	SetMockUser,
	SetOnboardingCompleted,
	ShowPasswordReminder,
	UpdateUser,
} from "./auth.actions";

// Estado
export interface AuthStateModel {
	user: User | null;
	loading: boolean;
	error: string | null;
	auth: any;
	showPasswordReminder: boolean;
	registeredPassword?: string;
}

@Injectable()
@State<AuthStateModel>({
	name: "auth",
	defaults: {
		user: null,
		loading: false,
		error: null,
		auth: null,
		showPasswordReminder: false,
		registeredPassword: undefined,
	},
})
export class AuthState {
	constructor(
		private authService: AuthService,
		private toastService: ToastService,
		private errorHandler: ErrorHandlerService,
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

	@Selector()
	static getShowPasswordReminder(state: AuthStateModel): boolean {
		return state.showPasswordReminder;
	}

	@Selector()
	static getRegisteredPassword(state: AuthStateModel): string | undefined {
		return state.registeredPassword;
	}

	@Action(Login, { cancelUncompleted: true })
	login(ctx: StateContext<AuthStateModel>, action: Login): Observable<AuthResponse> {
		ctx.patchState({ loading: true });

		return this.authService.loginFirebase(action.credentials).pipe(
			exhaustMap((response: FirebaseAuthResponse) => {
				return this.authService
          .login(
            response._tokenResponse.idToken,
            action.credentials.recaptchaToken,
            action.credentials.password,
          )
          .pipe(
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
				const errorMessage = this.errorHandler.handleError(err, false);
				ctx.patchState({
					loading: false,
					error: errorMessage,
				});
				this.toastService.showError("Credenciales incorrectas");
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
					showPasswordReminder: false,
					registeredPassword: undefined,
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
				// Solo desconectamos al usuario si es un error de autenticación (401/403)
				if (error.status === 401 || error.status === 403) {
					ctx.dispatch(new Logout());
				}
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
		const { email, password, recaptchaToken } = action.credentials;
		return this.authService.registerFirebase(email, password).pipe(
			exhaustMap((firebaseResponse: FirebaseRegisterResponse) => {
				return this.authService.register(firebaseResponse.user.email, password, undefined, undefined, recaptchaToken, action.credentials.invitationCode).pipe(
					tap((res: RegisterResponse) => {
						this.toastService.showSuccess("Usuario registrado correctamente");
						// Almacenar la contraseña y mostrar el modal de recordatorio
						ctx.patchState({
							showPasswordReminder: true,
							registeredPassword: password,
						});
					}),
				);
			}),
			tap(() => {
				ctx.patchState({ loading: false });
			}),
			catchError((err: unknown) => {
				const errorMessage = this.errorHandler.handleError(err, false);
				ctx.patchState({
					loading: false,
					error: errorMessage,
				});
				this.toastService.showError(errorMessage);
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
				window.location.reload()
			}),
			catchError((err: HttpErrorResponse) => {
				this.toastService.showError("Sesion Expirada. Por favor inicie sesion nuevamente");
				//ctx.dispatch(new Logout());
				return throwError(() => err);
			}),
		);
	}

	@Action(GoogleLogin, { cancelUncompleted: true })
	googleLogin(ctx: StateContext<AuthStateModel>, action: GoogleLogin): Observable<any> {
		ctx.patchState({ loading: true });

		return this.authService.signInWithGoogle().pipe(
			switchMap((response: any) => {
				// Convertir Promise a Observable con casting a string
				return from(response.user.getIdToken() as Promise<string>).pipe(
					switchMap((idToken: string) => {
						const displayName = response.user.displayName || "";
						const photoURL = response.user.photoURL || "";

						return this.authService.googleAuth(idToken, displayName, photoURL, action.recaptchaToken, action.invitationCode).pipe(
							tap((authResponse: any) => {
								// La respuesta tiene estructura {success: true, data: {accessToken, refreshToken}}
								if (!authResponse || !authResponse.data) {
									throw new Error("Invalid response structure from server");
								}

								const { accessToken, refreshToken } = authResponse.data;

								if (!accessToken || typeof accessToken !== "string") {
									throw new Error("Invalid access token received from server");
								}

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
	googleRegister(ctx: StateContext<AuthStateModel>, action: GoogleRegister): Observable<any> {
		ctx.patchState({ loading: true });

		return this.authService.signInWithGoogle().pipe(
			switchMap((response: any) => {
				// Convertir Promise a Observable con casting a string
				return from(response.user.getIdToken() as Promise<string>).pipe(
					switchMap((idToken: string) => {
						const displayName = response.user.displayName || "";
						const photoURL = response.user.photoURL || "";

						return this.authService.googleAuth(idToken, displayName, photoURL, action.recaptchaToken, action.invitationCode).pipe(
							tap((authResponse: any) => {
								// La respuesta tiene estructura {success: true, data: {accessToken, refreshToken}}
								if (!authResponse || !authResponse.data) {
									throw new Error("Invalid response structure from server");
								}

								const { accessToken, refreshToken } = authResponse.data;

								if (!accessToken || typeof accessToken !== "string") {
									throw new Error("Invalid access token received from server");
								}

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
					isOnboardingCompleted: true,
				},
			});
		}
	}

	@Action(UpdateUser)
	updateUser(ctx: StateContext<AuthStateModel>, action: UpdateUser) {
		ctx.patchState({ user: action.user });
	}

	@Action(ShowPasswordReminder)
	showPasswordReminder(ctx: StateContext<AuthStateModel>, action: ShowPasswordReminder) {
		ctx.patchState({
			showPasswordReminder: true,
			registeredPassword: action.password,
		});
	}

	@Action(HidePasswordReminder)
	hidePasswordReminder(ctx: StateContext<AuthStateModel>) {
		ctx.patchState({
			showPasswordReminder: false,
			registeredPassword: undefined,
		});
	}

	@Action(ForgotPassword)
	forgotPassword(ctx: StateContext<AuthStateModel>, action: ForgotPassword): Observable<any> {
		ctx.patchState({ loading: true });

		return this.authService.forgotPassword(action.email).pipe(
			tap(() => {
				ctx.patchState({ loading: false });
				this.toastService.showSuccess("Se ha enviado un correo de recuperación de contraseña");
			}),
			catchError((error) => {
				ctx.patchState({
					loading: false,
					error: error.message || "Error al enviar correo de recuperación",
				});
				this.toastService.showError(
					"No se pudo enviar el correo de recuperación. Verifica que la dirección sea correcta",
				);
				return throwError(() => error);
			}),
		);
	}
}
