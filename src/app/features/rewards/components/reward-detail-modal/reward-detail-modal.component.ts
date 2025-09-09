import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonText,
    IonTitle,
    IonToolbar,
    ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    checkmarkCircleOutline,
    closeOutline,
    giftOutline,
    lockClosedOutline,
    starOutline,
    trophyOutline
} from 'ionicons/icons';
import { Reward } from '../../interfaces/reward.interface';

export interface RewardDetailData {
  reward: Reward;
  userPoints: number;
  status: 'available' | 'exchanged' | 'locked';
}

@Component({
  selector: 'app-reward-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonImg,
    IonText
  ],
  templateUrl: './reward-detail-modal.component.html',
  styleUrls: ['./reward-detail-modal.component.scss']
})
export class RewardDetailModalComponent {
  @Input() data!: RewardDetailData;

  constructor(private modalController: ModalController) {
    addIcons({
      closeOutline,
      giftOutline,
      starOutline,
      checkmarkCircleOutline,
      lockClosedOutline,
      trophyOutline
    });
  }

  get reward(): Reward {
    return this.data.reward;
  }

  get userPoints(): number {
    return this.data.userPoints;
  }

  get status(): 'available' | 'exchanged' | 'locked' {
    return this.data.status;
  }

  get hasImage(): boolean {
    return !!(this.reward.imageUrl?.trim());
  }

  get statusInfo() {
    switch (this.status) {
      case 'available':
        return {
          text: 'Disponible para canjear',
          icon: 'gift-outline',
          color: 'success'
        };
      case 'exchanged':
        return {
          text: 'Ya canjeado',
          icon: 'trophy-outline',
          color: 'warning'
        };
      case 'locked':
        return {
          text: 'Puntos insuficientes',
          icon: 'lock-closed-outline',
          color: 'medium'
        };
      default:
        return {
          text: '',
          icon: 'gift-outline',
          color: 'medium'
        };
    }
  }

  get pointsNeeded(): number {
    return Math.max(0, this.reward.pointsRequired - this.userPoints);
  }

  get progressPercentage(): number {
    return Math.min((this.userPoints / this.reward.pointsRequired) * 100, 100);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  onExchange() {
    if (this.status === 'available') {
      this.modalController.dismiss({
        action: 'exchange',
        reward: this.reward
      });
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLElement).style.display = 'none';
  }
}
