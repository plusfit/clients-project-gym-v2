import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { SubRoutine } from '@shared/interfaces/routines.interface';
import { ExerciseCardComponent } from '@feature/routine/components/exercise-card.component';

@Component({
  selector: 'app-subroutine-card',
  template: `
    <ion-card>
      <ion-card-header>
        <div class="header-title">
          <ion-icon name="barbell-outline"></ion-icon>
          <ion-card-title>
            Día {{ index + 1 }} - {{ subroutine.name }}
          </ion-card-title>
        </div>
      </ion-card-header>
      <ion-card-content>
        <p>{{ subroutine.description }}</p>
        <ion-list>
          <app-exercise-card
            *ngFor="let exercise of subroutine.exercises"
            [exercise]="exercise"
          ></app-exercise-card>
        </ion-list>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      ion-card {
        margin: 0 0 16px 0;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background-color: var(--ion-color-light);
      }
      ion-card-header {
        background-color: var(--ion-color-primary-tint);
        padding: 12px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }
      .header-title ion-icon {
        font-size: 2rem;
        color: var(--ion-color-primary-contrast);
      }
      ion-card-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--ion-color-primary-contrast);
        flex-grow: 1;
      }
      ion-button {
        --padding-start: 0;
        --padding-end: 0;
      }
      ion-card-content {
        padding: 16px;
      }
      p {
        margin: 8px 0 16px 0;
        color: var(--ion-color-secondary);
        font-size: 0.95rem;
        line-height: 1.5;
      }
      ion-list {
        padding: 0;
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
    IonIcon,
    IonButton,
    CommonModule,
    ExerciseCardComponent,
  ],
})
export class SubroutineCardComponent {
  @Input() subroutine!: SubRoutine;
  @Input() index!: number;
  @Input() isEnrolled: boolean = false; // Determina si el usuario está inscrito en este horario
  @Output() unsubscribe = new EventEmitter<SubRoutine>();

  onUnsubscribe(event: Event) {
    event.stopPropagation(); // Evita que se active algún click del card
    this.unsubscribe.emit(this.subroutine);
  }
}
