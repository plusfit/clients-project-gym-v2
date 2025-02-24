import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { RoutineService } from '../services/routine.service';
import { tap } from 'rxjs/operators';
import { Routine } from '@shared/interfaces/routines.interface';

export class LoadRoutines {
  static readonly type = '[Routine] Load';
}

export interface RoutineStateModel {
  routines: Routine[];
}

@Injectable()
@State<RoutineStateModel>({
  name: 'routine',
  defaults: {
    routines: [],
  },
})
export class RoutineState {
  constructor(private routineService: RoutineService) {}

  @Selector()
  static getRoutines(state: RoutineStateModel) {
    return state.routines;
  }

  @Action(LoadRoutines)
  loadRoutines({ patchState }: StateContext<RoutineStateModel>) {
    return this.routineService.getRoutines().pipe(
      tap((routines) => {
        console.log('routines', routines);
        patchState({ routines });
      }),
    );
  }
}
