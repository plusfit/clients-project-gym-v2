import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Routine } from '@shared/interfaces/routines.interface';

@Injectable({ providedIn: 'root' })
export class RoutineService {
  getRoutines(): Observable<Routine[]> {
    const mockRoutines: Routine[] = [
      {
        _id: '678334f13d719fbeb4ef232a',
        name: 'Acondicionamiento cardio leve 2 dias',
        description:
          'Rutina de acondicionamiento para cardio de intensidad leve, 2 días a la semana.',
        category: 'cardio',
        isCustom: false,
        subRoutines: [
          {
            _id: '678d39bc4d6dc701e49cefcc',
            name: 'CARDIO',
            description: 'Sesión de cardio de intensidad moderada',
            category: 'cardio',
            createdAt: '2025-01-19T17:22:34.993Z',
            updatedAt: '2025-01-19T17:22:34.993Z',
            exercises: [
              {
                _id: '673250dca4c27421d11ca406',
                name: 'TEST 21',
                description: 'Ejercicio de prueba para cardio',
                type: 'cardio',
                mode: 'Intensidad moderada',
                minutes: 2,
                rest: 30,
                reps: 13,
                series: 22,
                createdAt: '2024-11-11T18:45:48.224Z',
                updatedAt: '2025-01-17T22:03:32.099Z',
              },
            ],
          },
          {
            _id: '678d39bc4d6dc701e49cefcc',
            name: 'FUNCIONAL',
            description: 'Sesión de cardio de intensidad moderada',
            category: 'cardio',
            createdAt: '2025-01-19T17:22:34.993Z',
            updatedAt: '2025-01-19T17:22:34.993Z',
            exercises: [
              {
                _id: '673250dca4c27421d11ca406',
                name: 'TEST 21',
                description: 'Ejercicio de prueba para cardio',
                type: 'cardio',
                mode: 'Intensidad moderada',
                minutes: 2,
                rest: 30,
                reps: 13,
                series: 22,
                createdAt: '2024-11-11T18:45:48.224Z',
                updatedAt: '2025-01-17T22:03:32.099Z',
              },
              {
                _id: '673250dca4c27421d11ca406',
                name: 'TEST 2',
                description: 'Ejercicio de prueba para cardio',
                type: 'cardio',
                mode: 'Intensidad moderada',
                minutes: 2,
                rest: 30,
                reps: 13,
                series: 22,
                createdAt: '2024-11-11T18:45:48.224Z',
                updatedAt: '2025-01-17T22:03:32.099Z',
              },
              {
                _id: '673250dca4c27421d11ca406',
                name: 'TEST 1',
                description: 'Ejercicio de prueba para cardio',
                type: 'cardio',
                mode: 'Intensidad moderada',
                minutes: 2,
                rest: 30,
                reps: 13,
                series: 22,
                createdAt: '2024-11-11T18:45:48.224Z',
                updatedAt: '2025-01-17T22:03:32.099Z',
              },
            ],
          },
          // Puedes agregar más subrutinas si lo deseas
        ],
      },
      // Puedes agregar más rutinas de ejemplo
    ];
    return of(mockRoutines);
  }
}
