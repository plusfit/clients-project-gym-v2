import { State, Action, StateContext, Selector } from '@ngxs/store';

import { Injectable } from '@angular/core';
import { Step1, Step2, Step3 } from '../interfaces/onboarding.interfaces';
import { OnboardingService } from '../services/onboarding.service';
import { SetStep1, SetStep2, SetStep3 } from './onboarding.actions';

export interface OnBoardingStateModel {
  step1: Step1 | null;
  step2: Step2 | null;
  step3: Step3 | null;
}

@Injectable()
@State<OnBoardingStateModel>({
  name: 'onboarding',
  defaults: {
    step1: null,
    step2: null,
    step3: null,
  },
})
export class UserState {
  constructor(private onboardingService: OnboardingService) {}

  @Action(SetStep1, { cancelUncompleted: true })
  setStep1(ctx: StateContext<OnBoardingStateModel>, action: SetStep1) {
    ctx.patchState({ step1: action.step });
  }

  @Action(SetStep2, { cancelUncompleted: true })
  setStep2(ctx: StateContext<OnBoardingStateModel>, action: SetStep2) {
    ctx.patchState({ step2: action.step });
  }

  @Action(SetStep3, { cancelUncompleted: true })
  setStep3(ctx: StateContext<OnBoardingStateModel>, action: SetStep3) {
    ctx.patchState({ step3: action.step });
  }
}
