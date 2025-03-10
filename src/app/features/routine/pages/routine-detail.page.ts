import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { CommonModule } from '@angular/common';
import { map, switchMap } from 'rxjs/operators';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Routine } from '@shared/interfaces/routines.interface';
import {
  RoutineState,
  LoadRoutines,
} from '@feature/routine/state/routine.state';
import { SubroutineCardComponent } from '@feature/routine/components/subroutine-card.component';

@Component({
  selector: 'app-routine-detail-page',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            defaultHref="/cliente/rutinas"
            text="Atrás"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Tus Rutinas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>{{ routine?.name }}</h1>
      <p class="description">{{ routine?.description }}</p>
      <div class="subroutines">
        <app-subroutine-card
          *ngFor="let sub of routine?.subRoutines; let i = index"
          [subroutine]="sub"
          [index]="i"
        ></app-subroutine-card>
      </div>
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
    SubroutineCardComponent,
  ],
})
export class RoutineDetailPage implements OnInit {
  routine?: Routine;

  constructor(private store: Store) {}

  ngOnInit() {
    this.store
      .dispatch(new LoadRoutines())
      .pipe(
        switchMap(() =>
          this.store
            .select(RoutineState.getRoutines)
            .pipe(map((routines: Routine[]) => routines[0])),
        ),
      )
      .subscribe((routine) => {
        this.routine = routine;
      });
  }
}
