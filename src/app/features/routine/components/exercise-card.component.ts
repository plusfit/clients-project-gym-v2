import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonItem, IonLabel } from '@ionic/angular/standalone';
import { Exercise } from '@shared/interfaces/routines.interface';

@Component({
  selector: 'app-exercise-card',
  template: `
    <ion-item>
      <ion-label>
        <h2>{{ exercise.name }}</h2>
        <p>{{ exercise.description }}</p>
        <p>
          Minutos: {{ exercise.minutes }} | Reps: {{ exercise.reps }} | Series:
          {{ exercise.series }}
        </p>
      </ion-label>
    </ion-item>
  `,
  styles: [
    `
      ion-item {
        --padding-start: 0;
        --inner-padding-end: 0;
      }
      h2 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        color: #424242;
      }
      p {
        margin: 2px 0;
        font-size: 0.9rem;
        color: #757575;
      }
    `,
  ],
  standalone: true,
  imports: [IonItem, IonLabel, CommonModule, IonItem, IonLabel],
})
export class ExerciseCardComponent {
  @Input() exercise!: Exercise;
}
