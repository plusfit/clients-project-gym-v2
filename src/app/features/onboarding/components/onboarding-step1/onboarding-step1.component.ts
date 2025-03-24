import { Component, Input } from '@angular/core';
import { IonNav } from '@ionic/angular';
import {
  IonInput,
  IonItem,
  IonLabel,
  IonDatetime,
  IonButton,
  IonSelectOption,
  IonSelect,
  IonList,
  IonContent,
} from '@ionic/angular/standalone';
import { OnboardingStep2Component } from '../onboarding.step2/onboarding-step2.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding-step1',
  templateUrl: './onboarding-step1.component.html',
  standalone: true,
  imports: [
    IonInput,
    IonItem,
    IonLabel,
    IonDatetime,
    IonButton,
    IonSelectOption,
    IonSelect,
    IonList,
    IonContent,
    ReactiveFormsModule,
  ],
})
export class OnboardingStep1Component {
  @Input() nav!: IonNav;

  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      sociedadMedica: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      ci: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
    });
  }

  nextStep() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      this.nav.push(OnboardingStep2Component, { userData, nav: this.nav });
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
