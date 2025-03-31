import { SubRoutine } from '@feature/routine/interfaces/routine.interface';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { HomeService } from '../services/home.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface HomeStateModel {
  routine: SubRoutine | null;
  routines: SubRoutine[];
  loading: boolean;
  error: string | null;
  motivationalMessage: string;
  motivationalMessages: string[];
}

// Acciones
export class LoadRoutineForToday {
  static readonly type = '[Home] Load Routine For Today';
}

export class SetHomeData {
  static readonly type = '[Home] Set Home Data';
  constructor(public payload: Partial<HomeStateModel>) {}
}

@State<HomeStateModel>({
  name: 'home',
  defaults: {
    routine: null,
    routines: [],
    loading: false,
    error: null,
    motivationalMessage: '¡Vamos a darle con todo hoy! 💪',
    motivationalMessages: [
      'Comienza la semana con fuerza y determinación. ¡Hoy es tu día! 💪', // Lunes
      'El dolor que sientes hoy, es la fuerza que sentirás mañana. ¡Sigue adelante! 💥', // Martes
      'Mitad de semana, ¡no pierdas el ritmo! Tu cuerpo te lo agradecerá. 🔥', // Miércoles
      'La disciplina es el puente entre tus metas y tus logros. ¡Ya casi es viernes! 🏋️', // Jueves
      'Último empujón de la semana! Termina fuerte lo que empezaste. ⚡', // Viernes
      'El fin de semana es para seguir creciendo. ¡No hay descanso para los campeones! 🏆', // Sábado
      'Recarga energías y prepárate para la próxima semana. ¡El descanso también es parte del éxito! 🧘', // Domingo
    ],
  },
})
@Injectable()
export class HomeState {
  constructor(private homeService: HomeService) {}

  @Selector()
  static getRoutine(state: HomeStateModel): SubRoutine | null {
    return state.routine;
  }

  @Selector()
  static isLoading(state: HomeStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: HomeStateModel): string | null {
    return state.error;
  }

  @Selector()
  static getMotivationalMessage(state: HomeStateModel): string {
    const dayOfWeek = new Date().getDay();
    const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return state.motivationalMessages[adjustedDayIndex];
  }

  @Action(LoadRoutineForToday)
  loadRoutineForToday(ctx: StateContext<HomeStateModel>): any {
    ctx.patchState({ loading: true, error: null });

    return this.homeService.getRoutineForToday().pipe(
      tap((routine) => {
        ctx.patchState({
          routine,
          loading: false,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error al cargar la rutina',
        });
        return of(error);
      }),
    );
  }

  @Action(SetHomeData)
  setHomeData(ctx: StateContext<HomeStateModel>, action: SetHomeData): void {
    ctx.patchState({
      ...action.payload,
    });
  }
}
