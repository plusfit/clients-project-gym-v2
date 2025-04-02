import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Schedule } from '../schedule-card/schedule-card.component';

/**
 * Componente modal para confirmar la inscripción a un horario
 * Responsabilidad única: Presentar la interfaz de confirmación para inscribirse a un horario
 */
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
    IonFooter,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonIcon,
  ],
})
export class EnrollConfirmationModalComponent {
  /**
   * El horario al que el usuario se quiere inscribir
   */
  @Input() schedule!: Schedule | null;

  /**
   * Evento emitido cuando el usuario confirma la inscripción
   */
  @Output() confirm = new EventEmitter<void>();

  /**
   * Evento emitido cuando el usuario cancela la inscripción
   */
  @Output() cancel = new EventEmitter<void>();
}
