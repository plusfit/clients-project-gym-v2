import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
    IonIcon,
    IonText
} from '@ionic/angular/standalone';
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
  status: 'available' | 'exchanged' | 'locked';
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
    // Filtrar solo premios habilitados
    const enabledRewards = this.rewards.filter(reward => reward.enabled);
    
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

  private getRewardStatus(reward: Reward): 'available' | 'exchanged' | 'locked' {
    // Verificar si ya fue canjeado - con guard defensivo
    const isExchanged = Array.isArray(this.exchanges) && this.exchanges.some(exchange =>
      exchange.rewardId === reward.id && exchange.status === 'completed'
    );
    
    if (isExchanged) {
      return 'exchanged';
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

  getRewardIcon(status: 'available' | 'exchanged' | 'locked'): string {
    switch (status) {
      case 'available':
        return 'gift-outline';
      case 'exchanged':
        return 'trophy-outline';
      case 'locked':
        return 'lock-closed-outline';
      default:
        return 'gift-outline';
    }
  }

  getStatusText(status: 'available' | 'exchanged' | 'locked'): string {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'exchanged':
        return 'Canjeado';
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
