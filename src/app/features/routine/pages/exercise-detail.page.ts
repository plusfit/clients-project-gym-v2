import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

// Extendemos la interfaz Exercise para incluir las propiedades que faltan
// Esta interfaz solo es para el compilador, no afecta la definición original
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
          <ion-back-button
            defaultHref="/cliente/rutinas"
            text="Atrás"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Detalle del Ejercicio</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="content">
      <div class="container">
        <!-- Loader overlay -->
        <ion-loading
          [isOpen]="isLoading"
          message="Cargando ejercicio..."
        ></ion-loading>

        <ng-container
          *ngIf="selectedExercise$ | async as exercise; else noExercise"
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
                    <p class="detail-text">{{ exercise.rest }} minutos</p>
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
                    <p class="detail-text">{{ exercise.reps }}</p>
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
                    <p class="detail-text">{{ exercise.series }}</p>
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
                    <p class="detail-text">{{ exercise.minutes }} minutos</p>
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
          <ion-card class="not-found-card">
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
        font-size: 1.2rem;
        margin-right: 8px;
        color: var(--ion-color-primary);
      }

      .section-title {
        color: white;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      /* DETAIL ITEMS */
      .detail-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 10px;
        background-color: rgba(25, 25, 25, 0.7);
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.05);

        &:hover {
          background-color: rgba(35, 35, 35, 0.8);
          transform: translateX(5px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      }

      .detail-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          rgba(var(--ion-color-primary-rgb), 0.15) 0%,
          rgba(var(--ion-color-primary-rgb), 0.25) 100%
        );
        margin-right: 12px;
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(var(--ion-color-primary-rgb), 0.2);

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0) 70%
          );
        }
      }

      .detail-icon {
        font-size: 1.5rem;
        color: var(--ion-color-primary);
        z-index: 1;
      }

      .detail-content {
        flex: 1;
      }

      .detail-label {
        color: var(--ion-color-secondary);
        font-size: 0.9rem;
        font-weight: 600;
        display: block;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-text {
        color: #e0e0e0;
        font-size: 1rem;
        line-height: 1.5;
        margin: 0;
      }

      .instructions-content {
        background-color: rgba(25, 25, 25, 0.7);
        padding: 16px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .instructions-text {
        color: #e0e0e0;
        font-size: 1rem;
        line-height: 1.6;
        margin: 0;
      }

      /* NO EXERCISE FOUND CARD */
      .not-found-card {
        border-radius: 16px;
        overflow: hidden;
        margin: 16px 0;
        width: 100%;
        background-color: rgba(30, 30, 30, 0.7);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .not-found-header {
        background: linear-gradient(
          135deg,
          var(--ion-color-secondary-shade) 0%,
          var(--ion-color-secondary) 100%
        );
        padding: 16px;
        position: relative;
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          z-index: 0;
        }
      }

      .not-found-title {
        color: var(--ion-color-secondary-contrast);
        font-size: 1.3rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        position: relative;
        z-index: 1;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .not-found-icon {
        margin-right: 10px;
        font-size: 1.5rem;
        color: var(--ion-color-secondary-contrast);
      }

      .not-found-content {
        padding: 24px;
      }

      .empty-state {
        text-align: center;
        padding: 30px 20px;
      }

      .empty-icon {
        font-size: 3.5rem;
        color: var(--ion-color-secondary);
        margin-bottom: 16px;
        opacity: 0.7;
      }

      .empty-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.1rem;
        margin-bottom: 20px;
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
    UpperCasePipe,
    NgClass,
    IonButton,
    RouterLink,
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
