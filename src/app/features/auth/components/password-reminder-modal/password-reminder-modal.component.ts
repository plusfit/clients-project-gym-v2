import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, lockClosedOutline, warningOutline } from 'ionicons/icons';

/**
 * Componente modal para recordar al usuario que anote su contraseña
 * Responsabilidad única: Mostrar mensaje de advertencia sobre la contraseña después del registro
 */
@Component({
  selector: 'app-password-reminder-modal',
  templateUrl: './password-reminder-modal.component.html',
  styleUrls: ['./password-reminder-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonFooter,
    IonButton,
    IonIcon,
    IonContent,
  ],
})
export class PasswordReminderModalComponent {
  /**
   * La contraseña que el usuario ingresó (opcional, para mostrarla)
   */
  @Input() password?: string;

  /**
   * Evento emitido cuando el usuario confirma que anotó la contraseña
   */
  @Output() confirm = new EventEmitter<void>();

  constructor() {
    addIcons({warningOutline,lockClosedOutline,checkmarkCircleOutline});
  }

  onConfirm() {
    this.confirm.emit();
  }
}