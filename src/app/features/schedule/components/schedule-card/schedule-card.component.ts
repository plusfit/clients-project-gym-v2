import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
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
  template: `
    <ion-card
      [class.disabled]="isFull"
      (click)="handleClick()"
      [class.enrolled]="isEnrolled"
    >
      <ion-card-header>
        <ion-card-title
          >{{ schedule.startTime }}:00 -
          {{ schedule.endTime }}:00</ion-card-title
        >
      </ion-card-header>
      <ion-card-content>
        <p>Plazas: {{ schedule.clients.length }} / {{ schedule.maxCount }}</p>
        <ng-container *ngIf="isEnrolled">
          <p>
            <ion-icon name="checkmark-circle-outline"></ion-icon> Ya inscrito
          </p>
        </ng-container>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      ion-card {
        margin: 10px;
        cursor: pointer;
      }
      ion-card.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      ion-card.enrolled {
        border: 2px solid green;
      }
    `,
  ],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
  ],
})
export class ScheduleCardComponent {
  @Input() schedule!: Schedule;
  @Input() currentUserId!: string;
  @Output() scheduleClicked = new EventEmitter<Schedule>();

  get isFull(): boolean {
    return this.schedule.clients.length >= this.schedule.maxCount;
  }

  get isEnrolled(): boolean {
    return this.schedule.clients.includes(this.currentUserId);
  }

  handleClick() {
    if (!this.isFull) {
      this.scheduleClicked.emit(this.schedule);
    }
  }
}
