import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  templateUrl: './ion-datetime-modal-component.html',
  selector: 'ion-datetime-modal',
  imports: [IonicModule],
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
        max-width: 360px;
        min-height: 420px;
        padding-bottom: 16px;
        background: var(--ion-background-color, #1e1e1e);
        border-radius: 16px;
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
