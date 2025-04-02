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

/**
 * Componente modal para confirmar la desinscripción de un horario
 * Responsabilidad única: Presentar la interfaz de confirmación para desinscribirse de un horario
 */
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
    IonFooter,
    IonButton,
    IonIcon,
  ],
})
export class UnsubscribeConfirmationModalComponent {
  /**
   * El horario del que el usuario quiere desinscribirse
   */
  @Input() schedule!: Schedule | null;

  /**
   * Evento emitido cuando el usuario confirma la desinscripción
   */
  @Output() confirm = new EventEmitter<void>();

  /**
   * Evento emitido cuando el usuario cancela la desinscripción
   */
  @Output() cancel = new EventEmitter<void>();
}
