import { Injectable } from "@angular/core";
import { SubRoutine } from "@feature/routine/interfaces/routine.interface";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { HomeService } from "../services/home.service";

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
	static readonly type = "[Home] Load Routine For Today";
}

export class SetHomeData {
	static readonly type = "[Home] Set Home Data";
	constructor(public payload: Partial<HomeStateModel>) { }
}

@State<HomeStateModel>({
	name: "home",
	defaults: {
		routine: null,
		routines: [],
		loading: false,
		error: null,
		motivationalMessage: "¡Vamos a darle con todo hoy! 💪",
		motivationalMessages: [
			"A ponerle el plus que le falta a tu día! 💪", // Lunes
			"Un entrenamiento en Plus Mejora tu día... Pero Varios entrenamientos cambian tu vida! 💥", // Martes
			"Un día más para superarte! 🔥", // Miércoles
			"Te espera tu familia Plus! 🏋️", // Jueves
			"Un día más en plusfit es un día más saludable! ⚡", // Viernes
			"¡Con todo esta mañana! ☀️ Entrena, ríe y disfruta tu finde. ¡Te esperamos! 😁💪", // Sábado
			"¡Pausa necesaria!, disfruta de tu domingo de relax 💆🏻. Mañana volvemos a las risas y al entrenamiento 😁 ¡te extrañamos! ❤️ ", // Domingo
		],
	},
})
@Injectable()
export class HomeState {
	constructor(private homeService: HomeService) { }

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
					error: error.message || "Error al cargar la rutina",
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
