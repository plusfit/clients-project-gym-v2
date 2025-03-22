import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Routine, RoutineResponse } from '../interfaces/routine.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
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
      catchError((error) => {
        console.error('Error fetching routine:', error);
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
        catchError((error) => {
          console.error('Error fetching routines:', error);
          return of([]);
        }),
      );
  }

  /**
   * Obtiene las rutinas de un usuario específico por su ID
   */
  getUserRoutines(userId: string): Observable<Routine[]> {
    console.log(`Fetching routines for user with ID: ${userId}`);
    return this.http
      .get<{
        success: boolean;
        data: Routine[];
      }>(`${this.apiUrl}/users/${userId}/routines`)
      .pipe(
        map((response) => {
          if (response.success) {
            console.log(
              `Retrieved ${response.data.length} routines for user ${userId}`,
            );
            return response.data;
          }
          console.log(
            `No routines found for user ${userId} or API returned error`,
          );
          return [];
        }),
        catchError((error) => {
          console.error(`Error fetching routines for user ${userId}:`, error);
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
