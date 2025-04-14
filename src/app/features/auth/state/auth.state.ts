import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, of, throwError } from 'rxjs';
import { catchError, exhaustMap, tap } from 'rxjs/operators';
import {
  FirebaseRegisterResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
} from '../interfaces/user.interface';
import { AuthService } from '../services/auth.service';
import { GetCurrentUser, Login, Logout, RefreshSession, Register, SetMockUser } from './auth.actions';

// Estado
export interface AuthStateModel {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

@Injectable()
@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
})
export class AuthState {
  constructor(private authService: AuthService) {
    // Intenta recuperar el token al inicializar el estado
    const token = localStorage.getItem('token');
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

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ loading: true, error: null });

    return this.authService
      .login({
        email: action.credentials.email,
        password: action.credentials.password,
      })
      .pipe(
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
            error: error.message || 'Error de autenticación',
          });
          return of(error);
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
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error al cerrar sesión',
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
          error: error.message || 'Error al obtener usuario',
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
          error: error.message || 'Error al refrescar sesión',
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
  register(
    ctx: StateContext<AuthStateModel>,
    action: Register,
  ): Observable<RegisterResponse> {
    ctx.patchState({ loading: true });
    const { email, password } = action.credentials;
    return this.authService.registerFirebase(email, password).pipe(
      exhaustMap((firebaseResponse: FirebaseRegisterResponse) => {
        return this.authService.register(firebaseResponse.user.email).pipe(
          tap((res: RegisterResponse) => {
            // ctx.patchState({
            //   registerClient: {
            //     _id: res.data._id,
            //     identifier: res.data.identifier,
            //     role: res.data.role,
            //   },
            // });
          }),
        );
      }),
      tap(() => {
        ctx.patchState({ loading: false });
      }),
      catchError((err: any) => {
        //TODO: NAHUE COMO LLAMO ACA AL SNACKBAR??
        // ctx.patchState({ loading: false });
        // this.snackBarService.showError(
        //   'Error al crear Cliente',
        //   this.getFriendlyErrorMessage(err),
        // );
        return throwError(() => err);
      }),
    );
  }
}
