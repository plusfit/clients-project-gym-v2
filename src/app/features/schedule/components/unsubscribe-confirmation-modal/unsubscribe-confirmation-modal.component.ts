import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Schedule } from '@feature/schedule/state/schedule.state';

@Component({
  selector: 'app-unsubscribe-confirmation-modal',
  templateUrl: './unsubscribe-confirmation-modal.component.html',
  styleUrls: ['./unsubscribe-confirmation-modal.component.scss'],
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
  ],
})
export class UnsubscribeConfirmationModalComponent {
  @Input() schedule!: Schedule | null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
