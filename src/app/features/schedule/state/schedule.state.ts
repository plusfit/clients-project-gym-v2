// schedule.state.ts
import { Action, Selector, State, StateContext } from "@ngxs/store";

export interface Schedule {
	_id: string;
	startTime: string;
	endTime: string;
	maxCount: number;
	clients: string[];
	day: string;
	disabled?: boolean; // Campo para controlar si el horario está habilitado
}

export interface ScheduleStateModel {
	schedules: Schedule[];
}

export class SetSchedules {
	static readonly type = "[Schedule] Set Schedules";
	constructor(public payload: Schedule[]) {}
}

export class EnrollInSchedule {
	static readonly type = "[Schedule] Enroll In Schedule";
	constructor(
		public scheduleId: string,
		public userId: string,
	) {}
}

export class UnenrollFromSchedule {
	static readonly type = "[Schedule] Unenroll From Schedule";
	constructor(
		public scheduleId: string,
		public userId: string,
	) {}
}

@State<ScheduleStateModel>({
	name: "schedule",
	defaults: {
		schedules: [],
	},
})
export class ScheduleState {
	@Selector()
	static getSchedules(state: ScheduleStateModel) {
		return state.schedules;
	}

	@Selector()
	static getUserTotalEnrollments(state: ScheduleStateModel) {
		return (userId: string) => {
			// Contar en cuántos horarios en total está inscripto el usuario
			return state.schedules.filter((schedule) => schedule.clients?.includes(userId)).length;
		};
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
	unenroll(ctx: StateContext<ScheduleStateModel>, action: UnenrollFromSchedule) {
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
