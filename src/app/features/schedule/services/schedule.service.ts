import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Schedule } from '@feature/schedule/state/schedule.state';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor() {}

  getSchedules(): Observable<Schedule[]> {
    const schedules: Schedule[] = [
      {
        _id: '678bfbee653d4a1602d7adfe',
        startTime: '7',
        endTime: '8',
        maxCount: 7,
        clients: [
          '6716d37ef04b1f954f0bbbfe',
          '679a686ea392598c8f90ad24',
          '679a6d63a3a8c508e7fa132f',
        ],
        day: 'Lunes',
      },
      {
        _id: '678d3b3f4d6dc701e49cf035',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Lunes',
      },
      {
        _id: '6793c8c86b0c3d40ba56f8d6',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Martes',
      },
      {
        _id: '6793c8c86b0c3d40ba56f8d8',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Miércoles',
      },
      {
        _id: '6793c8c86b0c3d40ba56f8da',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Jueves',
      },
      {
        _id: '6793c8c86b0c3d40ba56f8dc',
        startTime: '6',
        endTime: '7',
        maxCount: 7,
        clients: [],
        day: 'Viernes',
      },
    ];
    return of(schedules);
  }
}
