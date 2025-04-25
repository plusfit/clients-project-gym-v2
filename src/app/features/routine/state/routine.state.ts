import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Routine, SubRoutine } from "../interfaces/routine.interface";
import { ExerciseService } from "../services/exercise.service";
import { RoutineService } from "../services/routine.service";

// Acciones
export class LoadRoutines {
	static readonly type = "[Routine] Load Routines";
}

export class LoadUserRoutines {
	static readonly type = "[Routine] Load User Routines";
	constructor(public userId: string) {}
}

export class LoadRoutineById {
	static readonly type = "[Routine] Load Routine By Id";
	constructor(public id: string) {}
}

export class SetSelectedRoutine {
	static readonly type = "[Routine] Set Selected Routine";
	constructor(public routine: Routine | null) {}
}

export class SetSelectedSubRoutine {
	static readonly type = "[Routine] Set Selected SubRoutine";
	constructor(public subRoutine: SubRoutine | null) {}
}

export class LoadSelectedExercise {
	static readonly type = "[Exercise] Load Selected";
	constructor(public exerciseId: string) {}
}

// Modelo del estado
export interface RoutineStateModel {
	routines: Routine[];
	selectedRoutine: Routine | null;
	selectedSubRoutine: SubRoutine | null;
	selectedExercise: any | null;
	loading: boolean;
	error: string | null;
}

// Estado
@State<RoutineStateModel>({
	name: "routine",
	defaults: {
		routines: [],
		selectedRoutine: null,
		selectedSubRoutine: null,
		selectedExercise: null,
		loading: false,
		error: null,
	},
})
@Injectable()
export class RoutineState {
	constructor(
		private routineService: RoutineService,
		private exerciseService: ExerciseService,
	) {}

	@Selector()
	static getRoutines(state: RoutineStateModel): Routine[] {
		return state.routines;
	}

	@Selector()
	static getSelectedRoutine(state: RoutineStateModel): Routine | null {
		return state.selectedRoutine;
	}

	@Selector()
	static getSelectedSubRoutine(state: RoutineStateModel): SubRoutine | null {
		return state.selectedSubRoutine;
	}

	@Selector()
	static getSubRoutines(state: RoutineStateModel): SubRoutine[] {
		return state.selectedRoutine?.subRoutines || [];
	}

	@Selector()
	static isLoading(state: RoutineStateModel): boolean {
		return state.loading;
	}

	@Selector()
	static getError(state: RoutineStateModel): string | null {
		return state.error;
	}

	@Selector()
	static getSelectedExercise(state: RoutineStateModel) {
		return state.selectedExercise;
	}

	@Action(LoadRoutines)
	loadRoutines(ctx: StateContext<RoutineStateModel>) {
		const state = ctx.getState();
		ctx.patchState({ loading: true, error: null });

		return this.routineService.getAllRoutines().pipe(
			tap((routines) => {
				ctx.patchState({
					routines,
					loading: false,
				});
			}),
			catchError((error) => {
				ctx.patchState({
					loading: false,
					error: error.message || "Error al cargar las rutinas",
				});
				return of(error);
			}),
		);
	}

	@Action(LoadUserRoutines)
	loadUserRoutines(ctx: StateContext<RoutineStateModel>, action: LoadUserRoutines) {
		ctx.patchState({ loading: true, error: null });

		return this.routineService.getUserRoutines(action.userId).pipe(
			tap((routines) => {
				ctx.patchState({
					routines,
					loading: false,
				});
			}),
			catchError((error) => {
				ctx.patchState({
					loading: false,
					error: error.message || "Error al cargar las rutinas del usuario",
				});
				return of(error);
			}),
		);
	}

	@Action(LoadRoutineById)
	loadRoutineById(ctx: StateContext<RoutineStateModel>, action: LoadRoutineById) {
		ctx.patchState({ loading: true, error: null });

		return this.routineService.getRoutineById(action.id).pipe(
			tap((routine) => {
				if (routine) {
					ctx.patchState({
						selectedRoutine: routine,
						loading: false,
					});
				} else {
					ctx.patchState({
						loading: false,
						error: "No se encontró la rutina",
					});
				}
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

	@Action(SetSelectedRoutine)
	setSelectedRoutine(ctx: StateContext<RoutineStateModel>, action: SetSelectedRoutine) {
		ctx.patchState({
			selectedRoutine: action.routine,
			selectedSubRoutine: null, // Reseteamos la subrutina seleccionada
		});
	}

	@Action(SetSelectedSubRoutine)
	setSelectedSubRoutine(ctx: StateContext<RoutineStateModel>, action: SetSelectedSubRoutine) {
		ctx.patchState({
			selectedSubRoutine: action.subRoutine,
		});
	}

	@Action(LoadSelectedExercise)
	loadSelectedExercise(ctx: StateContext<RoutineStateModel>, action: LoadSelectedExercise) {
		ctx.patchState({ loading: true, error: null });

		return this.exerciseService.getExerciseById(action.exerciseId).pipe(
			tap((exercise) => {
				ctx.patchState({
					selectedExercise: exercise,
					loading: false,
				});
			}),
			catchError((error) => {
				ctx.patchState({
					loading: false,
					error: error.message || "Error al cargar el ejercicio",
				});
				return of(error);
			}),
		);
	}
}
