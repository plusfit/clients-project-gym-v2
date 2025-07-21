import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import {
  IonContent,
  IonDatetime,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  templateUrl: './ion-datetime-modal-component.html',
  selector: 'ion-datetime-modal',
  providers: [ModalController],
  imports: [IonContent, IonDatetime],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
 	styles: [
		`
      .sheet-content {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding-bottom: env(safe-area-inset-bottom);
      }

      .datetime-wrapper {
        max-width: 340px;
        width: 100%;
      }

      ion-content.calendar-content {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }

      .calendar-container {
        width: 100%;
        max-width: 420px;
        min-height: 420px;
        padding: 16px;
        background: var(--ion-background-color, #ffffff);
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      ion-datetime {
        width: 100%;
        margin: 0 auto;
        --background: transparent;
        --wheel-highlight-background: var(--ion-color-primary);
        --wheel-fade-background-rgb: var(--ion-color-primary);
      }

      :host ::ng-deep ion-datetime .picker-highlight {
        background: none !important;
        background-color: transparent !important;
      }

      :host ::ng-deep ion-datetime .wheel-highlight-background {
        background: none !important;
        background-color: transparent !important;
      }

      :host ::ng-deep ion-datetime .wheel-item.wheel-item-active {
        background: none !important;
        background-color: transparent !important;
      }

      :host ::ng-deep ion-buttons {
        padding: 8px 16px;
        justify-content: flex-end;
        gap: 8px;
      }

      :host ::ng-deep ion-button {
        --border-radius: 8px;
        --padding-start: 16px;
        --padding-end: 16px;
        --padding-top: 8px;
        --padding-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        text-transform: none;
        letter-spacing: 0.025em;
      }

      :host ::ng-deep ion-button[fill="clear"] {
        --color: var(--ion-color-medium);
        --color-hover: var(--ion-color-medium-shade);
      }

      :host ::ng-deep ion-button[fill="outline"] {
        --border-width: 1px;
        --border-color: var(--ion-color-primary-tint);
        --color: var(--ion-color-primary);
        --background-hover: var(--ion-color-primary-tint);
        --color-hover: var(--ion-color-primary-shade);
      }
    `,
	],
})
export class IonDatetimeModalComponent {
  @Input() value: string | null = null;
  @Input() max: string | null = null;
  min = '1950-01-01';

  constructor(private modalCtrl: ModalController) {}

  handleChange(event: any) {
    const selected = event.detail.value;
    this.modalCtrl.dismiss(selected);
  }
}
