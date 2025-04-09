import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { IonNav, IonicModule, LoadingController } from "@ionic/angular";
import { Store } from "@ngxs/store";
import { IonDatetimeModalComponent } from "@shared/components/IonDatetimeModal/ion-datetime-modal.component";
import { addIcons } from "ionicons";
import {
	arrowForward,
	calendarOutline,
	callOutline,
	cardOutline,
	homeOutline,
	medkitOutline,
	peopleOutline,
	personOutline,
} from "ionicons/icons";
import { finalize, take } from "rxjs";
import { OnboardingService } from "../../services/onboarding.service";
import { InitOnboarding, LoadOnboardingData, SetStep1 } from "../../state/onboarding.actions";
import { OnboardingState } from "../../state/onboarding.state";
import { OnboardingStep2Component } from "../onboarding.step2/onboarding-step2.component";

@Component({
	selector: "app-step1",
	standalone: true,
	imports: [CommonModule, IonicModule, ReactiveFormsModule],
	templateUrl: "./onboarding-step1.component.html",
	styleUrls: ["./onboarding-step1.component.scss"],
})
export class OnboardingStep1Component implements OnInit {
	@Input() nav!: IonNav;
	userForm: FormGroup;
	isSubmitting = false;
	isLoading = false;

	constructor(
		private fb: FormBuilder,
		private modalCtrl: ModalController,
		private store: Store,
		private onboardingService: OnboardingService,
		private loadingCtrl: LoadingController,
	) {
		addIcons({
			"person-outline": personOutline,
			"home-outline": homeOutline,
			"call-outline": callOutline,
			"medkit-outline": medkitOutline,
			"calendar-outline": calendarOutline,
			"people-outline": peopleOutline,
			"card-outline": cardOutline,
			"arrow-forward": arrowForward,
		});

		this.userForm = this.fb.group({
			fullName: ["", Validators.required],
			address: ["", Validators.required],
			phone: ["", [Validators.required, Validators.pattern(/^09\d{7}$/)]],
			mutual: ["", Validators.required],
			dateOfBirth: ["", Validators.required],
			sex: ["", Validators.required],
			ci: ["", [Validators.required, Validators.pattern(/^\d{8}$/)]],
		});
	}

	async ngOnInit() {
		this.isLoading = true;
		const loading = await this.loadingCtrl.create({
			message: "Cargando información...",
			spinner: "circles",
			cssClass: "loading-content",
		});
		await loading.present();

		// Cargar los datos del onboarding
		this.store
			.dispatch(new LoadOnboardingData())
			.pipe(
				finalize(() => {
					this.isLoading = false;
					loading.dismiss();
				}),
			)
			.subscribe({
				next: () => {
					// Después de cargar, verificamos si hay datos del paso 1
					this.store
						.select(OnboardingState.getStep1)
						.pipe(take(1))
						.subscribe((step1Data) => {
							console.log("Datos Step1 recibidos:", step1Data);
							if (step1Data) {
								// Poblar el formulario con los datos existentes
								this.userForm.patchValue(step1Data);
								console.log("Formulario después de patchValue:", this.userForm.value);

								// Verificar si ya debemos ir al paso 2 o 3
								this.store
									.select(OnboardingState.getCurrentStep)
									.pipe(take(1))
									.subscribe((currentStep) => {
										console.log("Current step:", currentStep);
										if (currentStep > 1) {
											// Si ya completó este paso, avanzar al siguiente
											this.goToNextStep(currentStep, step1Data);
										}
									});
							}
						});
				},
				error: (error) => {
					console.error("Error al cargar datos de onboarding:", error);
				},
			});
	}

	setDateOfBirth(event: any) {
		const date = event.detail.value;
		this.userForm.get("dateOfBirth")?.setValue(date);
	}

	nextStep() {
		if (this.userForm.valid && !this.isSubmitting) {
			this.isSubmitting = true;
			const step1Data = this.userForm.value;

			// Usando el estado NGXS que ahora maneja la inicialización y actualizaciones
			this.store
				.dispatch(new SetStep1(step1Data))
				.pipe(
					finalize(() => {
						this.isSubmitting = false;
					}),
				)
				.subscribe({
					next: () => {
						// Navegar al siguiente paso
						this.nav.push(OnboardingStep2Component, { step1Data, nav: this.nav });
					},
					error: (error) => {
						console.error("Error en el paso 1 del onboarding:", error);
						// Si se produce un error, igual continuar con el flujo
						this.nav.push(OnboardingStep2Component, { step1Data, nav: this.nav });
					},
				});
		} else {
			this.userForm.markAllAsTouched();
		}
	}

	// Método para avanzar al siguiente paso basado en el estado actual
	private goToNextStep(currentStep: number, step1Data: any) {
		if (currentStep >= 2) {
			// Navegar al paso 2
			this.nav.push(OnboardingStep2Component, { step1Data, nav: this.nav });
		}
	}

	isInvalid(controlName: string): boolean {
		const control = this.userForm.get(controlName);
		return (control?.invalid && control?.touched) || false;
	}

	async openBirthdateModal() {
		const today = new Date().toISOString().split("T")[0]; //yyyy-mm-dd
		const modal = await this.modalCtrl.create({
			component: IonDatetimeModalComponent,
			breakpoints: [0, 0.4],
			initialBreakpoint: 0.6,
			componentProps: {
				value: this.userForm.get("dateOfBirth")?.value,
				max: today,
			},
			cssClass: "datepicker-sheet",
		});

		modal.onWillDismiss().then((data) => {
			const selected = data.data;
			if (selected) {
				this.userForm.get("dateOfBirth")?.setValue(selected);
			}
		});
		await modal.present();
	}
}
