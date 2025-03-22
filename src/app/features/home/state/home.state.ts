import { SubRoutine } from '@feature/routine/interfaces/routine.interface';
import { State, Action, StateContext, Selector } from '@ngxs/store';

export interface HomeStateModel {
  routine: SubRoutine;
  motivationalMessage: string;
  motivationalMessages: string[];
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
          type: 'room',
          series: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b2',
          name: 'Cinta de correr',
          type: 'cardio',
          minutes: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b3',
          name: 'Sentadillas',
          type: 'room',
          series: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b4',
          name: 'Abdominales',
          type: 'room',
          series: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b5',
          name: 'Burpees',
          type: 'room',
          series: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b6',
          name: 'Plancha',
          type: 'room',
          series: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
        },
        {
          _id: '673b55140c0e5a4e3cd664b7',
          name: 'Bicicleta',
          type: 'cardio',
          minutes: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: '',
        },
      ],
      createdAt: new Date('2025-01-19T17:22:34.993Z').toISOString(),
      updatedAt: new Date('2025-01-19T17:22:34.993Z').toISOString(),
      category: 'mix',
    },
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
export class HomeState {
  @Selector()
  static getRoutine(state: HomeStateModel): SubRoutine {
    return state.routine;
  }

  @Selector()
  static getMotivationalMessage(state: HomeStateModel): string {
    const dayOfWeek = new Date().getDay();
    const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return state.motivationalMessages[adjustedDayIndex];
  }

  @Action(SetHomeData)
  setHomeData(ctx: StateContext<HomeStateModel>, action: SetHomeData): void {
    ctx.patchState({
      ...action.payload,
    });
  }
}
