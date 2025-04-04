import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthFacadeService } from "@feature/auth/services/auth-facade.service";
import { SubroutineCardComponent } from "@feature/routine/components/subroutine-card.component";
import { LoadRoutineById, LoadRoutines, RoutineState } from "@feature/routine/state/routine.state";
import { IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import { addIcons } from "ionicons";
import { barbellOutline, fitnessOutline } from "ionicons/icons";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Routine, SubRoutine } from "../interfaces/routine.interface";

@Component({
	selector: "app-routine-detail-page",
	template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>
          <span style="opacity: 0.9; font-family: 'APEXPRO'">RUTINAS</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="content">
      <div class="container">
        <div class="loading-container" *ngIf="isLoading">
          <div class="loading-card">
            <ion-spinner name="crescent" class="loading-spinner"></ion-spinner>
            <h3 class="loading-title">Cargando rutina</h3>
            <p class="loading-text">
              Por favor espera mientras cargamos la información...
            </p>
          </div>
        </div>

        <ng-container *ngIf="routine && !isLoading; else noRoutine">
          <div class="header-container">
            <div class="routine-title">
              <ion-icon name="barbell-outline" class="header-icon"></ion-icon>
              <h1>{{ routine.name }}</h1>
            </div>
            <p class="description">{{ routine.description }}</p>
          </div>
          <div class="subroutines">
            <app-subroutine-card
              *ngFor="let sub of subroutines; let i = index"
              [subroutine]="sub"
              [index]="i"
            ></app-subroutine-card>
          </div>
        </ng-container>

        <ng-template #noRoutine>
          <div class="no-routine-message" *ngIf="!isLoading">
            <ion-icon name="fitness-outline" class="empty-icon"></ion-icon>
            <h2>No tienes rutina asignada</h2>
            <p>
              Por favor, comunícate con tu entrenador para que te asigne una
              rutina personalizada.
            </p>
          </div>
        </ng-template>
      </div>
    </ion-content>
  `,
	styles: [
		`
      /* CONTENT */
      .content {
        --background: linear-gradient(
          180deg,
          var(--ion-color-dark) 0%,
          #1a1a1a 100%
        );
      }

      .container {
        padding: 16px;
        display: flex;
        flex-direction: column;
        max-width: 800px;
        margin: 0 auto;
        min-height: 100%;
      }

      /* LOADING */
      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        width: 100%;
      }

      .loading-card {
        background: rgba(30, 30, 30, 0.7);
        border-radius: 16px;
        padding: 32px;
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(var(--ion-color-primary-rgb), 0.4);
        }
        70% {
          box-shadow: 0 0 0 15px rgba(var(--ion-color-primary-rgb), 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(var(--ion-color-primary-rgb), 0);
        }
      }

      .loading-spinner {
        width: 70px;
        height: 70px;
        color: var(--ion-color-primary);
        margin-bottom: 20px;
      }

      .loading-title {
        font-family: 'APEXPRO', sans-serif;
        color: white;
        font-size: 1.5rem;
        margin: 0 0 10px;
        text-align: center;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .loading-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin: 0;
        text-align: center;
      }

      .header-container {
        margin-bottom: 24px;
        background-color: rgba(30, 30, 30, 0.7);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .routine-title {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }

      .header-icon {
        font-size: 1.8rem;
        color: var(--ion-color-primary);
        margin-right: 12px;
      }

      h1 {
        font-size: 1.8rem;
        font-weight: 700;
        line-height: 1.2;
        color: white;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-family: 'APEXPRO', sans-serif;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .description {
        font-size: 1rem;
        line-height: 1.5;
        color: #e0e0e0;
        margin: 0;
        padding: 0 5px 0 12px;
        border-left: 3px solid var(--ion-color-primary);
      }

      .subroutines {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .no-routine-message {
        text-align: center;
        padding: 40px 20px;
        background-color: rgba(30, 30, 30, 0.7);
        border-radius: 16px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .empty-icon {
        font-size: 4rem;
        color: var(--ion-color-secondary);
        margin-bottom: 16px;
        opacity: 0.7;
      }

      .no-routine-message h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
        color: white;
        font-family: 'APEXPRO', sans-serif;
      }

      .no-routine-message p {
        font-size: 1rem;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.7);
      }

      /* Header styling */
      ion-toolbar {
        --background: transparent;
        --color: white;
      }

      ion-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: white;
      }

      ion-header {
        background: transparent;
      }

      ion-header::after {
        display: none;
      }

      /* Media Queries */
      @media (max-width: 576px) {
        .container {
          padding: 12px;
        }

        .loading-card {
          padding: 24px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
        }

        .loading-title {
          font-size: 1.2rem;
        }
      }
    `,
	],
	standalone: true,
	imports: [CommonModule, SubroutineCardComponent, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner],
})
export class RoutineDetailPage implements OnInit, OnDestroy {
	routine?: Routine;
	subroutines: SubRoutine[] = [];
	isLoading = true;
	private destroy$ = new Subject<void>();

	constructor(
		private store: Store,
		private actions$: Actions,
		private router: Router,
		private route: ActivatedRoute,
		private authFacade: AuthFacadeService,
	) {
		addIcons({
			"barbell-outline": barbellOutline,
			"fitness-outline": fitnessOutline,
		});
	}

	ngOnInit() {
		this.actions$.pipe(ofActionSuccessful(LoadRoutineById), takeUntil(this.destroy$)).subscribe(() => {
			const routine = this.store.selectSnapshot(RoutineState.getSelectedRoutine);

			if (routine) {
				this.routine = routine;
				this.subroutines = routine.subRoutines as SubRoutine[];
			}
			this.isLoading = false;
		});

		this.authFacade.user$.subscribe((user) => {
			this.isLoading = true;
			if (user?.routineId) {
				this.store.dispatch(new LoadRoutineById(user.routineId)).subscribe({
					error: () => {
						this.isLoading = false;
					},
				});
			} else {
				this.store.dispatch(new LoadRoutines()).subscribe({
					next: () => {
						const routines = this.store.selectSnapshot(RoutineState.getRoutines);

						if (routines && routines.length > 0) {
							this.store.dispatch(new LoadRoutineById(routines[0]._id)).subscribe({
								error: () => {
									this.isLoading = false;
								},
							});
						} else {
							this.isLoading = false;
						}
					},
					error: () => {
						this.isLoading = false;
					},
				});
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
