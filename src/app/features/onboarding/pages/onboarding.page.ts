// onboarding.page.ts
import { Component } from '@angular/core';
import { OnboardingStep1Component } from '../components/onboarding-step1/onboarding-step1.component';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
})
export class OnboardingPage {
  initialComponent = OnboardingStep1Component;
}
