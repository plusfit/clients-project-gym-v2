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
            <span>
              <ion-icon name="time-outline" class="time-icon"></ion-icon>
              {{ schedule.startTime }}:00 - {{ schedule.endTime }}:00
            </span>
            <ion-icon
              *ngIf="isEnrolled"
              name="trash-outline"
              class="trash-icon"
            ></ion-icon>
          </div>
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div class="enrollment-info">
          <div class="enrollment-status">
            <ion-icon name="people-outline" class="people-icon"></ion-icon>
            <span class="status-text"
              >Plazas: {{ schedule.clients.length }} /
              {{ schedule.maxCount }}</span
            >
          </div>
          <div class="progress-bar">
            <div
              class="progress"
              [style.width.%]="
                (schedule.clients.length / schedule.maxCount) * 100
              "
              [class.almost-full]="
                schedule.clients.length >= schedule.maxCount * 0.7
              "
            ></div>
          </div>
        </div>
        <ng-container *ngIf="isEnrolled">
          <div class="enrolled-status">
            <ion-icon
              name="checkmark-circle-outline"
              class="enrolled-icon"
            ></ion-icon>
            <span>Ya inscrito</span>
          </div>
        </ng-container>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      ion-card {
        margin: 0 0 12px 0;
        padding: 0;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
        background: rgba(30, 30, 30, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }

      ion-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
        background: rgba(40, 40, 40, 0.8);
      }

      ion-card.disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      ion-card.enrolled {
        border: 2px solid var(--ion-color-primary);
        box-shadow: 0 8px 16px rgba(var(--ion-color-primary-rgb), 0.2);

        &:hover {
          box-shadow: 0 12px 20px rgba(var(--ion-color-primary-rgb), 0.3);
        }
      }

      ion-card-header {
        background: linear-gradient(
          135deg,
          var(--ion-color-primary-shade) 0%,
          var(--ion-color-primary) 100%
        );
        padding: 16px;
        position: relative;
      }

      ion-card-title {
        font-size: 1.2rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        color: white;
        font-family: 'APEXPRO', sans-serif;
        letter-spacing: 0.5px;
      }

      .time-icon {
        margin-right: 8px;
        font-size: 1.3rem;
        color: white;
      }

      ion-card-content {
        padding: 16px;
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.9);
        background-color: var(--ion-card-background);
      }

      .title {
        display: flex;
        justify-content: space-between;
        width: 100%;
        align-items: center;
      }

      .trash-icon {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.2rem;
      }

      .enrollment-info {
        margin-bottom: 12px;
      }

      .enrollment-status {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .people-icon {
        margin-right: 8px;
        font-size: 1.2rem;
        color: var(--ion-color-secondary);
      }

      .status-text {
        color: rgba(255, 255, 255, 0.85);
        font-weight: 500;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
      }

      .progress {
        height: 100%;
        background-color: var(--ion-color-primary);
        border-radius: 3px;
        transition: width 0.3s ease;

        &.almost-full {
          background-color: var(--ion-color-secondary);
        }
      }

      .enrolled-status {
        display: flex;
        align-items: center;
        margin-top: 12px;
        padding: 8px 12px;
        background-color: rgba(var(--ion-color-primary-rgb), 0.15);
        border-radius: 8px;
        border-left: 3px solid var(--ion-color-primary);
      }

      .enrolled-icon {
        margin-right: 8px;
        font-size: 1.2rem;
        color: var(--ion-color-primary);
      }

      .unsubscribe-button {
        --padding-start: 0;
        --padding-end: 0;
        --min-width: 0;
        margin-left: auto;
        --color: var(--ion-color-primary);
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
