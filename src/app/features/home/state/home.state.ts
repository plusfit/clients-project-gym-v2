import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Routine, SubRoutine } from '@shared/interfaces/routines.interface';

export interface HomeStateModel {
  routine: SubRoutine;
  motivationalMessage: string;
}

export class SetHomeData {
  static readonly type = '[Home] Set Home Data';
  constructor(public payload: Partial<HomeStateModel>) {}
}

@State<HomeStateModel>({
  name: 'home',
  defaults: {
    routine: {
      _id: '678d38244d6dc701e49cef9d',
      name: 'MIXTO',
      description:
        'Rutina de entrenamiento mixto para hoy. ¡Prepárate para sudar!',
      exercises: [
        {
          _id: '673b55140c0e5a4e3cd664b1',
          name: 'Flexiones',
          type: 'sala',
          series: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
          mode: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b2',
          name: 'Cinta de correr',
          type: 'cardio',
          minutes: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
          mode: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b3',
          name: 'Sentadillas',
          type: 'sala',
          series: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
          mode: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b4',
          name: 'Abdominales',
          type: 'sala',
          series: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
          mode: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b5',
          name: 'Burpees',
          type: 'sala',
          series: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
          mode: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b6',
          name: 'Plancha',
          type: 'sala',
          series: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
          mode: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b7',
          name: 'Bicicleta',
          type: 'cardio',
          minutes: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
          mode: '',
        },
      ],
      createdAt: new Date('2025-01-19T17:22:34.993Z').toISOString(),
      updatedAt: new Date('2025-01-19T17:22:34.993Z').toISOString(),
      category: 'mix',
    },
    motivationalMessage: '¡Vamos a darle con todo hoy! 💪',
  },
})
export class HomeState {
  @Selector()
  static getRoutine(state: HomeStateModel): SubRoutine {
    return state.routine;
  }

  @Selector()
  static getMotivationalMessage(state: HomeStateModel): string {
    return state.motivationalMessage;
  }

  @Action(SetHomeData)
  setHomeData(ctx: StateContext<HomeStateModel>, action: SetHomeData): void {
    ctx.patchState({
      ...action.payload,
    });
  }
}
