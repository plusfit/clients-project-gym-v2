import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge } from '@ionic/angular/standalone';

interface DayEnrollment {
  day: string;
  count: number;
}

@Component({
  selector: 'app-day-selector',
  templateUrl: './day-selector.component.html',
  styleUrls: ['./day-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonBadge],
})
export class DaySelectorComponent {
  @Input() enrollmentsByDay: DayEnrollment[] = [];
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

  getEnrollmentCount(day: string): number {
    const enrollment = this.enrollmentsByDay.find((e) => e.day === day);
    return enrollment ? enrollment.count : 0;
  }
}
