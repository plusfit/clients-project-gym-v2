import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule, LoadingController } from "@ionic/angular";
import { environment } from "environments/environment";
import { HighContrastDirective } from "src/app/shared/directives/high-contrast.directive";
import { Plan } from "../../interfaces/plan.interface";

@Component({
	selector: "app-assigned-plan",
	standalone: true,
	imports: [CommonModule, IonicModule, HighContrastDirective, RouterModule],
	template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mi Plan de Entrenamiento</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="plan; else noPlan">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ plan.name }}</ion-card-title>
            <ion-card-subtitle>{{ getLevelText(plan.level) }} | {{ plan.daysPerWeek }} días/semana</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>{{ plan.description }}</p>

            <ion-list *ngIf="plan.exercises && plan.exercises.length > 0">
              <ion-list-header>
                <ion-label>Ejercicios del Plan</ion-label>
              </ion-list-header>

              <ion-item-group *ngFor="let day of getDayGroups()">
                <ion-item-divider>
                  <ion-label>Día {{ day }}</ion-label>
                </ion-item-divider>

                <ion-item *ngFor="let exercise of getExercisesForDay(day)">
                  <ion-label>
                    <h3>{{ exercise.name }}</h3>
                    <p>{{ exercise.sets }} series × {{ exercise.reps }} repeticiones</p>
                    <p *ngIf="exercise.description">{{ exercise.description }}</p>
                  </ion-label>
                </ion-item>
              </ion-item-group>
            </ion-list>

            <div class="goal-section">
              <h4>Objetivo</h4>
              <p>{{ plan.goal }}</p>
            </div>

            <div class="duration-section">
              <h4>Duración</h4>
              <p>{{ plan.duration }} semanas</p>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <ng-template #noPlan>
        <div class="no-plan-container">
          <ion-card>
            <ion-card-header>
              <ion-card-title>No hay plan asignado</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>Aún no se te ha asignado un plan de entrenamiento.</p>
              <p>Completa el proceso de onboarding para recibir tu plan personalizado.</p>

              <ion-button expand="block" [routerLink]="['/onboarding']">
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
    .goal-section, .duration-section {
      margin-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 16px;
    }

    h4 {
      font-weight: 600;
      color: var(--ion-color-primary);
      margin-bottom: 8px;
    }

    .no-plan-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    ion-button {
      margin-top: 20px;
    }
  `,
	],
})
export class AssignedPlanPage implements OnInit {
	plan: Plan | null = null;
	private userId: string;

	constructor(
		private http: HttpClient,
		private loadingCtrl: LoadingController,
	) {
		this.userId = localStorage.getItem("userId") || "currentUser";
	}

	async ngOnInit() {
		const loading = await this.loadingCtrl.create({
			message: "Cargando tu plan...",
			spinner: "circles",
			cssClass: "loading-content",
		});

		await loading.present();

		try {
			// Obtener el cliente con su plan asignado
			const response = await this.http.get<any>(`${environment.apiUrl}/clients/${this.userId}`).toPromise();

			if (response && response.planId) {
				// Si tiene un plan asignado, obtener los detalles del plan
				const planResponse = await this.http.get<Plan>(`${environment.apiUrl}/plans/${response.planId}`).toPromise();
				this.plan = planResponse || null;
			}
		} catch (error) {
			console.error("Error al cargar el plan asignado:", error);
		} finally {
			loading.dismiss();
		}
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
				return level;
		}
	}

	/**
	 * Obtiene los días únicos para los que hay ejercicios
	 */
	getDayGroups(): number[] {
		if (!this.plan?.exercises) return [];

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
