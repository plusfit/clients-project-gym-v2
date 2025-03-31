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

@Component({
  selector: 'app-enroll-confirmation-modal',
  template: `
    <ion-header class="modal-header">
      <ion-toolbar>
        <ion-title>Inscripción</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen class="modal-content">
      <div class="content-container">
        <ion-grid class="info-card">
          <ion-row class="info-row">
            <ion-col size="4">
              <div class="icon-container">
                <ion-icon name="time-outline" class="info-icon"></ion-icon>
              </div>
              <ion-label class="label-title">Hora:</ion-label>
            </ion-col>
            <ion-col size="8">
              <ion-label class="label-value">
                {{ schedule?.startTime }}:00 - {{ schedule?.endTime }}:00
              </ion-label>
            </ion-col>
          </ion-row>
          <ion-row class="info-row">
            <ion-col size="4">
              <div class="icon-container">
                <ion-icon name="calendar-outline" class="info-icon"></ion-icon>
              </div>
              <ion-label class="label-title">Día:</ion-label>
            </ion-col>
            <ion-col size="8">
              <ion-label class="label-value">{{ schedule?.day }}</ion-label>
            </ion-col>
          </ion-row>
          <ion-row class="info-row">
            <ion-col size="4">
              <div class="icon-container">
                <ion-icon name="people-outline" class="info-icon"></ion-icon>
              </div>
              <ion-label class="label-title">Cupos:</ion-label>
            </ion-col>
            <ion-col size="8">
              <ion-label class="label-value">
                {{ schedule?.maxCount }}
              </ion-label>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <div class="confirmation-box">
                <p class="confirmation-text">
                  ¿Deseas inscribirte en el horario de
                  <span class="highlight">
                    {{ schedule?.startTime }}:00 - {{ schedule?.endTime }}:00
                  </span>
                  del día <span class="highlight">{{ schedule?.day }}</span
                  >?
                </p>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
    <ion-footer class="modal-footer">
      <ion-toolbar>
        <div class="button-container">
          <ion-button
            expand="block"
            class="confirm-button"
            (click)="confirm.emit()"
          >
            <ion-icon
              name="checkmark-outline"
              slot="start"
              class="confirm-icon"
            ></ion-icon>
            Confirmar
          </ion-button>
          <ion-button
            expand="block"
            fill="outline"
            class="cancel-button"
            (click)="cancel.emit()"
          >
            <ion-icon
              name="close-circle-outline"
              slot="start"
              class="cancel-icon"
            ></ion-icon>
            Cancelar
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        font-family: 'Inter', sans-serif;
        --background: var(--ion-color-dark);
      }

      /* HEADER - Usando los estilos globales */
      .modal-header ion-title {
        text-align: center;
      }

      /* CONTENT */
      .modal-content {
        --background: linear-gradient(
          180deg,
          var(--ion-color-dark) 0%,
          #1a1a1a 100%
        );
      }

      .content-container {
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100%;
      }

      /* Info Card */
      .info-card {
        background: rgba(30, 30, 30, 0.7);
        border-radius: 16px;
        padding: 24px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .info-row {
        margin-bottom: 20px;
        display: flex;
        align-items: center;
      }

      .icon-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(var(--ion-color-primary-rgb), 0.15);
        margin-right: 10px;
      }

      .info-icon {
        font-size: 1.2rem;
        color: var(--ion-color-primary);
      }

      .label-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--ion-color-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 8px;
        display: block;
      }

      .label-value {
        font-size: 1.1rem;
        color: white;
        font-weight: 500;
      }

      .confirmation-box {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 20px;
        margin-top: 10px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        border-left: 3px solid var(--ion-color-primary);
      }

      .confirmation-text {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
        line-height: 1.5;
        margin: 0;
      }

      .highlight {
        color: var(--ion-color-primary);
        font-weight: 600;
      }

      /* FOOTER */
      .modal-footer {
        background-color: rgba(18, 18, 18, 0.9);
        border-top: 1px solid rgba(255, 255, 255, 0.1);

        ion-toolbar {
          --background: transparent;
          --border-color: transparent;
          padding: 10px 16px;
        }
      }

      .button-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .confirm-button {
        --background: linear-gradient(
          135deg,
          var(--ion-color-primary-shade) 0%,
          var(--ion-color-primary) 100%
        );
        --border-radius: 10px;
        --box-shadow: 0 4px 10px rgba(var(--ion-color-primary-rgb), 0.3);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
      }

      .confirm-icon {
        color: white; /* Icono blanco para el botón azul */
      }

      .cancel-button {
        --border-radius: 10px;
        --border-color: rgba(255, 255, 255, 0.2);
        --color: white;
        font-weight: 500;
        margin: 0;
      }

      .cancel-icon {
        color: var(--ion-color-primary); /* Icono azul para el botón blanco */
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
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
  ],
})
export class EnrollConfirmationModalComponent {
  @Input() schedule: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
