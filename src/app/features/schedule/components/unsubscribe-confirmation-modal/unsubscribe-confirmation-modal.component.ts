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
    <ion-header>
      <ion-toolbar>
        <ion-title>Confirmar Desinscripción</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="modal-content" fullscreen>
      <div class="modal-body">
        <p>¿Estás seguro que deseas desinscribirte de este horario?</p>
      </div>
    </ion-content>
    <ion-footer>
      <ion-toolbar class="footer-toolbar">
        <ion-button expand="full" color="danger" (click)="confirm.emit()">
          <ion-icon name="trash-outline" slot="start"></ion-icon>
          Desinscribirme
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
        display: block;
        font-family: 'Inter', sans-serif;
      }
      ion-header {
        background-color: var(--ion-color-danger);
        --ion-toolbar-background: var(--ion-color-danger);
        color: var(--ion-color-danger-contrast, #ffffff);
      }
      ion-title {
        font-size: 1.5rem;
        font-weight: 600;
      }
      .modal-content {
        padding: 24px;
        background-color: var(--ion-color-light);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .modal-body {
        text-align: center;
        font-size: 1.2rem;
        color: var(--ion-color-dark);
      }
      ion-footer {
        background-color: var(--ion-color-light);
        padding: 16px;
      }
      .footer-toolbar {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      ion-button {
        --border-radius: 8px;
        font-weight: 600;
        text-transform: uppercase;
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
  @Input() schedule!: Schedule | null; // o el identificador del horario
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
