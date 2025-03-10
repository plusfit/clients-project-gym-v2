import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonButton,
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
        <ion-card-title>
          <div class="title">
            <span
              ><ion-icon name="time-outline" class="time-icon"></ion-icon>
              {{ schedule.startTime }}:00 - {{ schedule.endTime }}:00</span
            >
            <ion-icon
              *ngIf="isEnrolled"
              name="trash-outline"
              class="trash-icon"
            ></ion-icon>
          </div>
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p>
          <ion-icon name="people-outline" class="people-icon"></ion-icon>
          Plazas: {{ schedule.clients.length }} / {{ schedule.maxCount }}
        </p>
        <ng-container *ngIf="isEnrolled">
          <p>
            <ion-icon
              name="checkmark-circle-outline"
              class="enrolled-icon"
            ></ion-icon>
            Ya inscrito
            <ion-button
              fill="clear"
              class="unsubscribe-button"
              (click)="handleUnsubscribe($event)"
            >
            </ion-button>
          </p>
        </ng-container>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      ion-card {
        margin: 12px;
        padding: 8px;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }
      ion-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }
      ion-card.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      ion-card.enrolled {
        border: 2px solid var(--ion-color-success);
      }
      ion-card-header {
        padding: 8px 12px;
      }
      ion-card-title {
        font-size: 1.2rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        color: var(--ion-color-primary);
      }
      .time-icon {
        margin-right: 8px;
        font-size: 1.3rem;
        color: var(--ion-color-primary);
      }
      ion-card-content {
        padding: 8px 12px;
        font-size: 1rem;
        color: var(--ion-color-dark);
      }
      ion-card-content p {
        margin: 8px 0;
        display: flex;
        align-items: center;
      }
      .people-icon {
        margin-right: 6px;
        font-size: 1.2rem;
        color: #8c8c8c;
      }
      .enrolled-icon {
        margin-right: 6px;
        font-size: 1.2rem;
        color: var(--ion-color-success);
      }
      .unsubscribe-button {
        --padding-start: 0;
        --padding-end: 0;
        --min-width: 0;
        margin-left: 8px;
      }
      .title {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
      .trash-icon {
        color: #5a6268;
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
    IonButton,
    CommonModule,
  ],
})
export class ScheduleCardComponent {
  @Input() schedule!: Schedule;
  @Input() currentUserId!: string;
  @Output() scheduleClicked = new EventEmitter<Schedule>();
  @Output() unsubscribeClicked = new EventEmitter<Schedule>();

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

  handleUnsubscribe(event: Event) {
    event.stopPropagation();
    this.unsubscribeClicked.emit(this.schedule);
  }
}
