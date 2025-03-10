import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonLoading,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { AsyncPipe, NgIf, NgOptimizedImage } from '@angular/common';
import { Exercise } from '@shared/interfaces/routines.interface';
import {
  LoadSelectedExercise,
  RoutineState,
} from '@feature/routine/state/routine.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  template: `
    <ion-header class="header">
      <ion-toolbar class="toolbar">
        <ion-buttons slot="start">
          <ion-back-button
            defaultHref="/cliente/rutinas"
            text="Atrás"
          ></ion-back-button>
        </ion-buttons>
        <ion-title class="title"> Ejercicio </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="content">
      <div class="content">
        <!-- Loader overlay -->
        <ion-loading
          [isOpen]="isLoading"
          message="Cargando ejercicio..."
        ></ion-loading>

        <ng-container
          *ngIf="selectedExercise$ | async as exercise; else noExercise"
        >
          <ion-card class="exercise-card">
            <img
              alt="Imagen del ejercicio"
              [ngSrc]="
                exercise.imageUrl ||
                'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2xwdXc4aDJreTRiOG13d2pnNndmYW55cWFiYngzZ2MybXZ2YzI4MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2YOxU0vp6dD91UC4/giphy.gif'
              "
              class="exercise-img"
              width="800"
              height="350"
            />
            <ion-card-header>
              <ion-card-subtitle> {{ exercise.type }}</ion-card-subtitle>
              <ion-card-title class="card-title">
                <ion-icon name="barbell-outline" class="header-icon"></ion-icon>
                {{ exercise.name }}
              </ion-card-title>
            </ion-card-header>
            <ion-card-content class="card-content">
              <p>
                <ion-icon name="document-text-outline" class="icon"></ion-icon>
                <span class="label">Descripción:</span>
                {{ exercise.description }}
              </p>
              <p>
                <ion-icon name="time-outline" class="icon"></ion-icon>
                <span class="label">Tiempo de descanso:</span>
                {{ exercise.rest }} min
              </p>
              <p>
                <ion-icon name="repeat-outline" class="icon"></ion-icon>
                <span class="label">Repeticiones:</span> {{ exercise.reps }}
              </p>
              <p>
                <ion-icon name="barbell-outline" class="icon"></ion-icon>
                <span class="label">Series:</span> {{ exercise.series }}
              </p>
            </ion-card-content>
          </ion-card>
        </ng-container>

        <ng-template #noExercise>
          <ion-card class="not-found-card">
            <ion-card-header class="card-header">
              <ion-card-title class="card-title">
                <ion-icon
                  name="alert-circle-outline"
                  class="header-icon"
                ></ion-icon>
                Ejercicio no encontrado
              </ion-card-title>
            </ion-card-header>
            <ion-card-content class="card-content">
              <p>
                <ion-icon
                  name="information-circle-outline"
                  class="icon"
                ></ion-icon>
                No se ha encontrado el ejercicio solicitado.
              </p>
            </ion-card-content>
          </ion-card>
        </ng-template>
      </div>
    </ion-content>
  `,
  styles: [
    `
      /* HEADER */
      .header {
        background: var(--ion-color-light);
      }
      .toolbar {
        background: transparent;
      }
      .title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ion-color-dark);
      }
      .header-icon {
        margin-right: 8px;
        font-size: 1.5rem;
        vertical-align: middle;
        color: var(--ion-color-primary);
      }

      /* CONTENT - CENTRADO */
      .content {
        padding: 24px;
        background-color: #ffffff;
        height: calc(100% - 56px);
      }

      /* CARDS */
      .exercise-card,
      .not-found-card {
        border-radius: 12px;
        margin: 16px 0;
        border: none;
        overflow: hidden;
        width: 100%;
        max-width: 600px;
      }
      .exercise-img {
        width: 100%;
        height: 350px;
        object-fit: cover;
      }
      .card-title {
        font-size: 1.3rem;
        font-weight: bold;
        color: var(--ion-color-primary);
      }
      .not-found-card .card-header {
        background-color: var(--ion-color-warning-tint);
      }
      .not-found-card .card-title {
        font-size: 1.3rem;
        font-weight: bold;
        margin: 0;
        color: var(--ion-color-warning-contrast);
        display: flex;
        align-items: center;
      }
      .card-content {
        font-size: 1rem;
        padding: 12px;
        line-height: 1.6;
      }
      .card-content p {
        margin: 8px 0;
        display: flex;
        align-items: center;
      }
      .icon {
        margin-right: 10px;
        font-size: 1.2rem;
        vertical-align: middle;
        color: var(--ion-color-primary);
      }
      .label {
        color: #8c8c8c;
        margin-right: 8px;
      }
      p {
        color: #5a6268;
      }

      ion-card-subtitle {
        margin-left: 45px;
      }
    `,
  ],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    NgIf,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonLoading,
    IonIcon,
    IonButtons,
    IonBackButton,
    AsyncPipe,
    NgOptimizedImage,
    IonCardSubtitle,
  ],
})
export class ExerciseDetailPage implements OnInit {
  @Select(RoutineState.getSelectedExercise)
  selectedExercise$!: Observable<Exercise | null>;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
  ) {}

  ngOnInit() {
    const exerciseId = this.route.snapshot.paramMap.get('id');
    if (exerciseId) {
      this.isLoading = true;
      this.store.dispatch(new LoadSelectedExercise(exerciseId)).subscribe({
        next: () => (this.isLoading = false),
        error: () => (this.isLoading = false),
      });
    }
  }
}
