import { State, Action, StateContext, Selector } from '@ngxs/store';

import { UserService } from '../services/user.service';
import { catchError, tap } from 'rxjs/operators';
import { User } from '@feature/profile/interfaces/user.interface';
import { Injectable } from '@angular/core';
import { LoadUser } from './user.actions';
import { of } from 'rxjs';

export interface UserStateModel {
  user: User | null;
  loading: boolean;
  error: string | null;
}

@Injectable()
@State<UserStateModel>({
  name: 'user',
  defaults: {
    loading: false,
    user: null,
    error: null,
  },
})
export class UserState {
  constructor(private userService: UserService) {}

  @Selector()
  static getUser(state: UserStateModel): User | null {
    return state.user;
  }

  @Action(LoadUser, { cancelUncompleted: true })
  loadUser(ctx: StateContext<UserStateModel>, action: LoadUser) {
    return this.userService.getUser(action.id).pipe(
      tap((user) => {
        ctx.patchState({
          user: user,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error al cargar el usuario',
        });
        return of(error);
      }),
    );
  }
}
