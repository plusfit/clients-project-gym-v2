import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
    IonIcon,
    IonText
} from '@ionic/angular/standalone';
import { ExchangeStatus } from '@shared/enums/exchange-status.enum';
import { addIcons } from 'ionicons';
import {
    checkmarkCircleOutline,
    giftOutline,
    lockClosedOutline,
    starOutline,
    trophyOutline
} from 'ionicons/icons';
import { Exchange } from '../../interfaces/exchange.interface';
import { Reward } from '../../interfaces/reward.interface';

export interface RewardState {
  reward: Reward;
  status: 'available' | 'exchanged' | 'pending' | 'locked';
  position: number; // Posición en porcentaje (0-100)
}

@Component({
  selector: 'app-rewards-timeline',
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonText
  ],
  templateUrl: './rewards-timeline.component.html',
  styleUrls: ['./rewards-timeline.component.scss']
})
export class RewardsTimelineComponent implements OnChanges {
  @Input() rewards: Reward[] = [];
  @Input() userPoints = 0;
  @Input() exchanges: Exchange[] = [];
  @Output() rewardClick = new EventEmitter<Reward>();

  rewardStates: RewardState[] = [];
  maxPoints = 0;
  progressPercentage = 0;
  
  // Make Math available in template
  Math = Math;

  constructor() {
    addIcons({
      giftOutline,
      starOutline,
      checkmarkCircleOutline,
      lockClosedOutline,
      trophyOutline
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rewards'] || changes['userPoints'] || changes['exchanges']) {
      // Ensure exchanges is always an array
      if (!Array.isArray(this.exchanges)) {
        this.exchanges = [];
      }
      this.calculateRewardStates();
    }
  }

  private calculateRewardStates() {
    // Filtrar solo premios habilitados (no deshabilitados)
    const enabledRewards = this.rewards.filter(reward => !reward.disabled);
    
    if (enabledRewards.length === 0) {
      this.rewardStates = [];
      this.maxPoints = 0;
      this.progressPercentage = 0;
      return;
    }

    // Calcular el máximo de puntos basado en el premio habilitado con más puntaje
    this.maxPoints = Math.max(...enabledRewards.map(r => r.pointsRequired));
    
    // Si el usuario tiene más puntos que el premio más alto, ajustar el rango
    // para que el timeline sea más útil visualmente
    const effectiveMaxPoints = Math.max(this.maxPoints, this.userPoints);
    
    // Calcular el porcentaje de progreso del usuario
    this.progressPercentage = Math.min((this.userPoints / effectiveMaxPoints) * 100, 100);

    // Crear estados de premios ordenados por puntos requeridos
    this.rewardStates = enabledRewards
      .sort((a, b) => a.pointsRequired - b.pointsRequired)
      .map(reward => ({
        reward,
        status: this.getRewardStatus(reward),
        position: (reward.pointsRequired / effectiveMaxPoints) * 100
      }));

    // Actualizar maxPoints para mostrar el rango efectivo
    this.maxPoints = effectiveMaxPoints;
  }

  private getRewardStatus(reward: Reward): 'available' | 'exchanged' | 'pending' | 'locked' {
    if (Array.isArray(this.exchanges)) {
      // Buscar exchanges para este reward
      const rewardExchanges = this.exchanges.filter(exchange => exchange.rewardId === reward.id);
      
      // Verificar si hay exchange pendiente
      const pendingExchange = rewardExchanges.find(exchange => exchange.status === ExchangeStatus.PENDING);
      if (pendingExchange) {
        return 'pending';
      }

      // Verificar si hay exchange completado
      const completedExchange = rewardExchanges.find(exchange => exchange.status === ExchangeStatus.COMPLETED);
      if (completedExchange) {
        return 'exchanged';
      }
    } else {
      console.warn('⚠️ Exchanges is not an array:', this.exchanges);
    }
    
    // Verificar si tiene puntos suficientes
    if (this.userPoints >= reward.pointsRequired) {
        return 'available';
    }    
    return 'locked';
  }

  onRewardClick(rewardState: RewardState, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.rewardClick.emit(rewardState.reward);
  }

  getRewardIcon(status: 'available' | 'exchanged' | 'pending' | 'locked'): string {
    switch (status) {
      case 'available':
        return 'gift-outline';
      case 'exchanged':
        return 'trophy-outline';
      case 'pending':
        return 'checkmark-circle-outline';
      case 'locked':
        return 'lock-closed-outline';
      default:
        return 'gift-outline';
    }
  }

  getStatusText(status: 'available' | 'exchanged' | 'pending' | 'locked'): string {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'exchanged':
        return 'Canjeado';
      case 'pending':
        return 'Pendiente';
      case 'locked':
        return 'Bloqueado';
      default:
        return '';
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLElement).style.display = 'none';
  }

  trackByRewardId(index: number, rewardState: RewardState): string {
    return rewardState.reward.id;
  }
}
