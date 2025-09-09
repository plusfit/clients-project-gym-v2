import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    IonButton,
    IonContent,
    IonIcon,
    IonSpinner,
    IonText,
    ModalController
} from '@ionic/angular/standalone';
import { Select, Store } from '@ngxs/store';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { ToastService } from '@shared/services/toast.service';
import { addIcons } from 'ionicons';
import {
    alertCircleOutline,
    checkmarkCircleOutline,
    giftOutline,
    refreshOutline,
    searchOutline,
    star,
    starOutline
} from 'ionicons/icons';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../auth/interfaces/user.interface';
import { GetCurrentUser } from '../../auth/state/auth.actions';
import { AuthState } from '../../auth/state/auth.state';
import { RewardDetailData, RewardDetailModalComponent } from '../components/reward-detail-modal/reward-detail-modal.component';
import { RewardsTimelineComponent } from '../components/rewards-timeline/rewards-timeline.component';
import { Exchange } from '../interfaces/exchange.interface';
import { Reward } from '../interfaces/reward.interface';
import { RewardsService } from '../services/rewards.service';
import { ExchangeReward, LoadRewards } from '../state/rewards.actions';
import { RewardsState } from '../state/rewards.state';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppHeaderComponent,
    RewardsTimelineComponent,
    IonContent,
    IonSpinner,
    IonText,
    IonIcon,
    IonButton
  ],
  templateUrl: './rewards.page.html',
  styleUrls: ['./rewards.page.scss']
})
export class RewardsPage implements OnInit, OnDestroy {
  @Select(RewardsState.getRewards) rewards$!: Observable<Reward[]>;
  @Select(RewardsState.isLoading) isLoading$!: Observable<boolean>;
  @Select(RewardsState.getError) error$!: Observable<string | null>;
  @Select(AuthState.getUser) user$!: Observable<User | null>;

  rewards: Reward[] = [];
  filteredRewards: Reward[] = [];
  exchanges: Exchange[] = [];
  isLoading = false;
  error: string | null = null;
  userPoints = 0;
  exchangingRewardId: string | null = null;
  
  // View mode
  viewMode: 'timeline' | 'grid' = 'timeline';
  
  // Filters (for grid view)
  searchTerm = '';
  showOnlyAvailable = false;
  showOnlyAffordable = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private toastService: ToastService,
    private rewardsService: RewardsService,
    private modalController: ModalController
  ) {
    addIcons({
      star,
      starOutline,
      giftOutline,
      searchOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      refreshOutline
    });
  }

  ngOnInit() {
    this.setupSubscriptions();
    this.loadRewards();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions() {
    // Subscribe to rewards
    this.rewards$.pipe(takeUntil(this.destroy$)).subscribe(rewards => {
      this.rewards = rewards;
      this.applyFilters();
    });

    // Subscribe to loading state
    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to error state
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      this.error = error;
    });

    // Subscribe to user data to get points and load exchanges
    this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        // Get user points from availablePoints field
        this.userPoints = (user as User & { availablePoints?: number }).availablePoints || 0;
        this.applyFilters();
        
        // Load user exchanges
        this.loadUserExchanges(user._id);
      }
    });
  }

  loadRewards() {
    this.store.dispatch(new LoadRewards());
  }

  private loadUserExchanges(userId: string) {
    this.rewardsService.getClientExchanges(userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (exchanges) => {
        this.exchanges = Array.isArray(exchanges) ? exchanges : [];
      },
      error: (error) => {
        console.error('Error loading user exchanges:', error);
        this.exchanges = []; // Fallback to empty array on error
      }
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  toggleAvailableFilter() {
    this.showOnlyAvailable = !this.showOnlyAvailable;
    this.applyFilters();
  }

  toggleAffordableFilter() {
    this.showOnlyAffordable = !this.showOnlyAffordable;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.showOnlyAvailable = false;
    this.showOnlyAffordable = false;
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.rewards];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(reward => 
        reward.name.toLowerCase().includes(searchLower) ||
        (reward.description?.toLowerCase().includes(searchLower))
      );
    }

    // Apply availability filter
    if (this.showOnlyAvailable) {
      filtered = filtered.filter(reward => reward.enabled);
    }

    // Apply affordable filter
    if (this.showOnlyAffordable) {
      filtered = filtered.filter(reward => 
        reward.enabled && this.userPoints >= reward.pointsRequired
      );
    }

    this.filteredRewards = filtered;
  }

  async onExchangeReward(reward: Reward) {
    if (!reward.enabled || this.userPoints < reward.pointsRequired) {
      await this.toastService.showToast(
        'No puedes canjear este premio en este momento',
        'warning'
      );
      return;
    }

    const user = this.store.selectSnapshot(AuthState.getUser);
    if (!user) {
      await this.toastService.showToast(
        'Debes iniciar sesión para canjear premios',
        'warning'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    // Confirm exchange
    const confirmExchange = await this.showExchangeConfirmation(reward);
    if (!confirmExchange) {
      return;
    }

    console.log('reward', reward);

    // Validate reward ID before proceeding
    if (!reward.id || reward.id.trim() === '') {
      await this.toastService.showToast(
        'Error: ID del premio no válido',
        'error'
      );
      return;
    }

    this.exchangingRewardId = reward.id;

    try {
      await this.store.dispatch(new ExchangeReward(reward.id, user._id)).toPromise();
      
      await this.toastService.showToast(
        `¡Premio "${reward.name}" canjeado exitosamente!`,
        'success'
      );

      // Reload rewards, user data and exchanges to reflect changes
      this.loadRewards();
      this.loadUserExchanges(user._id);
      // Refresh user data to update available points
      this.store.dispatch(new GetCurrentUser());
      
    } catch (error: unknown) {
      await this.toastService.showToast(
        (error as Error).message || 'Error al canjear el premio',
        'error'
      );
    } finally {
      this.exchangingRewardId = null;
    }
  }

  private async showExchangeConfirmation(reward: Reward): Promise<boolean> {
    return new Promise((resolve) => {
      // For now, return true. In a real app, you'd show an alert/modal
      // You can integrate with Ionic AlertController here
      const confirmed = confirm(
        `¿Estás seguro de que quieres canjear "${reward.name}" por ${reward.pointsRequired} puntos?`
      );
      resolve(confirmed);
    });
  }

  async onTimelineRewardClick(reward: Reward) {
    const user = this.store.selectSnapshot(AuthState.getUser);
    if (!user) return;

    // Determine reward status - with defensive guard
    const isExchanged = Array.isArray(this.exchanges) && this.exchanges.some(exchange =>
      exchange.rewardId === reward.id && exchange.status === 'completed'
    );
    
    let status: 'available' | 'exchanged' | 'locked';
    if (isExchanged) {
      status = 'exchanged';
    } else if (this.userPoints >= reward.pointsRequired) {
      status = 'available';
    } else {
      status = 'locked';
    }

    // Open modal with reward details
    const modal = await this.modalController.create({
      component: RewardDetailModalComponent,
      componentProps: {
        data: {
          reward,
          userPoints: this.userPoints,
          status
        } as RewardDetailData
      },
      cssClass: 'reward-detail-modal',
      backdropDismiss: true,
      showBackdrop: true,
      mode: 'md',
      presentingElement: undefined // Ensures modal is at root level
    });

    await modal.present();

    // Handle modal result
    const { data } = await modal.onWillDismiss();
    if (data?.action === 'exchange' && data?.reward) {
      await this.onExchangeReward(data.reward);
    }
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'timeline' ? 'grid' : 'timeline';
  }

  trackByRewardId(index: number, reward: Reward): string {
    return reward.id;
  }
}
