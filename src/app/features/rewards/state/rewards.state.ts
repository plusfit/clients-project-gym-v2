import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Reward, RewardResponse } from '../interfaces/reward.interface';
import { RewardsService } from '../services/rewards.service';
import {
  ClearRewards,
  ClearSelectedReward,
  ExchangeReward,
  LoadRewardById,
  LoadRewards,
  LoadRewardsWithFilters,
  SetError,
  SetLoading,
  SetRewards,
  SetSelectedReward
} from './rewards.actions';

export interface RewardsStateModel {
  rewards: Reward[];
  selectedReward: Reward | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  } | null;
}

@Injectable()
@State<RewardsStateModel>({
  name: 'rewards',
  defaults: {
    rewards: [],
    selectedReward: null,
    loading: false,
    error: null,
    pagination: null
  }
})
export class RewardsState {
  constructor(private rewardsService: RewardsService) {}

  // Selectors
  @Selector()
  static getRewards(state: RewardsStateModel): Reward[] {
    return state.rewards;
  }

  @Selector()
  static getSelectedReward(state: RewardsStateModel): Reward | null {
    return state.selectedReward;
  }

  @Selector()
  static isLoading(state: RewardsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static getError(state: RewardsStateModel): string | null {
    return state.error;
  }

  @Selector()
  static getPagination(state: RewardsStateModel) {
    return state.pagination;
  }

  @Selector()
  static getEnabledRewards(state: RewardsStateModel): Reward[] {
    return state.rewards.filter(reward => reward.enabled);
  }

  // Actions
  @Action(LoadRewards)
  loadRewards(ctx: StateContext<RewardsStateModel>) {
    ctx.patchState({ loading: true, error: null });
    
    return this.rewardsService.getAllRewards().pipe(
      tap((rewards) => {
        ctx.patchState({
          rewards,
          loading: false
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error al cargar los rewards'
        });
        return of(error);
      })
    );
  }

  @Action(LoadRewardsWithFilters)
  loadRewardsWithFilters(ctx: StateContext<RewardsStateModel>, action: LoadRewardsWithFilters) {
    ctx.patchState({ loading: true, error: null });
    
    return this.rewardsService.getRewards(action.filters).pipe(
      tap((response: RewardResponse) => {
        if (response.success && response.data.success) {
          ctx.patchState({
            rewards: response.data.data,
            pagination: response.data.pagination,
            loading: false
          });
        } else {
          ctx.patchState({
            rewards: [],
            pagination: null,
            loading: false,
            error: 'Error al cargar los rewards'
          });
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error al cargar los rewards'
        });
        return of(error);
      })
    );
  }

  @Action(LoadRewardById)
  loadRewardById(ctx: StateContext<RewardsStateModel>, action: LoadRewardById) {
    ctx.patchState({ loading: true, error: null });
    
    return this.rewardsService.getRewardById(action.id).pipe(
      tap((reward) => {
        ctx.patchState({
          selectedReward: reward,
          loading: false
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error al cargar el reward'
        });
        return of(error);
      })
    );
  }

  @Action(ExchangeReward)
  exchangeReward(ctx: StateContext<RewardsStateModel>, action: ExchangeReward) {
    ctx.patchState({ loading: true, error: null });

    return this.rewardsService.exchangeReward(action.rewardId, action.clientId).pipe(
      tap((result) => {
        ctx.patchState({
          loading: false
        });
        // Optionally update reward exchange count or user points here
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message || 'Error al intercambiar el reward'
        });
        return of(error);
      })
    );
  }

  @Action(SetRewards)
  setRewards(ctx: StateContext<RewardsStateModel>, action: SetRewards) {
    ctx.patchState({ rewards: action.rewards });
  }

  @Action(SetSelectedReward)
  setSelectedReward(ctx: StateContext<RewardsStateModel>, action: SetSelectedReward) {
    ctx.patchState({ selectedReward: action.reward });
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<RewardsStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.loading });
  }

  @Action(SetError)
  setError(ctx: StateContext<RewardsStateModel>, action: SetError) {
    ctx.patchState({ error: action.error });
  }

  @Action(ClearRewards)
  clearRewards(ctx: StateContext<RewardsStateModel>) {
    ctx.patchState({ 
      rewards: [],
      pagination: null
    });
  }

  @Action(ClearSelectedReward)
  clearSelectedReward(ctx: StateContext<RewardsStateModel>) {
    ctx.patchState({ selectedReward: null });
  }
}
