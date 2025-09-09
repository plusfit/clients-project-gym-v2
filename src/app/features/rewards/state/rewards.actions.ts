import { Reward } from '../interfaces/reward.interface';

// Load actions
export class LoadRewards {
  static readonly type = '[Rewards] Load Rewards';
}

export class LoadRewardById {
  static readonly type = '[Rewards] Load Reward By Id';
  constructor(public id: string) {}
}

export class LoadRewardsWithFilters {
  static readonly type = '[Rewards] Load Rewards With Filters';
  constructor(public filters: {
    search?: string;
    enabled?: boolean;
    page?: number;
    limit?: number;
  }) {}
}

// Exchange actions
export class ExchangeReward {
  static readonly type = '[Rewards] Exchange Reward';
  constructor(public rewardId: string, public clientId: string) {}
}

// Set actions
export class SetRewards {
  static readonly type = '[Rewards] Set Rewards';
  constructor(public rewards: Reward[]) {}
}

export class SetSelectedReward {
  static readonly type = '[Rewards] Set Selected Reward';
  constructor(public reward: Reward | null) {}
}

export class SetLoading {
  static readonly type = '[Rewards] Set Loading';
  constructor(public loading: boolean) {}
}

export class SetError {
  static readonly type = '[Rewards] Set Error';
  constructor(public error: string | null) {}
}

export class ClearRewards {
  static readonly type = '[Rewards] Clear Rewards';
}

export class ClearSelectedReward {
  static readonly type = '[Rewards] Clear Selected Reward';
}
