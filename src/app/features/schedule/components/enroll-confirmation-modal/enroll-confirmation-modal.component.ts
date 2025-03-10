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
    <ion-header>
      <ion-toolbar>
        <ion-title>Inscripción</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="content">
        <ion-grid class="card">
          <ion-row class="info-row">
            <ion-col size="4">
              <ion-icon name="time-outline" class="info-icon"></ion-icon>
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
              <ion-icon name="calendar-outline" class="info-icon"></ion-icon>
              <ion-label class="label-title">Día:</ion-label>
            </ion-col>
            <ion-col size="8">
              <ion-label class="label-value">{{ schedule?.day }}</ion-label>
            </ion-col>
          </ion-row>
          <ion-row class="info-row">
            <ion-col size="4">
              <ion-icon name="people-outline" class="info-icon"></ion-icon>
              <ion-label class="label-title">Cupos:</ion-label>
            </ion-col>
            <ion-col size="8">
              <ion-label class="label-value">{{
                schedule?.maxCount
              }}</ion-label>
            </ion-col>
          </ion-row>
          <ion-row class="info-row">
            <ion-col>
              <p class="confirmation-text">
                ¿Deseas inscribirte en el horario de
                <span class="strong"
                  >{{ schedule?.startTime }}:00 - {{ schedule?.endTime }}:00
                </span>
                del día <span class="strong">{{ schedule?.day }}</span
                >?
              </p>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
    <ion-footer class="footer">
      <ion-toolbar>
        <ion-button
          expand="full"
          shape="round"
          size="default"
          (click)="confirm.emit()"
        >
          <ion-icon name="checkmark-outline" slot="start"></ion-icon>
          Confirmar
        </ion-button>
        <ion-button
          expand="full"
          fill="outline"
          size="default"
          shape="round"
          (click)="cancel.emit()"
        >
          <ion-icon name="close-circle-outline" slot="start"></ion-icon>
          Cancelar
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        font-family: 'Inter', sans-serif;
      }
      /* HEADER */
      ion-header {
        background: var(--ion-color-primary, #1565c0);
        --ion-toolbar-background: var(--ion-color-primary, #1565c0);
        color: var(--ion-color-primary-contrast, #ffffff);
      }
      ion-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #f6f7f9;
      }

      /* Card estilo */
      ion-grid.card {
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        width: 100%;
        max-width: 480px;
      }
      ion-row.info-row {
        margin-bottom: 16px;
      }
      ion-label.label-title {
        font-size: 0.8rem;
        font-weight: 500;
        color: #8c8c8c;
        margin-left: 4px;
      }
      ion-label.label-value {
        font-size: 1rem;
        color: #5a6268;
      }
      p.confirmation-text {
        font-size: 1rem;
        color: #7a8288;
        margin-top: 2rem;
        line-height: 1.5;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
        border-radius: 18px;
        padding: 24px;
      }
      .strong {
        color: var(--ion-color-primary, #1565c0);
        font-weight: 600;
      }
      /* FOOTER */
      .footer {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
      }
      ion-footer ion-toolbar {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .info-icon {
        font-size: 1rem;
        margin-right: 8px;
        color: var(--ion-color-primary, #1565c0);
      }
    `,
  ],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonContent,
    IonFooter,
    IonIcon,
  ],
})
export class EnrollConfirmationModalComponent {
  @Input() schedule: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
