import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    IonButton,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonLabel,
    IonSearchbar,
    IonSpinner,
    IonText
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
import { AuthState } from '../../auth/state/auth.state';
import { RewardCardComponent } from '../components/reward-card/reward-card.component';
import { Reward } from '../interfaces/reward.interface';
import { ExchangeReward, LoadRewards } from '../state/rewards.actions';
import { RewardsState } from '../state/rewards.state';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppHeaderComponent,
    RewardCardComponent,
    IonContent,
    IonSpinner,
    IonText,
    IonIcon,
    IonButton,
    IonSearchbar,
    IonChip,
    IonLabel,
    IonFab,
    IonFabButton
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
  isLoading = false;
  error: string | null = null;
  userPoints = 0;
  exchangingRewardId: string | null = null;
  
  // Filters
  searchTerm = '';
  showOnlyAvailable = false;
  showOnlyAffordable = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private toastService: ToastService
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

    // Subscribe to user data to get points
    this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        // Assuming user has a points field, adjust according to your User interface
        this.userPoints = (user as User & { points?: number }).points || 0;
        this.applyFilters();
      }
    });
  }

  loadRewards() {
    this.store.dispatch(new LoadRewards());
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

    this.exchangingRewardId = reward._id;

    try {
      await this.store.dispatch(new ExchangeReward(reward._id, user._id)).toPromise();
      
      await this.toastService.showToast(
        `¡Premio "${reward.name}" canjeado exitosamente!`,
        'success'
      );

      // Reload rewards and user data to reflect changes
      this.loadRewards();
      
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

  trackByRewardId(index: number, reward: Reward): string {
    return reward._id;
  }
}
