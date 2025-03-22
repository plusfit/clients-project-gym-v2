import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, Actions, ofActionSuccessful } from '@ngxs/store';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  Routine,
  SubRoutine,
  SubRoutineWithExerciseDetails,
} from '../interfaces/routine.interface';
import {
  RoutineState,
  LoadRoutineById,
  LoadRoutines,
} from '@feature/routine/state/routine.state';
import { SubroutineCardComponent } from '@feature/routine/components/subroutine-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacadeService } from '@feature/auth/services/auth-facade.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-routine-detail-page',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Tus Rutinas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ng-container *ngIf="routine; else noRoutine">
        <h1>{{ routine.name }}</h1>
        <p class="description">{{ routine.description }}</p>
        <div class="subroutines">
          <app-subroutine-card
            *ngFor="let sub of subroutines; let i = index"
            [subroutine]="sub"
            [index]="i"
          ></app-subroutine-card>
        </div>
      </ng-container>
      <ng-template #noRoutine>
        <div class="no-routine-message">
          <h2>No tienes rutina asignada</h2>
          <p>
            Por favor, comunícate con tu entrenador para que te asigne una
            rutina personalizada.
          </p>
        </div>
      </ng-template>
    </ion-content>
  `,
  styles: [
    `
      ion-header {
        background-color: var(--ion-color-primary);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      ion-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--ion-color-primary);
      }
      ion-content {
        background-color: var(--ion-color-primary);
      }
      h1 {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 16px;
        line-height: 1.2;
        color: var(--ion-color-primary);
      }
      .description {
        font-size: 0.8rem;
        line-height: 1.5;
        margin-bottom: 24px;
        color: var(--ion-color-secondary);
        font-family: 'Helvetica Neue', Arial, sans-serif;
      }
      .subroutines {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .no-routine-message {
        text-align: center;
        padding: 2rem;
        color: var(--ion-color-primary);
      }
      .no-routine-message h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }
      .no-routine-message p {
        font-size: 1rem;
        line-height: 1.5;
        opacity: 0.9;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    SubroutineCardComponent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
  ],
})
export class RoutineDetailPage implements OnInit, OnDestroy {
  routine?: Routine;
  subroutines: SubRoutine[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private route: ActivatedRoute,
    private authFacade: AuthFacadeService,
  ) {}

  ngOnInit() {
    // Escuchar cuando LoadRoutineById se complete exitosamente
    this.actions$
      .pipe(ofActionSuccessful(LoadRoutineById), takeUntil(this.destroy$))
      .subscribe(() => {
        // Obtener la rutina directamente del estado
        const routine = this.store.selectSnapshot(
          RoutineState.getSelectedRoutine,
        );
        console.log('RoutineDetailPage: Rutina cargada con éxito:', routine);

        if (routine) {
          this.routine = routine;
          this.subroutines = routine.subRoutines as SubRoutine[];
        }
      });

    this.authFacade.user$.subscribe((user) => {
      console.log(
        'RoutineDetailPage: Usuario obtenido del estado de autenticación:',
        user,
      );

      if (user && user.routineId) {
        this.store.dispatch(new LoadRoutineById(user.routineId));
      } else {
        console.log(
          'RoutineDetailPage: Usuario sin routineId, cargando rutinas generales',
        );
        this.store.dispatch(new LoadRoutines()).subscribe(() => {
          const routines = this.store.selectSnapshot(RoutineState.getRoutines);

          if (routines && routines.length > 0) {
            console.log(
              `RoutineDetailPage: Cargando primera rutina: ${routines[0]._id}`,
            );
            this.store.dispatch(new LoadRoutineById(routines[0]._id));
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
