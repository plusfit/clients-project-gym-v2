import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, IonNav } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding-step3',
  standalone: true,
  templateUrl: './onboarding-step3.component.html',
  styleUrls: ['./onboarding-step3.component.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class OnboardingStep3Component {
  @Input() nav!: IonNav;
  @Input() userData: any;

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      trainingDays: [3, Validators.required],
      goal: ['', Validators.required],
      trainingType: ['', Validators.required],
      trainingLevel: ['', Validators.required],
    });
  }

  nextStep() {
    if (this.form.valid) {
      const step3Data = this.form.value;
      const finalData = { ...this.userData, ...step3Data };
      console.log('Datos completos del usuario:', finalData);
    } else {
      this.form.markAllAsTouched();
    }
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
