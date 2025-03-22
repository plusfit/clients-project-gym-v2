import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { User } from '../interfaces/user.interface';
import { AuthService } from '../services/auth.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Acciones
export class Login {
  static readonly type = '[Auth] Login';
  constructor(
    public email: string,
    public password: string,
  ) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class GetCurrentUser {
  static readonly type = '[Auth] Get Current User';
}

export class RefreshSession {
  static readonly type = '[Auth] Refresh Session';
}

// Acción para establecer usuario directamente (para pruebas/mock)
export class SetMockUser {
  static readonly type = '[Auth] Set Mock User';
  constructor(public user: User) {}
}

// Estado
export interface AuthStateModel {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
})
@Injectable()
export class AuthState {
  constructor(private authService: AuthService) {
    // Al inicializar, verificamos si hay un token para iniciar automáticamente
    const token = localStorage.getItem('token');
    if (token) {
      console.log('AuthState: Token encontrado en localStorage');
    }
  }

  @Selector()
  static getUser(state: AuthStateModel) {
    return state.user;
  }

  @Selector()
  static getUserInfo(state: AuthStateModel) {
    return state.user?.userInfo;
  }

  @Selector()
  static getUserRole(state: AuthStateModel) {
    return state.user?.role;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel) {
    return state.isAuthenticated;
  }

  @Selector()
  static getToken(state: AuthStateModel) {
    return state.token;
  }

  @Selector()
  static getLoading(state: AuthStateModel) {
    return state.loading;
  }

  @Selector()
  static getError(state: AuthStateModel) {
    return state.error;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ loading: true, error: null });
    console.log('AuthState: Procesando acción Login');

    return this.authService
      .login({
        email: action.email,
        password: action.password,
      })
      .pipe(
        tap((response) => {
          console.log('AuthState: Login exitoso, actualizando estado');
          ctx.patchState({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        }),
        catchError((error) => {
          console.error('AuthState: Error en login', error);
          ctx.patchState({
            loading: false,
            error: error.message,
            isAuthenticated: false,
          });
          return of(error);
        }),
      );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true });
    console.log('AuthState: Procesando acción Logout');

    return this.authService.logout().pipe(
      tap(() => {
        console.log('AuthState: Logout exitoso, reseteando estado');
        // Reset del estado
        ctx.setState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        console.error('AuthState: Error en logout', error);
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of(error);
      }),
    );
  }

  @Action(GetCurrentUser)
  getCurrentUser(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true });
    console.log('AuthState: Procesando acción GetCurrentUser');

    return this.authService.getCurrentUser().pipe(
      tap((user) => {
        console.log('AuthState: Usuario obtenido correctamente');
        ctx.patchState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      }),
      catchError((error) => {
        console.error('AuthState: Error al obtener usuario actual', error);
        ctx.patchState({
          loading: false,
          error: error.message,
          isAuthenticated: false,
        });
        return of(error);
      }),
    );
  }

  @Action(RefreshSession)
  refreshSession(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true });
    console.log('AuthState: Procesando acción RefreshSession');

    return this.authService.refreshSession().pipe(
      tap((response) => {
        console.log('AuthState: Sesión refrescada correctamente');
        ctx.patchState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          loading: false,
        });
      }),
      catchError((error) => {
        console.error('AuthState: Error al refrescar sesión', error);
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of(error);
      }),
    );
  }

  @Action(SetMockUser)
  setMockUser(ctx: StateContext<AuthStateModel>, action: SetMockUser) {
    console.log('AuthState: Estableciendo usuario mock', action.user);

    // Actualiza el estado directamente con el usuario proporcionado
    ctx.patchState({
      user: action.user,
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    });

    return of(null);
  }
}
