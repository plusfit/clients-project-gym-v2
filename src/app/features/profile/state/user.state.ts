import { State, Action, StateContext, Selector } from '@ngxs/store';

import { UserService } from '../services/user.service';
import { catchError, tap } from 'rxjs/operators';
import { User } from '@feature/profile/interfaces/user.interface';
import { Injectable } from '@angular/core';
import { LoadPlan, LoadUser } from './user.actions';
import { of } from 'rxjs';
import { Plan } from '../interfaces/plan.interface';

export interface UserStateModel {
  user: User | null;
  plan: any | null;
  loading: boolean;
  error: string | null;
}

@Injectable()
@State<UserStateModel>({
  name: 'user',
  defaults: {
    loading: false,
    user: null,
    plan: null,
    error: null,
  },
})
export class UserState {
  constructor(private userService: UserService) {}

  @Selector()
  static getUser(state: UserStateModel): User | null {
    return state.user;
  }

  @Selector()
  static getPlan(state: UserStateModel): Plan | null {
    return state.plan;
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

  @Action(LoadPlan, { cancelUncompleted: true })
  getPlan(ctx: StateContext<UserStateModel>, action: LoadPlan) {
    ctx.patchState({ loading: true, error: null });

    return this.userService.getPlanById(action.planId).pipe(
      tap((plan) => ctx.patchState({ plan, loading: false })),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error al cargar el plan',
        });
        return of(null);
      }),
    );
  }
}
