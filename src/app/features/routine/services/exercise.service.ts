// routine.service.ts o exercise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Exercise } from '../interfaces/routine.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getExerciseById(exerciseId: string): Observable<Exercise | null> {
    return this.http
      .get<{
        success: boolean;
        data: Exercise;
      }>(`${this.apiUrl}/exercises/${exerciseId}`)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          return null;
        }),
        catchError((error) => {
          console.error('Error fetching user:', error);
          return of(null);
        }),
      );
  }
}
