// routine.service.ts o exercise.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Exercise } from '@shared/interfaces/routines.interface';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  // Datos de prueba
  private mockExercises: Exercise[] = [
    {
      _id: '1',
      name: 'Pecho Plano Basico',
      description: 'Ejercicio de Pecho',
      type: 'sala',
      mode: 'basico',
      rest: 2,
      reps: 8,
      series: 3,
      createdAt: '',
      updatedAt: '',
    },
    {
      _id: '2',
      name: 'Sentadillas',
      description: 'Ejercicio de Piernas',
      type: 'cardio',
      mode: 'avanzado',
      rest: 3,
      reps: 10,
      series: 4,
      createdAt: '',
      updatedAt: '',
    },
    // Agrega más si lo necesitas
  ];

  constructor() {}

  getExerciseById(exerciseId: string): Observable<Exercise | null> {
    const found = this.mockExercises.find((ex) => ex._id === exerciseId);
    // Retornamos null si no se encontró
    return of(found || null);
  }
}
