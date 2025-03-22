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
import { SubRoutine } from '../interfaces/routine.interface';
import { ExerciseCardComponent } from '@feature/routine/components/exercise-card.component';

@Component({
  selector: 'app-subroutine-card',
  template: `
    <ion-card class="subroutine-card">
      <ion-card-header class="card-header">
        <div class="header-title">
          <ion-icon name="barbell-outline" class="header-icon"></ion-icon>
          <ion-card-title class="card-title">
            Día {{ index + 1 }} - {{ subroutine.name }}
          </ion-card-title>
        </div>
      </ion-card-header>
      <ion-card-content class="card-content">
        <p class="routine-description">{{ subroutine.description }}</p>
        <div class="exercises-section">
          <div class="exercises-header">
            <ion-icon name="fitness-outline" class="section-icon"></ion-icon>
            <span class="section-title"
              >Ejercicios ({{ exerciseObjects.length }})</span
            >
          </div>
          <ion-list class="exercises-list">
            <app-exercise-card
              *ngFor="let exercise of exerciseObjects"
              [exercise]="exercise"
            ></app-exercise-card>
          </ion-list>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      .subroutine-card {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        background-color: rgba(30, 30, 30, 0.7) !important;
        margin: 16px 0;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
          transform: translateY(-2px);
        }
      }

      .card-header {
        background: linear-gradient(
          135deg,
          var(--ion-color-primary-shade) 0%,
          var(--ion-color-primary) 100%
        );
        padding: 16px;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: -10px;
          right: -10px;
          width: 80px;
          height: 80px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z'%3E%3C/path%3E%3Cline x1='16' y1='8' x2='2' y2='22'%3E%3C/line%3E%3Cline x1='17.5' y1='15' x2='9' y2='15'%3E%3C/line%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          background-size: 60px;
          opacity: 0.4;
          transform: rotate(45deg);
        }
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
        z-index: 1;
      }

      .header-icon {
        font-size: 1.6rem;
        color: white;
      }

      .card-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: white;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-family: 'APEXPRO', sans-serif;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .card-content {
        padding: 16px;
        background-color: transparent;
      }

      .routine-description {
        color: #e0e0e0;
        font-size: 0.95rem;
        line-height: 1.5;
        margin-bottom: 20px;
        padding: 10px 12px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        border-left: 3px solid var(--ion-color-primary);
      }

      .exercises-section {
        margin-top: 16px;
      }

      .exercises-header {
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 12px;
        background: rgba(var(--ion-color-primary-rgb), 0.15);
        border-radius: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .section-icon {
        font-size: 1.2rem;
        margin-right: 8px;
        color: var(--ion-color-primary);
      }

      .section-title {
        color: white;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .exercises-list {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        padding: 8px !important;
        max-height: 350px;
        overflow-y: auto;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

        /* Estilos para el scrollbar */
        &::-webkit-scrollbar {
          width: 5px;
        }

        &::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 5px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--ion-color-primary);
          border-radius: 5px;
        }
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
