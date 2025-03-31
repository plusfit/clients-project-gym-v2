import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { Exercise } from '../interfaces/routine.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exercise-card',
  templateUrl: './exercise-card.component.html',
  styleUrls: ['./exercise-card.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonIcon, CommonModule, RouterLink],
})
export class ExerciseCardComponent {
  @Input() exercise!: Exercise;

  get isCardio(): boolean {
    return this.exercise.type === 'cardio';
  }
}
