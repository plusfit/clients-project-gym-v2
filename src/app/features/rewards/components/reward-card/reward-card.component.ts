import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, giftOutline, starOutline } from 'ionicons/icons';
import { Reward } from '../../interfaces/reward.interface';

@Component({
  selector: 'app-reward-card',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonImg,
    IonIcon,
    IonText,
    IonButton
  ],
  templateUrl: './reward-card.component.html',
  styleUrls: ['./reward-card.component.scss']
})
export class RewardCardComponent {
  @Input() reward!: Reward;
  @Input() userPoints = 0;
  @Input() isExchanging = false;
  @Output() exchange = new EventEmitter<Reward>();

  constructor() {
    addIcons({
      giftOutline,
      starOutline,
      checkmarkCircleOutline,
      closeCircleOutline
    });
  }

  get canExchange(): boolean {
    return this.reward.enabled && this.userPoints >= this.reward.pointsRequired;
  }

  get hasImage(): boolean {
    return !!(this.reward.imageUrl?.trim());
  }

  onExchange() {
    if (this.canExchange && !this.isExchanging) {
      this.exchange.emit(this.reward);
    }
  }

  onImageError(event: Event) {
    // Hide the image if it fails to load
    (event.target as HTMLElement).style.display = 'none';
  }
}
