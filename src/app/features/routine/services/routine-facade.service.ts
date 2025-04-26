import { Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Routine, SubRoutine } from "../interfaces/routine.interface";
import {
	LoadRoutineById,
	LoadRoutines,
	LoadUserRoutines,
	RoutineState,
	SetSelectedRoutine,
	SetSelectedSubRoutine,
} from "../state/routine.state";

@Injectable({
	providedIn: "root",
})
export class RoutineFacadeService {
	constructor(private store: Store) {}

	// Selectores
	get routines$(): Observable<Routine[]> {
		return this.store.select(RoutineState.getRoutines);
	}

	get selectedRoutine$(): Observable<Routine | null> {
		return this.store.select(RoutineState.getSelectedRoutine);
	}

	get selectedSubRoutine$(): Observable<SubRoutine | null> {
		return this.store.select(RoutineState.getSelectedSubRoutine);
	}

	get subRoutines$(): Observable<SubRoutine[]> {
		return this.store.select(RoutineState.getSubRoutines);
	}

	get loading$(): Observable<boolean> {
		return this.store.select(RoutineState.isLoading);
	}

	get error$(): Observable<string | null> {
		return this.store.select(RoutineState.getError);
	}

	// Acciones
	loadRoutines(): void {
		this.store.dispatch(new LoadRoutines());
	}

	loadUserRoutines(userId: string): void {
		this.store.dispatch(new LoadUserRoutines(userId));
	}

	loadRoutineById(id: string): void {
		this.store.dispatch(new LoadRoutineById(id));
	}

	setSelectedRoutine(routine: Routine | null): void {
		this.store.dispatch(new SetSelectedRoutine(routine));
	}

	setSelectedSubRoutine(subRoutine: SubRoutine | null): void {
		this.store.dispatch(new SetSelectedSubRoutine(subRoutine));
	}
}
