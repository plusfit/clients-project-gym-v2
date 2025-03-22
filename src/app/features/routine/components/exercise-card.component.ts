import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { Exercise } from '../interfaces/routine.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exercise-card',
  template: `
    <ion-item
      class="exercise-item"
      lines="none"
      [routerLink]="['/cliente', 'rutinas', 'ejercicio', exercise._id]"
    >
      <div class="exercise-icon-container">
        <ion-icon
          [name]="
            exercise.type === 'cardio' ? 'fitness-outline' : 'barbell-outline'
          "
          class="exercise-icon"
        ></ion-icon>
      </div>
      <ion-label class="exercise-label">
        <h2 class="exercise-name">{{ exercise.name }}</h2>
        <p class="exercise-description">{{ exercise.description }}</p>
        <div class="details-container">
          <div class="exercise-details" *ngIf="isCardio">
            <ion-icon name="time-outline" class="detail-icon"></ion-icon>
            <span class="detail-text">{{ exercise.minutes || 0 }} min</span>
          </div>
          <div class="exercise-details" *ngIf="isCardio">
            <ion-icon name="pause-outline" class="detail-icon"></ion-icon>
            <span class="detail-text"
              >{{ exercise.rest || 0 }} min descanso</span
            >
          </div>
          <div class="exercise-details" *ngIf="!isCardio">
            <ion-icon name="repeat-outline" class="detail-icon"></ion-icon>
            <span class="detail-text">{{ exercise.reps || 0 }} reps</span>
          </div>
          <div class="exercise-details" *ngIf="!isCardio">
            <ion-icon name="layers-outline" class="detail-icon"></ion-icon>
            <span class="detail-text">{{ exercise.series || 0 }} series</span>
          </div>
          <div class="exercise-details" *ngIf="!isCardio">
            <ion-icon name="pause-outline" class="detail-icon"></ion-icon>
            <span class="detail-text"
              >{{ exercise.rest || 0 }} min descanso</span
            >
          </div>
        </div>
      </ion-label>
    </ion-item>
  `,
  styles: [
    `
      .exercise-item {
        --padding-start: 8px;
        --inner-padding-end: 8px;
        --background: rgba(25, 25, 25, 0.7) !important;
        margin-bottom: 8px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        position: relative;
        transition: all 0.3s ease;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: var(--ion-color-primary);
          opacity: 0.8;
        }

        &:hover {
          --background: rgba(35, 35, 35, 0.8) !important;
          transform: translateX(3px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }

        &:active {
          --background: rgba(var(--ion-color-primary-rgb), 0.15) !important;
          transform: scale(0.98);
        }
      }

      .exercise-icon-container {
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

      .exercise-icon {
        color: var(--ion-color-primary);
        font-size: 1.5rem;
        z-index: 1;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
      }

      .exercise-label {
        padding: 10px 0;
      }

      .exercise-name {
        color: white !important;
        font-size: 1.05rem !important;
        font-weight: 600 !important;
        margin-bottom: 6px;
        text-transform: capitalize;
        letter-spacing: 0.3px;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
      }

      .exercise-description {
        color: rgba(255, 255, 255, 0.7) !important;
        font-size: 0.9rem;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .details-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 4px;
      }

      .exercise-details {
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px 8px;
        border-radius: 5px;
        width: -moz-fit-content;
        width: fit-content;
        transition: background-color 0.3s ease;

        &:hover {
          background: rgba(var(--ion-color-primary-rgb), 0.15);
        }
      }

      .detail-icon {
        font-size: 0.9rem !important;
        margin-right: 6px;
        color: var(--ion-color-primary) !important;
      }

      .detail-text {
        font-size: 0.85rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.85);
        letter-spacing: 0.5px;
      }
    `,
  ],
  standalone: true,
  imports: [IonItem, IonLabel, IonIcon, CommonModule, RouterLink],
})
export class ExerciseCardComponent {
  @Input() exercise!: Exercise;

  get isCardio(): boolean {
    return this.exercise.type === 'cardio';
  }
}
