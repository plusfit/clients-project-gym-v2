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
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-enroll-confirmation-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Confirmar Inscripción</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="content" fullscreen>
      <ion-grid class="card">
        <ion-row class="info-row">
          <ion-col size="4">
            <ion-label class="label-title">Horario:</ion-label>
          </ion-col>
          <ion-col size="8">
            <ion-label class="label-value">
              {{ schedule?.startTime }}:00 - {{ schedule?.endTime }}:00
            </ion-label>
          </ion-col>
        </ion-row>
        <ion-row class="info-row">
          <ion-col size="4">
            <ion-label class="label-title">Día:</ion-label>
          </ion-col>
          <ion-col size="8">
            <ion-label class="label-value">{{ schedule?.day }}</ion-label>
          </ion-col>
        </ion-row>
        <ion-row class="info-row">
          <ion-col size="4">
            <ion-label class="label-title">Cupos:</ion-label>
          </ion-col>
          <ion-col size="8">
            <ion-label class="label-value">{{ schedule?.maxCount }}</ion-label>
          </ion-col>
        </ion-row>
        <ion-row class="info-row">
          <ion-col>
            <p class="confirmation-text">
              ¿Deseas inscribirte en el horario de
              {{ schedule?.startTime }}:00 - {{ schedule?.endTime }}:00 del día
              {{ schedule?.day }}?
            </p>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="footer">
      <ion-toolbar>
        <ion-button expand="full" (click)="confirm.emit()">
          Confirmar
        </ion-button>
        <ion-button expand="full" color="medium" (click)="cancel.emit()">
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
      }

      ion-header {
        flex: 0 0 auto;
      }

      ion-content.content {
        flex: 1 1 auto;
        background-color: #f5f5f5;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 24px;
        overflow: hidden;
      }

      /* Estilo "card" para el grid */
      ion-grid.card {
        background: #ffffff;
        border-radius: 8px;
        padding: 24px;
        width: 100%;
        max-width: 480px;
      }

      ion-row.info-row {
        margin-bottom: 16px;
      }

      ion-label.label-title {
        font-size: 1rem;
        font-weight: 600;
        color: #424242;
      }

      ion-label.label-value {
        font-size: 1rem;
        color: #616161;
      }

      p.confirmation-text {
        font-size: 0.95rem;
        color: #424242;
        margin: 0;
        line-height: 1.5;
      }

      ion-footer.footer {
        flex: 0 0 auto;
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
  ],
})
export class EnrollConfirmationModalComponent {
  @Input() schedule: any;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
