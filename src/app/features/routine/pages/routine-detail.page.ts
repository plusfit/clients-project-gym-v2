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
  IonIcon,
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
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>
          <span style="opacity: 0.9; font-family: 'APEXPRO'">RUTINAS</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="content">
      <div class="container">
        <ng-container *ngIf="routine; else noRoutine">
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
          <div class="no-routine-message">
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
    IonIcon,
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
    this.actions$
      .pipe(ofActionSuccessful(LoadRoutineById), takeUntil(this.destroy$))
      .subscribe(() => {
        const routine = this.store.selectSnapshot(
          RoutineState.getSelectedRoutine,
        );

        if (routine) {
          this.routine = routine;
          this.subroutines = routine.subRoutines as SubRoutine[];
        }
      });

    this.authFacade.user$.subscribe((user) => {
      if (user && user.routineId) {
        this.store.dispatch(new LoadRoutineById(user.routineId));
      } else {
        this.store.dispatch(new LoadRoutines()).subscribe(() => {
          const routines = this.store.selectSnapshot(RoutineState.getRoutines);

          if (routines && routines.length > 0) {
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
