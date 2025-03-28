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
