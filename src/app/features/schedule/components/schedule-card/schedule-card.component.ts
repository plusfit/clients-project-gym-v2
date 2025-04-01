import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';

export interface Schedule {
  _id: string;
  startTime: string;
  endTime: string;
  maxCount: number;
  clients: string[];
  day: string;
}

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonBadge,
  ],
})
export class ScheduleCardComponent {
  @Input() schedule!: Schedule;
  @Input() currentUserId!: string;
  @Output() scheduleClicked = new EventEmitter<Schedule>();
  @Output() unsubscribeClicked = new EventEmitter<Schedule>();

  get isFull(): boolean {
    return (
      this.schedule.clients &&
      this.schedule.clients.length >= this.schedule.maxCount
    );
  }

  get isEnrolled(): boolean {
    return (
      this.schedule.clients &&
      this.schedule.clients.includes(this.currentUserId)
    );
  }

  handleClick() {
    // Solo permitir hacer clic si no está lleno o si el usuario ya está inscrito
    if (!this.isFull || this.isEnrolled) {
      this.scheduleClicked.emit(this.schedule);
    }
  }

  handleUnsubscribe(event: Event) {
    event.stopPropagation();
    this.unsubscribeClicked.emit(this.schedule);
  }
}
