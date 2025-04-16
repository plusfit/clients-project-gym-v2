import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { ToastService } from "@shared/services/toast.service";
import { jwtDecode } from "jwt-decode";
import { Observable, of, throwError } from "rxjs";
import { catchError, exhaustMap, tap } from "rxjs/operators";
import {
	AuthResponse,
	FirebaseAuthResponse,
	FirebaseRegisterResponse,
	RegisterCredentials,
	RegisterResponse,
	User,
} from "../interfaces/user.interface";
import { AuthService } from "../services/auth.service";
import { GetCurrentUser, Login, Logout, RefreshSession, Register, SetMockUser } from "./auth.actions";

// Estado
export interface AuthStateModel {
	user: User | null;
	token: string | null;
	loading: boolean;
	error: string | null;
	auth: any;
}

@Injectable()
@State<AuthStateModel>({
	name: "auth",
	defaults: {
		user: null,
		token: null,
		loading: false,
		error: null,
		auth: null,
	},
})
export class AuthState {
	constructor(
		private authService: AuthService,
		private toastService: ToastService,
	) {
		// Intenta recuperar el token al inicializar el estado
		const token = localStorage.getItem("token");
		if (token) {
			// Token encontrado, actualizamos el estado
			setTimeout(() => {
				this.authService.getCurrentUser().subscribe();
			}, 0);
		}
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

	//		@Action(Login)
	//		_login(ctx: StateContext<AuthStateModel>, action: Login) {
	//			ctx.patchState({ loading: true, error: null });

	//			return this.authService
	//				.login({
	//					email: action.credentials.email,
	//					password: action.credentials.password,
	//				})
	//				.pipe(
	//					tap((response) => {
	//						ctx.patchState({
	//							user: response.user,
	//							token: response.token,
	//							loading: false,
	//							error: null,
	//						});
	//					}),
	//					catchError((error) => {
	//						ctx.patchState({
	//							loading: false,
	//							error: error.message || "Error de autenticación",
	//						});
	//						return of(error);
	//					}),
	//				);
	//		}

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
					token: null,
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

	@Action(RefreshSession)
	refreshSession(ctx: StateContext<AuthStateModel>) {
		ctx.patchState({ loading: true });

		return this.authService.refreshSession().pipe(
			tap((response) => {
				ctx.patchState({
					user: response.user,
					token: response.token,
					loading: false,
					error: null,
				});
			}),
			catchError((error) => {
				ctx.patchState({
					loading: false,
					error: error.message || "Error al refrescar sesión",
				});
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
}
