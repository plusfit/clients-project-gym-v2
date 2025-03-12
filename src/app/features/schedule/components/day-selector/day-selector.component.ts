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
        background: var(--ion-color-light, #f5f5f5);
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      button {
        flex: 0 0 auto;
        padding: 10px 20px;
        border: 1px solid rgba(0, 0, 0, 0.23);
        border-radius: 8px;
        background: transparent;
        color: var(--ion-color-dark, #424242);
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition:
          background 250ms,
          box-shadow 250ms,
          transform 250ms;
      }
      button:hover {
        background: rgba(0, 0, 0, 0.04);
      }
      button:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.5);
      }
      button.selected {
        background: var(--ion-color-primary, #1976d2);
        color: var(--ion-color-primary-contrast, #ffffff);
        border: none;
        box-shadow:
          0 3px 1px -2px rgba(0, 0, 0, 0.2),
          0 2px 2px rgba(0, 0, 0, 0.14),
          0 1px 5px rgba(0, 0, 0, 0.12);
        transform: scale(1.05);
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
