import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
    IonIcon,
    ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, giftOutline } from 'ionicons/icons';

@Component({
    selector: 'app-birthday-modal',
    standalone: true,
    imports: [
        CommonModule,
        IonIcon
    ],
    templateUrl: './birthday-modal.component.html',
    styleUrls: ['./birthday-modal.component.scss']
})
export class BirthdayModalComponent {
    @Input() userName: string = '';

    constructor(private modalController: ModalController) {
        addIcons({
            closeOutline,
            giftOutline
        });
    }

    closeModal() {
        this.modalController.dismiss();
    }
}
