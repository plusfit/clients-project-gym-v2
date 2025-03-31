import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  calendarOutline,
  peopleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { Schedule } from '../../models/schedule.model';

@Component({
  selector: 'app-enroll-confirmation-modal',
  templateUrl: './enroll-confirmation-modal.component.html',
  styleUrls: ['./enroll-confirmation-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class EnrollConfirmationModalComponent {
  @Input() schedule!: Schedule;

  constructor() {
    addIcons({
      timeOutline,
      calendarOutline,
      peopleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
    });
  }
}
