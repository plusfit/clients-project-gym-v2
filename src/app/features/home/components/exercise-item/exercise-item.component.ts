import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { IonIcon, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Exercise } from '@shared/interfaces/routines.interface';

@Component({
  selector: 'app-exercise-item',
  templateUrl: './exercise-item.component.html',
  imports: [IonItem, IonIcon, IonLabel, NgIf],
  styleUrls: ['./exercise-item.component.scss'],
  standalone: true,
})
export class ExerciseItemComponent {
  @Input() exercise!: Exercise;
}
