import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { Routine, RoutineResponse } from "../interfaces/routine.interface";

@Injectable({
	providedIn: "root",
})
export class RoutineService {
	private apiUrl = environment.apiUrl;

	constructor(private http: HttpClient) {}

	/**
	 * Obtiene una rutina específica por su ID desde el backend
	 */
	getRoutineById(id: string): Observable<Routine | null> {
		return this.http.get<RoutineResponse>(`${this.apiUrl}/routines/${id}`).pipe(
			map((response) => {
				if (response.success) {
					return response.data;
				}
				return null;
			}),
			catchError(() => {
				return of(null);
			}),
		);
	}

	/**
	 * Obtiene todas las rutinas disponibles
	 *
	 */
	getAllRoutines(): Observable<Routine[]> {
		return this.http
			.get<{ success: boolean; data: Routine[] }>(`${this.apiUrl}/routines`)
			.pipe(
				map((response) => {
					if (response.success) {
						return response.data;
					}
					return [];
				}),
				catchError(() => {
					return of([]);
				}),
			);
	}

	/**
	 * Obtiene las rutinas de un usuario específico por su ID
	 */
	getUserRoutines(userId: string): Observable<Routine[]> {
		return this.http
			.get<{
				success: boolean;
				data: Routine[];
			}>(`${this.apiUrl}/users/${userId}/routines`)
			.pipe(
				map((response) => {
					if (response.success) {
						return response.data;
					}
					return [];
				}),
				catchError(() => {
					return of([]);
				}),
			);
	}

	/**
	 * Obtiene los detalles completos de los ejercicios en una rutina
	 * (Este método debería implementarse cuando sea necesario obtener los detalles de los ejercicios)
	 */
	getExerciseDetails(exerciseIds: string[]): Observable<any[]> {
		// Implementación para obtener detalles de ejercicios
		// Por ahora retornamos un observable vacío
		return of([]);
	}
}
