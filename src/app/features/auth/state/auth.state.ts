import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { User } from '../interfaces/user.interface';
import { AuthService } from '../services/auth.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Acciones
export class Login {
  static readonly type = '[Auth] Login';
  constructor(public credentials: { email: string; password: string }) {}
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
  loading: boolean;
  error: string | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
})
@Injectable()
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

  @Action(SetMockUser)
  setMockUser(ctx: StateContext<AuthStateModel>, action: SetMockUser) {
    ctx.patchState({
      user: action.user,
      loading: false,
      error: null,
    });
  }
}
