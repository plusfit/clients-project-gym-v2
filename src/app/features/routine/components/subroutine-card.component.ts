import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
} from '@ionic/angular/standalone';
import { SubRoutine } from '@shared/interfaces/routines.interface';
import { ExerciseCardComponent } from '@feature/routine/components/exercise-card.component';

@Component({
  selector: 'app-subroutine-card',
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>{{ subroutine.name }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p>{{ subroutine.description }}</p>
        <ion-list>
          <app-exercise-card
            *ngFor="let exercise of subroutine.exercises"
            [exercise]="exercise"
          >
          </app-exercise-card>
        </ion-list>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      ion-card {
        margin: 0;
      }
      ion-card-title {
        font-size: 1.1rem;
        font-weight: bold;
      }
      p {
        margin: 4px 0 12px 0;
        color: #616161;
      }
    `,
  ],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    CommonModule,
    ExerciseCardComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
  ],
})
export class SubroutineCardComponent {
  @Input() subroutine!: SubRoutine;
}
