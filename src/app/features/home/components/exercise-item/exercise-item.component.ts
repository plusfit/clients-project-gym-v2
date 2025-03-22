import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { IonIcon, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Exercise } from '@feature/routine/interfaces/routine.interface';

@Component({
  selector: 'app-exercise-item',
  templateUrl: './exercise-item.component.html',
  imports: [IonItem, IonIcon, IonLabel, NgIf],
  standalone: true,
})
export class ExerciseItemComponent {
  @Input() exercise!: Exercise;
}
