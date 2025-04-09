import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule, LoadingController } from "@ionic/angular";
import { Select, Store } from "@ngxs/store";
import { HighContrastDirective } from "@shared/directives/high-contrast.directive";
import { environment } from "environments/environment";
import { Observable, take } from "rxjs";
import { User } from "../../../auth/interfaces/user.interface";
import { AuthState } from "../../../auth/state/auth.state";
import { Schedule, ScheduleState } from "../../../schedule/state/schedule.state";
import { Plan } from "../../interfaces/plan.interface";

@Component({
	selector: "app-assigned-plan",
	standalone: true,
	imports: [CommonModule, IonicModule, HighContrastDirective, RouterModule],
	template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mi Plan de Entrenamiento</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="plan; else noPlan">
        <ion-card class="plan-card">
          <div class="plan-header">
            <ion-card-header>
              <ion-card-title>{{ plan.name || 'Plan Personalizado' }}</ion-card-title>
              <ion-card-subtitle>
                <span class="level-badge">{{ getLevelText(plan.level) }}</span>
                <span class="days-badge">{{ plan.daysPerWeek || 3 }} días/semana</span>
              </ion-card-subtitle>
            </ion-card-header>
          </div>

          <ion-card-content>
            <div class="plan-description">
              <p>{{ plan.description || 'Plan de entrenamiento personalizado según tus preferencias.' }}</p>
            </div>

            <div class="plan-details">
              <div class="detail-item">
                <ion-icon name="trophy-outline"></ion-icon>
                <div class="detail-content">
                  <h4>Objetivo</h4>
                  <p>{{ plan.goal || 'Mejora general de la condición física' }}</p>
                </div>
              </div>

              <div class="detail-item">
                <ion-icon name="calendar-outline"></ion-icon>
                <div class="detail-content">
                  <h4>Duración</h4>
                  <p>{{ plan.duration || 4 }} semanas</p>
                </div>
              </div>

              <div class="detail-item">
                <ion-icon name="barbell-outline"></ion-icon>
                <div class="detail-content">
                  <h4>Frecuencia</h4>
                  <p>{{ plan.daysPerWeek || 3 }} días por semana</p>
                </div>
              </div>
            </div>

            <div class="plan-message">
              <p>Para ver los ejercicios específicos de cada día, visita la sección de calendario.
              Allí podrás ver tu programa completo organizado por día.</p>
            </div>

            <ion-button *ngIf="!userHasEnrollments" expand="block" class="start-button" routerLink="/tabs/calendar">
              <ion-icon slot="start" name="play-outline"></ion-icon>
              Comenzar entrenamiento
            </ion-button>

            <div *ngIf="userHasEnrollments" class="enrolled-message">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <p>Ya estás inscrito en horarios de entrenamiento.
              Visita la sección de calendario para ver tus próximas clases.</p>
              <ion-button expand="block" color="tertiary" class="calendar-button" routerLink="/tabs/calendar">
                <ion-icon slot="start" name="calendar-outline"></ion-icon>
                Ver mi calendario
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <ng-template #noPlan>
        <div class="no-plan-container">
          <ion-card>
            <ion-card-header>
              <ion-icon name="fitness-outline" class="no-plan-icon"></ion-icon>
              <ion-card-title>No hay plan asignado</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>Aún no se te ha asignado un plan de entrenamiento.</p>
              <p>Completa el proceso de onboarding para recibir tu plan personalizado.</p>

              <ion-button expand="block" [routerLink]="['/onboarding']" class="onboarding-button">
                <ion-icon slot="start" name="create-outline"></ion-icon>
                Completar onboarding
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>
      </ng-template>
    </ion-content>
  `,
	styles: [
		`
    :host {
      --color-primary-dark: #004494;
      --color-secondary-dark: #1a3a6e;
      --color-background-light: #f4f5f8;
      --color-text-dark: #0a0a0a;
      --color-text-medium: #222222;
      --color-text-light: #ffffff;
      --color-accent: #e95000;
      --color-success: #2dd36f;
      --color-tertiary: #6a64ff;
    }

    ion-toolbar {
      --background: var(--color-primary-dark);
      --color: var(--color-text-light);
    }

    .plan-card {
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .plan-header {
      background: linear-gradient(135deg, var(--color-primary-dark), var(--color-secondary-dark));
      padding-bottom: 8px;
    }

    ion-card-title {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--color-text-light);
    }

    ion-card-subtitle {
      font-size: 15px;
      opacity: 0.95;
      display: flex;
      gap: 12px;
      color: var(--color-text-light);
    }

    .level-badge, .days-badge {
      background-color: rgba(255, 255, 255, 0.3);
      padding: 6px 12px;
      border-radius: 12px;
      font-weight: 500;
      color: var(--color-text-light);
    }

    .plan-description {
      margin: 10px 0 28px 0;
      color: var(--color-text-medium);
      line-height: 1.6;
      font-size: 17px;
    }

    .plan-details {
      display: flex;
      flex-direction: column;
      gap: 22px;
      margin-bottom: 32px;
      padding: 24px;
      background-color: var(--color-background-light);
      border-radius: 10px;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 18px;
    }

    .detail-item ion-icon {
      font-size: 30px;
      color: var(--color-primary-dark);
      margin-top: 4px;
    }

    .detail-content h4 {
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--color-text-dark);
      font-size: 19px;
    }

    .detail-content p {
      margin: 0;
      color: var(--color-text-medium);
      font-size: 17px;
    }

    .plan-message {
      margin: 24px 0;
      padding: 18px 20px;
      background-color: rgba(0, 68, 148, 0.1);
      border-radius: 10px;
      border-left: 5px solid var(--color-primary-dark);
      color: var(--color-text-medium);
      font-size: 16px;
    }

    .start-button {
      margin-top: 24px;
      --background: var(--color-accent);
      --color: var(--color-text-light);
      --border-radius: 10px;
      --box-shadow: 0 4px 12px rgba(233, 80, 0, 0.4);
      font-weight: 600;
      font-size: 17px;
      height: 52px;
      text-transform: none;
      letter-spacing: 0;
    }

    .start-button ion-icon {
      font-size: 22px;
      margin-right: 6px;
    }

    .enrolled-message {
      margin: 24px 0 10px 0;
      padding: 20px;
      background-color: rgba(45, 211, 111, 0.1);
      border-radius: 10px;
      text-align: center;
      color: var(--color-text-medium);
      border: 1px solid rgba(45, 211, 111, 0.3);
    }

    .enrolled-message ion-icon {
      font-size: 40px;
      color: var(--color-success);
      margin-bottom: 10px;
    }

    .calendar-button {
      margin-top: 16px;
      --border-radius: 10px;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0;
    }

    .no-plan-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 32px 16px;
    }

    .no-plan-icon {
      font-size: 70px;
      color: var(--color-primary-dark);
      margin: 0 auto 20px;
      display: block;
    }

    .onboarding-button {
      margin-top: 24px;
      --background: var(--color-primary-dark);
      --color: var(--color-text-light);
      --border-radius: 10px;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0;
    }

    /* Mejoras para alto contraste */
    :host-context(.high-contrast) {
      --color-primary-dark: #003B7A;
      --color-text-dark: #000000;
      --color-text-medium: #121212;
      --color-accent: #C14000;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --color-background-light: #1c1c1c;
        --color-text-medium: #e0e0e0;
        --color-text-dark: #ffffff;
      }

      .plan-details {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
      }

      .enrolled-message {
        background-color: rgba(45, 211, 111, 0.15);
        border: 1px solid rgba(45, 211, 111, 0.2);
      }
    }
  `,
	],
})
export class AssignedPlanPage implements OnInit {
	plan: Plan | null = null;
	private userId: string;
	userHasEnrollments = false;

	constructor(
		private http: HttpClient,
		private loadingCtrl: LoadingController,
		private store: Store,
	) {
		// Obtener el userId del AuthState
		const user = this.store.selectSnapshot(AuthState.getUser) as User | null;
		if (user?._id) {
			this.userId = user._id;
			console.log("🔑 ID de usuario obtenido de AuthState:", this.userId);
		} else {
			// Fallback solo si no hay usuario en AuthState
			this.userId = localStorage.getItem("userId") || "unknown_user";
			console.warn("⚠️ No se encontró usuario en AuthState, usando ID de localStorage:", this.userId);
		}
	}

	async ngOnInit() {
		const loading = await this.loadingCtrl.create({
			message: "Cargando tu plan...",
			spinner: "circles",
			cssClass: "loading-content",
		});

		await loading.present();

		try {
			// Verificar que tenemos un ID de usuario válido
			if (!this.userId || this.userId === "unknown_user") {
				// Intentar obtener el ID del AuthState nuevamente en caso de que haya cambiado
				const user = this.store.selectSnapshot(AuthState.getUser) as User | null;
				if (user?._id) {
					this.userId = user._id;
					console.log("🔄 ID de usuario actualizado desde AuthState:", this.userId);
				} else {
					console.error("❌ No se pudo obtener un ID de usuario válido");
					throw new Error("Usuario no identificado");
				}
			}

			console.log("📋 Obteniendo plan para el usuario:", this.userId);

			// Obtener el cliente con su plan asignado
			const response = await this.http.get<any>(`${environment.apiUrl}/clients/${this.userId}`).toPromise();
			console.log("Respuesta completa del endpoint:", response);

			// Extraer planId de la estructura de respuesta
			// Puede estar en response.planId o en response.data.planId dependiendo de la API
			let planId = null;

			if (response?.data?.planId) {
				// Si la respuesta tiene una estructura {success: true, data: {planId: '...'}}
				planId = response.data.planId;
				console.log("📝 Plan ID extraído de response.data:", planId);
			} else if (response?.planId) {
				// Si la respuesta es directamente el objeto usuario
				planId = response.planId;
				console.log("📝 Plan ID extraído directamente de la respuesta:", planId);
			}

			if (planId) {
				// Si tiene un plan asignado, obtener los detalles del plan
				console.log("🔍 Obteniendo detalles del plan:", planId);
				const planResponse = await this.http.get<any>(`${environment.apiUrl}/plans/${planId}`).toPromise();

				if (planResponse?.data) {
					this.plan = this.normalizePlanData(planResponse.data);
					console.log("✅ Plan cargado correctamente:", this.plan?.name);
				} else if (planResponse) {
					// Si no hay estructura anidada, usar directamente la respuesta
					this.plan = this.normalizePlanData(planResponse);
					console.log("✅ Plan cargado sin estructura data:", this.plan?.name);
				} else {
					console.log("ℹ️ No se pudo obtener información del plan");
				}
			} else {
				console.log("ℹ️ El usuario no tiene un plan asignado");
			}

			// Verificar si el usuario ya está inscrito en algún horario
			this.checkUserEnrollments();
		} catch (error) {
			console.error("❌ Error al cargar el plan asignado:", error);
		} finally {
			loading.dismiss();
		}
	}

	/**
	 * Verifica si el usuario está inscrito en algún horario
	 */
	private checkUserEnrollments(): void {
		// Obtener todos los horarios disponibles
		const schedules = this.store.selectSnapshot(ScheduleState.getSchedules);

		// Si no hay horarios cargados, intentar obtenerlos del estado
		if (!schedules || schedules.length === 0) {
			console.log("No hay horarios cargados, verificando más tarde...");

			// Intentar verificar después que se carguen
			setTimeout(() => {
				const updatedSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);
				this.checkEnrollmentsFromSchedules(updatedSchedules);
			}, 1000);

			return;
		}

		this.checkEnrollmentsFromSchedules(schedules);
	}

	/**
	 * Comprueba las inscripciones del usuario a partir de los horarios proporcionados
	 */
	private checkEnrollmentsFromSchedules(schedules: Schedule[]): void {
		if (!schedules || !Array.isArray(schedules)) {
			console.log("No hay horarios disponibles para verificar inscripciones");
			return;
		}

		// Verificar si el usuario está inscrito en algún horario
		this.userHasEnrollments = schedules.some(
			(schedule) => schedule.clients && Array.isArray(schedule.clients) && schedule.clients.includes(this.userId),
		);

		console.log(`Usuario ${this.userHasEnrollments ? "está" : "no está"} inscrito en horarios`);
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

	/**
	 * Obtiene el texto descriptivo del nivel de entrenamiento
	 */
	getLevelText(level: string): string {
		switch (level) {
			case "beginner":
				return "Principiante";
			case "intermediate":
				return "Intermedio";
			case "advanced":
				return "Avanzado";
			default:
				return level || "Principiante";
		}
	}

	/**
	 * Obtiene los días únicos para los que hay ejercicios
	 */
	getDayGroups(): number[] {
		if (!this.plan?.exercises || !this.plan.exercises.length) return [1, 2, 3];

		const uniqueDays = [...new Set(this.plan.exercises.map((ex) => ex.day))];
		return uniqueDays.sort((a, b) => a - b);
	}

	/**
	 * Filtra los ejercicios para un día específico
	 */
	getExercisesForDay(day: number) {
		return this.plan?.exercises?.filter((ex) => ex.day === day) || [];
	}
}
