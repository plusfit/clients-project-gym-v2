import { Component } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { OnboardingStep3Component } from '../onboarding.step3/onboarding-step3.component';

@Component({
  selector: 'app-onboarding-step2',
  templateUrl: './onboarding-step2.component.html',
  standalone: true,
})
export class OnboardingStep2Component {
  constructor(private nav: IonNav) {}

  nextStep() {
    this.nav.push(OnboardingStep3Component);
  }
}
