import { Component } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { OnboardingStep2Component } from '../onboarding.step2/onboarding-step2.component';

@Component({
  selector: 'app-onboarding-step3',
  templateUrl: './onboarding-step3.component.html',
})
export class OnboardingStep3Component {
  constructor(private nav: IonNav) {}

  //   nextStep() {
  //     this.nav.push(OnboardingStep2Component);
  //   }
}
