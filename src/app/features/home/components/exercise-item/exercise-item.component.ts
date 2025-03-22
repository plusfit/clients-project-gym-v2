import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { IonIcon, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Exercise } from '@feature/routine/interfaces/routine.interface';

@Component({
  selector: 'app-exercise-item',
  templateUrl: './exercise-item.component.html',
  styleUrls: ['./exercise-item.component.scss'],
  imports: [IonItem, IonIcon, IonLabel, NgIf],
  standalone: true,
})
export class ExerciseItemComponent {
  @Input() exercise!: Exercise;
  @Output() exerciseClick = new EventEmitter<Exercise>();

  onExerciseClick(): void {
    this.exerciseClick.emit(this.exercise);
  }
}
