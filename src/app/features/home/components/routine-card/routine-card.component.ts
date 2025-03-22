import { Component, Input } from '@angular/core';
import { ExerciseItemComponent } from '../exercise-item/exercise-item.component';
import { NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
} from '@ionic/angular/standalone';
import { SubRoutine } from '@feature/routine/interfaces/routine.interface';

@Component({
  selector: 'app-routine-card',
  templateUrl: './routine-card.component.html',
  styleUrls: ['./routine-card.component.scss'],
  standalone: true,
  imports: [
    ExerciseItemComponent,
    NgForOf,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonCardSubtitle,
    UpperCasePipe,
    IonCardContent,
    IonList,
    IonListHeader,
    IonLabel,
    NgIf,
  ],
})
export class RoutineCardComponent {
  @Input() routine!: SubRoutine | null;
}
