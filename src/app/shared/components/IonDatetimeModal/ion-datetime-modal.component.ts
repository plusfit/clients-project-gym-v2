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
        padding-bottom: 16px;
        background: var(--ion-background-color, #1e1e1e);
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      ion-datetime {
        width: 100%;
        margin: 0 auto;
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
