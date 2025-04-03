import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSpinner,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
} from '@ionic/angular/standalone';
import {
  AsyncPipe,
  NgIf,
  NgOptimizedImage,
  UpperCasePipe,
  NgClass,
} from '@angular/common';

import {
  RoutineState,
  LoadSelectedExercise,
} from '@feature/routine/state/routine.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Exercise } from '../interfaces/routine.interface';
import { PluralizePipe } from '@shared/pipes/pluralize.pipe';

declare module '../interfaces/routine.interface' {
  interface Exercise {
    instructions?: string;
  }
}

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/cliente/rutinas"></ion-back-button>
        </ion-buttons>
        <ion-title class="ion-text-center">Ejercicio</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="content">
      <div class="container">
        <!-- Loading state -->
        <div class="loading-container" *ngIf="isLoading">
          <div class="loading-card">
            <ion-spinner name="crescent" class="loading-spinner"></ion-spinner>
            <h3 class="loading-title">Cargando ejercicio</h3>
            <p class="loading-text">
              Por favor espera mientras cargamos la información...
            </p>
          </div>
        </div>

        <ng-container
          *ngIf="
            !isLoading && (selectedExercise$ | async) as exercise;
            else noExercise
          "
        >
          <ion-card class="exercise-card">
            <div class="image-container">
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
              <div class="image-overlay"></div>
              <div
                class="image-type-badge"
                [ngClass]="{ cardio: exercise.type === 'cardio' }"
              >
                {{
                  exercise.type === 'room'
                    ? 'SALA'
                    : (exercise.type | uppercase)
                }}
              </div>
            </div>
            <ion-card-header class="card-header">
              <ion-card-title class="card-title">
                <ion-icon
                  [name]="
                    exercise.type === 'cardio'
                      ? 'fitness-outline'
                      : 'barbell-outline'
                  "
                  class="header-icon"
                ></ion-icon>
                {{ exercise.name }}
              </ion-card-title>
            </ion-card-header>
            <ion-card-content class="card-content">
              <div class="description-container">
                <p class="exercise-description">{{ exercise.description }}</p>
              </div>

              <div class="details-section">
                <div class="section-header">
                  <ion-icon
                    name="information-circle-outline"
                    class="section-icon"
                  ></ion-icon>
                  <span class="section-title">Detalles del Ejercicio</span>
                </div>

                <div class="detail-item">
                  <div class="detail-icon-container">
                    <ion-icon
                      name="time-outline"
                      class="detail-icon"
                    ></ion-icon>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Tiempo de descanso</span>
                    <p class="detail-text">
                      {{ exercise.rest | pluralize: 'minuto' }}
                    </p>
                  </div>
                </div>

                <div class="detail-item" *ngIf="exercise.reps">
                  <div class="detail-icon-container">
                    <ion-icon
                      name="repeat-outline"
                      class="detail-icon"
                    ></ion-icon>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Repeticiones</span>
                    <p class="detail-text">
                      {{
                        exercise.reps | pluralize: 'repetición' : 'repeticiones'
                      }}
                    </p>
                  </div>
                </div>

                <div class="detail-item" *ngIf="exercise.series">
                  <div class="detail-icon-container">
                    <ion-icon
                      name="layers-outline"
                      class="detail-icon"
                    ></ion-icon>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Series</span>
                    <p class="detail-text">
                      {{ exercise.series | pluralize: 'serie' }}
                    </p>
                  </div>
                </div>

                <div
                  class="detail-item"
                  *ngIf="exercise.type === 'cardio' && exercise.minutes"
                >
                  <div class="detail-icon-container">
                    <ion-icon
                      name="stopwatch-outline"
                      class="detail-icon"
                    ></ion-icon>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Duración</span>
                    <p class="detail-text">
                      {{ exercise.minutes | pluralize: 'minuto' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="instructions-section" *ngIf="exercise.instructions">
                <div class="section-header">
                  <ion-icon name="list-outline" class="section-icon"></ion-icon>
                  <span class="section-title">Instrucciones</span>
                </div>
                <div class="instructions-content">
                  <p class="instructions-text">{{ exercise.instructions }}</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </ng-container>

        <ng-template #noExercise>
          <ion-card class="not-found-card" *ngIf="!isLoading">
            <ion-card-header class="not-found-header">
              <ion-card-title class="not-found-title">
                <ion-icon
                  name="alert-circle-outline"
                  class="not-found-icon"
                ></ion-icon>
                Ejercicio no encontrado
              </ion-card-title>
            </ion-card-header>
            <ion-card-content class="not-found-content">
              <div class="empty-state">
                <ion-icon name="fitness-outline" class="empty-icon"></ion-icon>
                <p class="empty-text">
                  No se ha encontrado el ejercicio solicitado.
                </p>
                <ion-button
                  fill="outline"
                  size="small"
                  routerLink="/cliente/rutinas"
                >
                  Ver rutinas
                  <ion-icon name="arrow-forward" slot="end"></ion-icon>
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
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
        align-items: center;
        max-width: 800px;
        margin: 0 auto;
        min-height: 100%;
      }

      @keyframes exercise-light-sweep {
        0% {
          opacity: 0;
          transform: translateX(-100%);
        }
        50% {
          opacity: 0.7;
        }
        100% {
          opacity: 0;
          transform: translateX(100%);
        }
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

      /* CARDS */
      .exercise-card {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        margin: 16px 0;
        width: 100%;
        background-color: rgba(30, 30, 30, 0.7);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
        }
      }

      .image-container {
        position: relative;
        width: 100%;
        height: 250px;
        overflow: hidden;
      }

      .exercise-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;

        &:hover {
          transform: scale(1.03);
        }
      }

      .image-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.9) 0%,
          rgba(0, 0, 0, 0) 100%
        );
      }

      .image-type-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: linear-gradient(
          135deg,
          var(--ion-color-primary-shade) 0%,
          var(--ion-color-primary) 100%
        );
        color: white;
        padding: 6px 12px;
        border-radius: 30px;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 1px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);

        &.cardio {
          background: linear-gradient(
            135deg,
            var(--ion-color-secondary-shade) 0%,
            var(--ion-color-secondary) 100%
          );
          color: var(--ion-color-secondary-contrast);
        }
      }

      .card-header {
        background: linear-gradient(
          135deg,
          var(--ion-color-primary-shade) 0%,
          var(--ion-color-primary) 100%
        );
        padding: 16px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(var(--ion-color-primary-rgb), 0.5);

        &::before {
          content: '';
          position: absolute;
          top: -8px;
          right: 4px;
          width: 80px;
          height: 80px;
          background-image: url('/assets/logos/logo.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 60px;
        }

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          opacity: 0;
          animation: exercise-light-sweep 2.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
      }

      .card-title {
        color: white;
        font-size: 1.4rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-family: 'APEXPRO', sans-serif;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        position: relative;
        z-index: 1;
      }

      .header-icon {
        margin-right: 10px;
        font-size: 1.5rem;
        color: white;
      }

      .card-content {
        padding: 0;
        background-color: transparent;
      }

      .description-container {
        padding: 20px;
        background-color: rgba(0, 0, 0, 0.2);
        margin-bottom: 16px;
      }

      .exercise-description {
        color: #e0e0e0;
        font-size: 1rem;
        line-height: 1.6;
        margin: 0;
        padding: 0 5px 0 12px;
        border-left: 3px solid var(--ion-color-primary);
      }

      .details-section,
      .instructions-section {
        padding: 0 16px 16px;
        margin-bottom: 16px;
      }

      .section-header {
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 12px;
        background: rgba(var(--ion-color-primary-rgb), 0.15);
        border-radius: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .section-icon {
        font-size: 1.3rem;
        color: var(--ion-color-primary);
        margin-right: 10px;
      }

      .section-title {
        font-size: 1.1rem;
        color: white;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-item {
        display: flex;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);

        &:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
      }

      .detail-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(var(--ion-color-primary-rgb), 0.15);
        border-radius: 50%;
        margin-right: 16px;
        flex-shrink: 0;
      }

      .detail-icon {
        font-size: 1.2rem;
        color: var(--ion-color-primary);
      }

      .detail-content {
        flex: 1;
      }

      .detail-label {
        display: block;
        font-size: 0.8rem;
        color: var(--ion-color-medium);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .detail-text {
        font-size: 1.1rem;
        color: white;
        margin: 0;
        font-weight: 500;
      }

      .instructions-content {
        padding: 16px;
        background: rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        border-left: 3px solid var(--ion-color-primary);
      }

      .instructions-text {
        margin: 0;
        font-size: 1rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
      }

      /* Not Found */
      .not-found-card {
        border-radius: 16px;
        overflow: hidden;
        margin: 16px 0;
        width: 100%;
        max-width: 600px;
        background-color: rgba(30, 30, 30, 0.7);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .not-found-header {
        background: linear-gradient(
          135deg,
          var(--ion-color-danger-shade) 0%,
          var(--ion-color-danger) 100%
        );
        padding: 16px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 15px rgba(var(--ion-color-danger-rgb), 0.5);

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          opacity: 0;
          animation: exercise-light-sweep 2.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
      }

      .not-found-title {
        color: white;
        font-size: 1.4rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        font-family: 'APEXPRO', sans-serif;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .not-found-icon {
        margin-right: 10px;
        font-size: 1.5rem;
      }

      .not-found-content {
        padding: 16px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        text-align: center;
      }

      .empty-icon {
        font-size: 4rem;
        color: var(--ion-color-danger);
        margin-bottom: 16px;
        opacity: 0.7;
      }

      .empty-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.1rem;
        margin-bottom: 24px;
      }

      /* Media Queries */
      @media (max-width: 576px) {
        .container {
          padding: 12px;
        }

        .exercise-card,
        .not-found-card {
          margin: 8px 0;
        }

        .card-title {
          font-size: 1.2rem;
        }

        .image-container {
          height: 200px;
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

      ion-toolbar {
        --padding-start: 8px;
        --padding-end: 8px;
      }

      ion-title {
        padding-right: 0;
        margin-right: 0;
        text-align: center;
      }

      ion-back-button {
        margin-right: 8px;
      }
    `,
  ],
  imports: [
    NgIf,
    IonHeader,
    IonContent,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    IonIcon,
    IonButtons,
    IonBackButton,
    AsyncPipe,
    NgOptimizedImage,
    UpperCasePipe,
    NgClass,
    IonButton,
    RouterLink,
    PluralizePipe,
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
