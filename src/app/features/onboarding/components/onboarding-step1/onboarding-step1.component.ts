import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonicModule, IonNav } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { OnboardingStep2Component } from '../onboarding.step2/onboarding-step2.component';
import { IonDatetimeModalComponent } from '@shared/components/IonDatetimeModal/ion-datetime-modal.component';
import { Store } from '@ngxs/store';
import { SetStep1 } from '../../state/onboarding.actions';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './onboarding-step1.component.html',
  styleUrls: ['./onboarding-step1.component.scss'],
})
export class OnboardingStep1Component {
  @Input() nav!: IonNav;
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private store: Store,
  ) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^09\d{7}$/)]],
      mutual: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      sex: ['', Validators.required],
      ci: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    });
  }

  setDateOfBirth(event: any) {
    const date = event.detail.value;
    this.userForm.get('dateOfBirth')?.setValue(date);
  }
  //BORRO PARA IR MAS RAPIDO
  nextStep() {
    if (this.userForm.valid) {
      const step1Data = this.userForm.value;
      this.store.dispatch(new SetStep1(step1Data));
      this.nav.push(OnboardingStep2Component, { step1Data, nav: this.nav });
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return (control?.invalid && control?.touched) || false;
  }

  async openBirthdateModal() {
    const today = new Date().toISOString().split('T')[0]; //yyyy-mm-dd
    const modal = await this.modalCtrl.create({
      component: IonDatetimeModalComponent,
      breakpoints: [0, 0.4],
      initialBreakpoint: 0.6,
      componentProps: {
        value: this.userForm.get('dateOfBirth')?.value,
        max: today,
      },
      cssClass: 'datepicker-sheet',
    });

    modal.onWillDismiss().then((data) => {
      const selected = data.data;
      if (selected) {
        this.userForm.get('dateOfBirth')?.setValue(selected);
      }
    });
    await modal.present();
  }
}
