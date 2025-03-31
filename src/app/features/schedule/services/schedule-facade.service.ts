import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, map, catchError } from 'rxjs';
import {
  Schedule,
  ScheduleState,
  SetSchedules,
  EnrollInSchedule,
  UnenrollFromSchedule,
} from '../state/schedule.state';
import { ScheduleService } from './schedule.service';
import { tap } from 'rxjs/operators';
import { AuthState } from '@feature/auth/state/auth.state';

@Injectable({
  providedIn: 'root',
})
export class ScheduleFacadeService {
  constructor(
    private store: Store,
    private scheduleService: ScheduleService,
  ) {}

  get schedules$(): Observable<Schedule[]> {
    return this.store.select(ScheduleState.getSchedules);
  }

  get currentUserId$(): Observable<string | undefined> {
    return this.store.select(AuthState.getUser).pipe(map((user) => user?._id));
  }

  loadSchedules(): void {
    this.scheduleService
      .getSchedules()
      .pipe(
        tap((schedules) => {
          this.store.dispatch(new SetSchedules(schedules));
        }),
        catchError((error) => {
          console.error('Error loading schedules:', error);
          return [];
        }),
      )
      .subscribe();
  }

  loadUserSchedules(userId: string): Observable<any> {
    return this.scheduleService.getUserSchedules(userId);
  }

  enrollUserInSchedule(scheduleId: string, userId: string): Observable<any> {
    return this.scheduleService.enrollInSchedule(scheduleId, userId).pipe(
      tap(() => {
        this.store.dispatch(new EnrollInSchedule(scheduleId, userId));
      }),
    );
  }

  unenrollUserFromSchedule(
    scheduleId: string,
    userId: string,
  ): Observable<any> {
    return this.scheduleService.unenrollFromSchedule(scheduleId, userId).pipe(
      tap(() => {
        this.store.dispatch(new UnenrollFromSchedule(scheduleId, userId));
      }),
    );
  }
}
