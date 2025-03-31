import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonIcon,
} from '@ionic/angular/standalone';
import { SubRoutine } from '../interfaces/routine.interface';
import { ExerciseCardComponent } from '@feature/routine/components/exercise-card.component';

@Component({
  selector: 'app-subroutine-card',
  templateUrl: './subroutine-card.component.html',
  styleUrls: ['./subroutine-card.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonIcon,
    CommonModule,
    ExerciseCardComponent,
  ],
})
export class SubroutineCardComponent {
  @Input() subroutine!: SubRoutine;
  @Input() index!: number;
  @Input() isEnrolled: boolean = false; // Determina si el usuario está inscrito en este horario
  @Output() unsubscribe = new EventEmitter<SubRoutine>();

  get exerciseObjects() {
    if (!this.subroutine.exercises || this.subroutine.exercises.length === 0) {
      return [];
    }
    const exercises = this.subroutine.exercises as any[];
    if (exercises.length > 0 && typeof exercises[0] === 'string') {
      return exercises.map((id) => ({
        _id: id,
        name: 'Ejercicio',
        description: 'Cargando detalles...',
        type: 'room' as 'room' | 'cardio',
      }));
    }
    return exercises;
  }

  onUnsubscribe(event: Event) {
    event.stopPropagation(); // Evita que se active algún click del card
    this.unsubscribe.emit(this.subroutine);
  }
}
