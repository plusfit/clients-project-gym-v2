import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Schedule } from '@feature/schedule/state/schedule.state';

interface ScheduleResponse {
  success: boolean;
  data: Schedule[];
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient) {}

  getSchedules(): Observable<Schedule[]> {
    return this.http.get<ScheduleResponse>(this.apiUrl).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        } else {
          return [];
        }
      }),
    );
  }

  getUserSchedules(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }

  enrollInSchedule(scheduleId: string, userId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/assignClient/${scheduleId}`, {
      clients: [userId],
    });
  }

  unenrollFromSchedule(scheduleId: string, userId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/deleteClient/${scheduleId}/${userId}`,
    );
  }
}
