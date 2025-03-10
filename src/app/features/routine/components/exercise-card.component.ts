import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { Exercise } from '@shared/interfaces/routines.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exercise-card',
  template: `
    <ion-item
      lines="none"
      [routerLink]="['/cliente', 'rutinas', 'ejercicio', exercise._id]"
    >
      <ion-icon
        [name]="
          exercise.type === 'cardio' ? 'bicycle-outline' : 'barbell-outline'
        "
        slot="start"
      ></ion-icon>
      <ion-label>
        <h2>{{ exercise.name }}</h2>
        <p class="description">{{ exercise.description }}</p>
        <p class="details">
          <ion-icon name="time-outline"></ion-icon> Minutos:
          {{ exercise.minutes }} |
          <ion-icon name="repeat-outline"></ion-icon> Reps:
          {{ exercise.reps }} |
          <ion-icon name="layers-outline"></ion-icon> Series:
          {{ exercise.series }}
        </p>
      </ion-label>
    </ion-item>
  `,
  styles: [
    `
      ion-item {
        margin: 4px 0;
        padding: 8px 0;
        border-radius: 8px;
        border-bottom: 1px solid var(--ion-color-light-shade);
      }
      ion-icon {
        font-size: 1.5rem;
        color: var(--ion-color-primary);
      }
      h2 {
        font-size: 1rem;
        font-weight: 600;
        padding: 0;
        color: var(--ion-color-primary);
      }
      .description {
        margin: 2px 0;
        font-size: 0.9rem;
        color: var(--ion-color-secondary);
      }
      .details {
        margin: 2px 0;
        font-size: 0.85rem;
        color: var(--ion-color-secondary-tint);
      }
      .details ion-icon {
        font-size: 1rem;
        vertical-align: middle;
        color: var(--ion-color-primary);
      }
    `,
  ],
  standalone: true,
  imports: [IonItem, IonLabel, IonIcon, CommonModule, RouterLink],
})
export class ExerciseCardComponent {
  @Input() exercise!: Exercise;
}
