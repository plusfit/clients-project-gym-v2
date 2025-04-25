import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonNav, IonicModule, LoadingController } from "@ionic/angular";
import { Store } from "@ngxs/store";
import { addIcons } from "ionicons";
import { arrowBack, arrowForward, bandageOutline, fitnessOutline, heartOutline, pulseOutline } from "ionicons/icons";
import { finalize, take } from "rxjs";
import { OnboardingService } from "../../services/onboarding.service";
import { SetStep2 } from "../../state/onboarding.actions";
import { OnboardingState } from "../../state/onboarding.state";
import { OnboardingStep3Component } from "../onboarding.step3/onboarding-step3.component";

@Component({
	selector: "app-onboarding-step2",
	standalone: true,
	templateUrl: "./onboarding-step2.component.html",
	styleUrls: ["./onboarding-step2.component.scss"],
	imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class OnboardingStep2Component implements OnInit {
	@Input() nav!: IonNav;
	@Input() userData: any;

	form: FormGroup;
	isSubmitting = false;
	isLoading = false;

	constructor(
		private fb: FormBuilder,
		private store: Store,
		private onboardingService: OnboardingService,
		private loadingCtrl: LoadingController,
	) {
		addIcons({
			"pulse-outline": pulseOutline,
			"fitness-outline": fitnessOutline,
			"heart-outline": heartOutline,
			"bandage-outline": bandageOutline,
			"arrow-forward": arrowForward,
			"arrow-back": arrowBack,
		});

		this.form = this.fb.group({
			bloodPressure: ["", Validators.required],
			history: this.fb.group({
				respiratory: ["", Validators.required],
				cardiac: ["", Validators.required],
				chirurgical: ["", Validators.required],
				injuries: ["", Validators.required],
			}),
		});
	}

	ngOnInit() {
		// Verificar si hay datos del paso 2 en el store
		this.store
			.select(OnboardingState.getStep2)
			.pipe(take(1))
			.subscribe(async (step2Data) => {
				if (step2Data) {
					// Mostrar loader mientras procesamos
					this.isLoading = true;
					const loading = await this.loadingCtrl.create({
						message: "Cargando información...",
						spinner: "circles",
						cssClass: "loading-content",
					});
					await loading.present();

					try {
						// Convertir los valores string a los valores que espera el form (true/false como string)
						const formValue = {
							bloodPressure: step2Data.bloodPressure,
							history: {
								respiratory: this.convertDescriptionToBoolean(step2Data.history.respiratory),
								cardiac: this.convertDescriptionToBoolean(step2Data.history.cardiac),
								chirurgical: this.convertDescriptionToBoolean(step2Data.history.chirurgical),
								injuries: this.convertDescriptionToBoolean(step2Data.history.injuries),
							},
						};


						// Poblar el formulario
						this.form.patchValue(formValue);

						// Verificar si debemos avanzar al paso 3
						this.store
							.select(OnboardingState.getCurrentStep)
							.pipe(take(1))
							.subscribe((currentStep) => {
								if (currentStep > 2) {
									// Si ya completó este paso, avanzar al siguiente
									this.goToNextStep(currentStep, step2Data);
								}
							});
					} finally {
						this.isLoading = false;
						loading.dismiss();
					}
				}
			});
	}

	// Convierte la descripción textual a un valor "true"/"false" para el segmento
	private convertDescriptionToBoolean(description: string): string {
		// Si la descripción contiene "Tiene" o similares, es "true", de lo contrario "false"
		return description.toLowerCase().includes("tiene") ? "true" : "false";
	}

	nextStep() {
		if (this.form.valid && !this.isSubmitting) {
			this.isSubmitting = true;

			// Mostrar indicador de carga
			this.loadingCtrl
				.create({
					message: "Guardando información...",
					spinner: "circles",
					cssClass: "loading-content",
				})
				.then((loading) => {
					loading.present();

					// Convertir el formulario a la estructura esperada por el backend
					const formValue = this.form.value;
					const step2Data = {
						bloodPressure: formValue.bloodPressure,
						history: {
							// Convertir los valores de segment (true/false como strings) a descripciones significativas
							respiratory:
								formValue.history.respiratory === "true"
									? "Tiene antecedentes respiratorios"
									: "Sin antecedentes respiratorios",
							cardiac:
								formValue.history.cardiac === "true" ? "Tiene antecedentes cardíacos" : "Sin antecedentes cardíacos",
							chirurgical:
								formValue.history.chirurgical === "true"
									? "Tiene antecedentes quirúrgicos"
									: "Sin antecedentes quirúrgicos",
							injuries:
								formValue.history.injuries === "true" ? "Tiene lesiones patológicas" : "Sin lesiones patológicas",
						},
					};

					// Usando el estado NGXS que ahora maneja las actualizaciones
					this.store
						.dispatch(new SetStep2(step2Data))
						.pipe(
							finalize(() => {
								this.isSubmitting = false;
								loading.dismiss();
							}),
						)
						.subscribe({
							next: () => {
								// Navegar al siguiente paso
								this.nav.push(OnboardingStep3Component, {
									nav: this.nav,
									userData: { ...this.userData, ...step2Data },
								});
							},
							error: (error) => {
								// Si se produce un error, igual continuar con el flujo
								this.nav.push(OnboardingStep3Component, {
									nav: this.nav,
									userData: { ...this.userData, ...step2Data },
								});
							},
						});
				});
		} else {
			this.form.markAllAsTouched();
		}
	}

	// Método para avanzar al siguiente paso basado en el estado actual
	private goToNextStep(currentStep: number, step2Data: any) {
		if (currentStep >= 3) {
			// Navegar al paso 3
			const combinedData = { ...this.userData, ...step2Data };
			this.nav.push(OnboardingStep3Component, {
				nav: this.nav,
				userData: combinedData,
			});
		}
	}

	prevStep() {
		this.nav.pop();
	}

	isInvalid(control: string, group = "") {
		const c = group ? (this.form.get(group) as FormGroup).get(control) : this.form.get(control);
		return c?.invalid && c?.touched;
	}
}
