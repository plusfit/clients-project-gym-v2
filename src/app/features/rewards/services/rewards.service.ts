import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reward, RewardResponse } from '../interfaces/reward.interface';

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los rewards disponibles
   */
  getAllRewards(): Observable<Reward[]> {
    return this.http.get<RewardResponse>(`${this.apiUrl}/rewards`).pipe(
      map((response) => {
        if (response.success && response.data.success) {
          return response.data.data;
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error al obtener rewards:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un reward específico por su ID
   */
  getRewardById(id: string): Observable<Reward | null> {
    return this.http.get<{ success: boolean; data: Reward }>(`${this.apiUrl}/rewards/${id}`).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error al obtener reward:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene rewards con filtros y paginación
   */
  getRewards(params: {
    search?: string;
    enabled?: boolean;
    page?: number;
    limit?: number;
  } = {}): Observable<RewardResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.set('search', params.search);
    if (params.enabled !== undefined) queryParams.set('enabled', params.enabled.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());

    const url = `${this.apiUrl}/rewards${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.http.get<RewardResponse>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener rewards con filtros:', error);
        return of({
          success: false,
          data: {
            success: false,
            data: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalCount: 0,
              limit: 10
            }
          }
        });
      })
    );
  }

  /**
   * Intercambia puntos por un reward
   */
  exchangeReward(rewardId: string, clientId: string): Observable<{ success: boolean; message: string; data?: any }> {
    return this.http.post<{ success: boolean; message: string; data?: any }>(`${this.apiUrl}/rewards/exchange`, {
      rewardId,
      clientId
    }).pipe(
      catchError((error) => {
        console.error('Error al intercambiar reward:', error);
        throw error;
      })
    );
  }
}
