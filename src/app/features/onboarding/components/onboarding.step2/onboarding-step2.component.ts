import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, IonNav } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { OnboardingStep3Component } from '../onboarding.step3/onboarding-step3.component';

@Component({
  selector: 'app-onboarding-step2',
  standalone: true,
  templateUrl: './onboarding-step2.component.html',
  styleUrls: ['./onboarding-step2.component.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class OnboardingStep2Component {
  @Input() nav!: IonNav;
  @Input() userData: any;

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      bloodPressure: ['', Validators.required],
      history: this.fb.group({
        respiratory: ['', Validators.required],
        cardiac: ['', Validators.required],
        chirurgical: ['', Validators.required],
        injuries: ['', Validators.required],
      }),
    });
  }

  nextStep() {
    //   if (this.form.valid) {
    const step2Data = this.form.value;

    this.nav.push(OnboardingStep3Component, {
      nav: this.nav,
      userData: { ...this.userData, ...step2Data },
    });
    //    } else {
    //      this.form.markAllAsTouched();
    //    }
  }

  prevStep() {
    this.nav.pop();
  }

  isInvalid(control: string, group: string = '') {
    const c = group
      ? (this.form.get(group) as FormGroup).get(control)
      : this.form.get(control);
    return c?.invalid && c?.touched;
  }
}
