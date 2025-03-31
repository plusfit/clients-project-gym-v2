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
  template: `
    <ion-header class="modal-header">
      <ion-toolbar>
        <ion-title>Confirmar Desinscripción</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="modal-content" fullscreen>
      <div class="content-container">
        <div class="warning-card">
          <div class="warning-icon-container">
            <ion-icon
              name="alert-circle-outline"
              class="warning-icon"
            ></ion-icon>
          </div>
          <h2 class="warning-title">¿Estás seguro?</h2>
          <p class="warning-text">
            Estás a punto de desinscribirte del horario de
            <span class="highlight"
              >{{ schedule?.startTime }}:00 - {{ schedule?.endTime }}:00</span
            >
            del día <span class="highlight">{{ schedule?.day }}</span
            >.
          </p>
          <p class="warning-subtext">
            Al desinscribirte liberarás tu cupo para que otro usuario pueda
            aprovecharlo.
          </p>
        </div>
      </div>
    </ion-content>
    <ion-footer class="modal-footer">
      <ion-toolbar>
        <div class="button-container">
          <ion-button
            expand="block"
            color="danger"
            class="unsubscribe-button"
            (click)="confirm.emit()"
          >
            <ion-icon
              name="trash-outline"
              slot="start"
              class="unsubscribe-icon"
            ></ion-icon>
            Confirmar Desinscripción
          </ion-button>
          <ion-button
            expand="block"
            fill="outline"
            class="cancel-button"
            (click)="cancel.emit()"
          >
            <ion-icon
              name="chevron-back-outline"
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
        display: block;
        font-family: 'Inter', sans-serif;
        --background: var(--ion-color-dark);
      }

      /* HEADER - Usando los estilos globales */
      .modal-header ion-toolbar {
        --background: linear-gradient(
          135deg,
          var(--ion-color-danger-shade) 0%,
          var(--ion-color-danger) 100%
        );
      }

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
        padding: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100%;
      }

      /* Warning Card */
      .warning-card {
        background: rgba(30, 30, 30, 0.7);
        border-radius: 16px;
        padding: 30px 24px;
        width: 100%;
        max-width: 480px;
        text-align: center;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(var(--ion-color-danger-rgb), 0.3);
      }

      .warning-icon-container {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(var(--ion-color-danger-rgb), 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
      }

      .warning-icon {
        font-size: 48px;
        color: var(--ion-color-danger);
      }

      .warning-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        margin: 0 0 20px;
        font-family: 'APEXPRO', sans-serif;
        letter-spacing: 0.5px;
      }

      .warning-text {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
        margin: 0 0 16px;
      }

      .warning-subtext {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.5;
        margin: 0;
        padding: 12px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
      }

      .highlight {
        color: var(--ion-color-danger-tint);
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

      .unsubscribe-button {
        --background: linear-gradient(
          135deg,
          var(--ion-color-danger-shade) 0%,
          var(--ion-color-danger) 100%
        );
        --border-radius: 10px;
        --box-shadow: 0 4px 10px rgba(var(--ion-color-danger-rgb), 0.3);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
      }

      .unsubscribe-icon {
        color: white; /* Icono blanco para el botón rojo */
      }

      .cancel-button {
        --border-radius: 10px;
        --border-color: rgba(255, 255, 255, 0.2);
        --color: white;
        font-weight: 500;
        margin: 0;
      }

      .cancel-icon {
        color: var(--ion-color-danger); /* Icono rojo para el botón blanco */
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
    IonIcon,
  ],
})
export class UnsubscribeConfirmationModalComponent {
  @Input() schedule!: Schedule | null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
