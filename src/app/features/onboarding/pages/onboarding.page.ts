import { Component, ViewChild } from '@angular/core';
import {
  IonNav,
  IonContent,
  IonTitle,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';
import { OnboardingStep1Component } from '../components/onboarding-step1/onboarding-step1.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  templateUrl: './onboarding.page.html',
  imports: [IonNav, IonContent, IonTitle, IonHeader, IonToolbar],
})
export class OnboardingPage {
  @ViewChild(IonNav, { static: true }) nav!: IonNav;

  getInitialParams() {
    return {
      nav: this.nav,
    };
  }

  initialComponent = OnboardingStep1Component;
}
