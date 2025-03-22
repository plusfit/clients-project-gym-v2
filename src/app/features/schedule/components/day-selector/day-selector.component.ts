import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-day-selector',
  template: `
    <div class="day-segment">
      <button
        *ngFor="let day of days"
        [class.selected]="day === selectedDay"
        (click)="selectDay(day)"
      >
        <span class="label">{{ day }}</span>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        font-family: 'Inter', sans-serif;
      }
      .day-segment {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding: 1rem;
        background: rgba(30, 30, 30, 0.6);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 20px;

        /* Estilos para el scrollbar horizontal */
        &::-webkit-scrollbar {
          height: 4px;
        }

        &::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--ion-color-primary);
          border-radius: 2px;
        }
      }
      button {
        flex: 0 0 auto;
        padding: 10px 20px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.2);
        color: rgba(255, 255, 255, 0.8);
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition:
          background 250ms,
          box-shadow 250ms,
          transform 250ms;
      }
      button:hover {
        background: rgba(var(--ion-color-primary-rgb), 0.15);
        border-color: rgba(var(--ion-color-primary-rgb), 0.3);
      }
      button:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(var(--ion-color-primary-rgb), 0.4);
      }
      button.selected {
        background: linear-gradient(
          135deg,
          var(--ion-color-primary-shade) 0%,
          var(--ion-color-primary) 100%
        );
        color: var(--ion-color-primary-contrast);
        border: none;
        box-shadow: 0 4px 10px rgba(var(--ion-color-primary-rgb), 0.3);
        transform: scale(1.05);
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .label {
        text-transform: capitalize;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class DaySelectorComponent {
  @Output() daySelected = new EventEmitter<string>();

  days: string[] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  selectedDay = 'Lunes';

  selectDay(day: string) {
    this.selectedDay = day;
    this.daySelected.emit(day);
  }
}
