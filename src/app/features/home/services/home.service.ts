import { Injectable } from "@angular/core";
import { AuthService } from "@feature/auth/services/auth.service";
import { Routine, SubRoutine } from "@feature/routine/interfaces/routine.interface";
import { RoutineService } from "@feature/routine/services/routine.service";
import { ScheduleService } from "@feature/schedule/services/schedule.service";
import { Schedule } from "@feature/schedule/state/schedule.state";
import { Observable, forkJoin, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

@Injectable({
	providedIn: "root",
})
export class HomeService {
	private dayMapping: { [key: string]: number } = {
		Domingo: 0,
		Lunes: 1,
		Martes: 2,
		Miércoles: 3,
		Jueves: 4,
		Viernes: 5,
		Sábado: 6,
	};

	constructor(
		private routineService: RoutineService,
		private authService: AuthService,
		private scheduleService: ScheduleService,
	) {}

	getUserRoutine(): Observable<Routine | null> {
		const currentUser = this.authService.getCurrentUserSync();
		if (currentUser?.routineId) {
			return this.routineService.getRoutineById(currentUser.routineId);
		}
		return of(null);
	}

	getUserSchedules(): Observable<Schedule[]> {
		return this.scheduleService.getSchedules().pipe(
			map((schedules) => {
				const currentUser = this.authService.getCurrentUserSync();
				return schedules.filter((schedule) => schedule.clients?.includes(currentUser._id));
			}),
			catchError((error) => {
				return of([]);
			}),
		);
	}

	getRoutineForSpecificDay(routine: Routine, dayNumber: number): SubRoutine | null {
		if (!routine || !routine.subRoutines || routine.subRoutines.length === 0) {
			return null;
		}

		const subRoutineIndex = (dayNumber - 1) % routine.subRoutines.length;
		return routine.subRoutines[subRoutineIndex];
	}

	getRoutineForToday(): Observable<SubRoutine | null> {
		const today = new Date();
		const currentDayOfWeek = today.getDay();

		const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
		const todayName = dayNames[currentDayOfWeek];

		return forkJoin({
			routine: this.getUserRoutine(),
			schedules: this.getUserSchedules(),
		}).pipe(
			map(({ routine, schedules }) => {
				if (!routine || !schedules.length) {
					return null;
				}

				const sortedSchedules = [...schedules].sort((a, b) => {
					const dayA = this.dayMapping[a.day];
					const dayB = this.dayMapping[b.day];
					return dayA - dayB;
				});

				const todaySchedule = schedules.find((s) => s.day === todayName);

				if (todaySchedule) {
					const userDayIndex = sortedSchedules.findIndex((s) => s.day === todayName);

					const subRoutineIndex = userDayIndex % routine.subRoutines.length;
					return routine.subRoutines[subRoutineIndex];
				}
				return null;
			}),
			catchError((error) => {
				return of(null);
			}),
		);
	}
}
