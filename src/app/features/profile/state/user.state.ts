import { State, Action, StateContext, Selector } from '@ngxs/store';

import { UserService } from '../services/user.service';
import { tap } from 'rxjs/operators';
import { User } from '@feature/profile/interfaces/user.interface';
import { Injectable } from '@angular/core';

export interface UserStateModel {
  user: User | null;
}

// Actions
export class LoadUser {
  static readonly type = '[User] Load';
  constructor() {}
}

@Injectable()
@State<UserStateModel>({
  name: 'user',
  defaults: {
    user: null,
  },
})
export class UserState {
  constructor(private userService: UserService) {}

  @Selector()
  static getUser(state: UserStateModel): User | null {
    return state.user;
  }

  @Action(LoadUser)
  loadUser({ patchState }: StateContext<UserStateModel>) {
    return this.userService.getUser().pipe(
      tap((result: User) => {
        patchState({
          user: result,
        });
      }),
    );
  }
}
