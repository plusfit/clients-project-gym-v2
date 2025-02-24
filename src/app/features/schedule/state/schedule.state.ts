// schedule.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';

export interface Schedule {
  _id: string;
  startTime: string;
  endTime: string;
  maxCount: number;
  clients: string[];
  day: string;
}

export interface ScheduleStateModel {
  schedules: Schedule[];
}

export class SetSchedules {
  static readonly type = '[Schedule] Set Schedules';
  constructor(public payload: Schedule[]) {}
}

export class EnrollInSchedule {
  static readonly type = '[Schedule] Enroll In Schedule';
  constructor(
    public scheduleId: string,
    public userId: string,
  ) {}
}

export class UnenrollFromSchedule {
  static readonly type = '[Schedule] Unenroll From Schedule';
  constructor(
    public scheduleId: string,
    public userId: string,
  ) {}
}

@State<ScheduleStateModel>({
  name: 'schedule',
  defaults: {
    schedules: [
      {
        _id: '678bfbee653d4a1602d7adfe',
        startTime: '7',
        endTime: '8',
        maxCount: 7,
        clients: [
          '6716d37ef04b1f954f0bbbfe',
          '679a686ea392598c8f90ad24',
          '679a6d63a3a8c508e7fa132f',
        ],
        day: 'Lunes',
      },
      {
        _id: '678d3b3f4d6dc701e49cf035',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Lunes',
      },
      {
        _id: '6793c8c86b0c3d40ba56f8d6',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Martes',
      },
      {
        _id: '6793c8c86b0c3d40ba56f8d8',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Miércoles',
      },
      {
        _id: '6793c8c86b0c3d40ba56f8da',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Jueves',
      },
      {
        _id: '6793c8c86b0c3d40ba56f8dc',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Viernes',
      },
    ],
  },
})
export class ScheduleState {
  @Selector()
  static getSchedules(state: ScheduleStateModel) {
    return state.schedules;
  }

  @Action(SetSchedules)
  setSchedules(ctx: StateContext<ScheduleStateModel>, action: SetSchedules) {
    ctx.setState({ schedules: action.payload });
  }

  @Action(EnrollInSchedule)
  enroll(ctx: StateContext<ScheduleStateModel>, action: EnrollInSchedule) {
    const state = ctx.getState();
    const schedules = state.schedules.map((schedule) => {
      if (schedule._id === action.scheduleId) {
        if (!schedule.clients.includes(action.userId)) {
          return { ...schedule, clients: [...schedule.clients, action.userId] };
        }
      }
      return schedule;
    });
    ctx.setState({ schedules });
  }

  @Action(UnenrollFromSchedule)
  unenroll(
    ctx: StateContext<ScheduleStateModel>,
    action: UnenrollFromSchedule,
  ) {
    const state = ctx.getState();
    const schedules = state.schedules.map((schedule) => {
      if (schedule._id === action.scheduleId) {
        return {
          ...schedule,
          clients: schedule.clients.filter((id) => id !== action.userId),
        };
      }
      return schedule;
    });
    ctx.setState({ schedules });
  }
}
