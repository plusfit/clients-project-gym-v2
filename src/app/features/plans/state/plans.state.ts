// plans.state.ts
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Plan } from '../interfaces/plan.interface';

export interface PlansStateModel {
  userPlan: Plan | null;
  loading: boolean;
  error: string | null;
}

export class FetchUserPlan {
  static readonly type = '[Plans] Fetch User Plan';
  constructor(public userId: string) {}
}

export class SetUserPlan {
  static readonly type = '[Plans] Set User Plan';
  constructor(public plan: Plan | null) {}
}

export class SetLoading {
  static readonly type = '[Plans] Set Loading';
  constructor(public loading: boolean) {}
}

export class SetError {
  static readonly type = '[Plans] Set Error';
  constructor(public error: string | null) {}
}

@State<PlansStateModel>({
  name: 'plans',
  defaults: {
    userPlan: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class PlansState {
  constructor(private http: HttpClient) {}

  @Selector()
  static getUserPlan(state: PlansStateModel): Plan | null {
    return state.userPlan;
  }

  @Selector()
  static isLoading(state: PlansStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: PlansStateModel): string | null {
    return state.error;
  }

  @Action(FetchUserPlan)
  fetchUserPlan(ctx: StateContext<PlansStateModel>, action: FetchUserPlan) {
    ctx.dispatch(new SetLoading(true));
    ctx.dispatch(new SetError(null));

    // Primero obtener el cliente con su planId
    return this.http.get<any>(`${environment.apiUrl}/clients/${action.userId}`).pipe(
      tap(
        (response) => {
          let planId = null;

          if (response?.data?.planId) {
            // Si la respuesta tiene una estructura {success: true, data: {planId: '...'}}
            planId = response.data.planId;
          } else if (response?.planId) {
            // Si la respuesta es directamente el objeto usuario
            planId = response.planId;
          }

          if (!planId) {
            ctx.dispatch(new SetUserPlan(null));
            ctx.dispatch(new SetLoading(false));
            return;
          }

          // Si tiene un plan asignado, obtener los detalles del plan
          this.http.get<any>(`${environment.apiUrl}/plans/${planId}`).subscribe(
            (planResponse) => {
              let planData = null;
              
              if (planResponse?.data) {
                planData = this.normalizePlanData(planResponse.data);
              } else if (planResponse) {
                // Si no hay estructura anidada, usar directamente la respuesta
                planData = this.normalizePlanData(planResponse);
              } else {
              }

              ctx.dispatch(new SetUserPlan(planData));
              ctx.dispatch(new SetLoading(false));
            },
            (error) => {
              ctx.dispatch(new SetError('Error al cargar el plan. Por favor, intenta nuevamente.'));
              ctx.dispatch(new SetLoading(false));
            }
          );
        },
        (error) => {
          ctx.dispatch(new SetError('Error al cargar información del cliente. Por favor, intenta nuevamente.'));
          ctx.dispatch(new SetLoading(false));
        }
      )
    );
  }

  @Action(SetUserPlan)
  setUserPlan(ctx: StateContext<PlansStateModel>, action: SetUserPlan) {
    ctx.patchState({
      userPlan: action.plan
    });
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<PlansStateModel>, action: SetLoading) {
    ctx.patchState({
      loading: action.loading
    });
  }

  @Action(SetError)
  setError(ctx: StateContext<PlansStateModel>, action: SetError) {
    ctx.patchState({
      error: action.error
    });
  }

  /**
   * Normaliza los datos del plan para manejar diferentes estructuras
   */
  private normalizePlanData(planData: any): Plan {
    // Asegurar que todos los campos requeridos existan
    return {
      _id: planData._id || planData.id,
      name: planData.name || "Plan Personalizado",
      description: planData.description || "Plan de entrenamiento adaptado a tus necesidades.",
      level: planData.level || "beginner",
      daysPerWeek: planData.daysPerWeek || 3,
      goal: planData.goal || "Mejorar condición física",
      duration: planData.duration || 4,
      exercises: Array.isArray(planData.exercises) ? planData.exercises : [],
      createdAt: planData.createdAt,
      updatedAt: planData.updatedAt,
    };
  }
}
