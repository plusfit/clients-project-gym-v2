import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { User } from '@feature/profile/interfaces/user.interface';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { Plan } from '../interfaces/plan.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<User | null> {
    return this.http.get<any>(`${environment.apiUrl}/clients/${id}`).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching exercise:', error);
        return of(null);
      }),
    );
  }

  getPlanById(planId: string): Observable<Plan | null> {
    return this.http.get<any>(`${environment.apiUrl}/plans/${planId}`).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching plan:', error);
        return of(null);
      }),
    );
  }
}
