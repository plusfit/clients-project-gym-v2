import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { RoutineService } from '../services/routine.service';
import { tap } from 'rxjs/operators';
import { Exercise, Routine } from '@shared/interfaces/routines.interface';
import { ExerciseService } from '@feature/routine/services/exercise.service';

// Actions
export class LoadRoutines {
  static readonly type = '[Routine] Load';
}

export class LoadSelectedExercise {
  static readonly type = '[Exercise] Load Selected';
  constructor(public exerciseId: string) {}
}

// State Model
export interface RoutineStateModel {
  routines: Routine[];
  selectedExercise: Exercise | null;
}

@Injectable()
@State<RoutineStateModel>({
  name: 'routine',
  defaults: {
    routines: [],
    selectedExercise: null,
  },
})
export class RoutineState {
  constructor(
    private routineService: RoutineService,
    private exerciseService: ExerciseService,
  ) {}

  @Selector()
  static getRoutines(state: RoutineStateModel) {
    return state.routines;
  }

  @Selector()
  static getSelectedExercise(state: RoutineStateModel) {
    return state.selectedExercise;
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

  @Action(LoadSelectedExercise)
  loadSelectedExercise(
    { patchState }: StateContext<RoutineStateModel>,
    { exerciseId }: LoadSelectedExercise,
  ) {
    return this.exerciseService.getExerciseById(exerciseId).pipe(
      tap((exercise) => {
        patchState({ selectedExercise: exercise });
      }),
    );
  }
}
