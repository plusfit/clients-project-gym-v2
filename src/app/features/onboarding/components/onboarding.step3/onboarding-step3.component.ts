import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonNav, IonicModule, LoadingController, NavController, ToastController } from "@ionic/angular";
import { Store } from "@ngxs/store";
import { addIcons } from "ionicons";
import {
	arrowBack,
	barChartOutline,
	barbellOutline,
	calendarOutline,
	checkmarkOutline,
	trendingUpOutline,
} from "ionicons/icons";
import { finalize, take } from "rxjs";
import { OnboardingService } from "../../services/onboarding.service";
import { SetStep3 } from "../../state/onboarding.actions";
import { OnboardingState } from "../../state/onboarding.state";

@Component({
	selector: "app-onboarding-step3",
	standalone: true,
	templateUrl: "./onboarding-step3.component.html",
	styleUrls: ["./onboarding-step3.component.scss"],
	imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class OnboardingStep3Component implements OnInit {
	@Input() nav!: IonNav;
	@Input() userData: any;

	form: FormGroup;
	isSubmitting = false;
	isLoading = false;

	constructor(
		private fb: FormBuilder,
		private store: Store,
		private onboardingService: OnboardingService,
		private loadingController: LoadingController,
		private navCtrl: NavController,
		private toastCtrl: ToastController,
	) {
		addIcons({
			"calendar-outline": calendarOutline,
			"trending-up-outline": trendingUpOutline,
			"barbell-outline": barbellOutline,
			"bar-chart-outline": barChartOutline,
			"arrow-back": arrowBack,
			"checkmark-outline": checkmarkOutline,
		});

		this.form = this.fb.group({
			trainingDays: [3, Validators.required],
			goal: ["", Validators.required],
			trainingType: ["", Validators.required],
			trainingLevel: ["", Validators.required],
		});
	}

	ngOnInit() {
		// Verificar si hay datos del paso 3 en el store
		this.store
			.select(OnboardingState.getStep3)
			.pipe(take(1))
			.subscribe(async (step3Data) => {
				console.log("Datos Step3 recibidos:", step3Data);
				if (step3Data) {
					// Mostrar loader mientras procesamos
					this.isLoading = true;
					const loading = await this.loadingController.create({
						message: "Cargando información...",
						spinner: "circles",
						cssClass: "loading-content",
					});
					await loading.present();

					try {
						// Poblar el formulario con los datos existentes
						this.form.patchValue(step3Data);
						console.log("Formulario después de patchValue:", this.form.value);

						// Verificar si debemos avanzar a la página principal
						this.store
							.select(OnboardingState.getCurrentStep)
							.pipe(take(1))
							.subscribe((currentStep) => {
								console.log("Current step:", currentStep);
								if (currentStep > 3) {
									// Si ya completó este paso, redirigir a la página principal
									this.navigateToHome();
								}
							});
					} finally {
						this.isLoading = false;
						loading.dismiss();
					}
				}
			});
	}

	async nextStep() {
		if (this.form.valid && !this.isSubmitting) {
			this.isSubmitting = true;

			// Mostrar indicador de carga
			const loading = await this.loadingController.create({
				message: "Finalizando registro...",
				spinner: "circles",
				cssClass: "loading-content",
			});
			await loading.present();

			const step3Data = this.form.value;

			// Usando el estado NGXS que ahora maneja las actualizaciones
			this.store
				.dispatch(new SetStep3(step3Data))
				.pipe(
					finalize(() => {
						this.isSubmitting = false;
					}),
				)
				.subscribe({
					next: () => {
						// Intentar asignar un plan automáticamente
						this.assignPlanToUser(loading);
					},
					error: (error) => {
						console.error("Error en el paso 3 del onboarding:", error);
						loading.dismiss();
						// Si hay un error, igual redirigir al usuario
						this.navigateToHome();
					},
				});
		} else {
			this.form.markAllAsTouched();
		}
	}

	/**
	 * Asigna un plan al usuario según sus preferencias
	 */
	private assignPlanToUser(loading: HTMLIonLoadingElement) {
		// Actualizar mensaje de carga
		loading.message = "Asignando plan de entrenamiento...";

		this.onboardingService.assignPlan().subscribe({
			next: async (response) => {
				console.log("Plan asignado correctamente:", response);
				loading.dismiss();

				// Mostrar toast con confirmación
				const toast = await this.toastCtrl.create({
					message: `Plan "${response.plan.name}" asignado con éxito`,
					duration: 3000,
					position: "bottom",
					cssClass: "custom-toast toast-success",
					buttons: [
						{
							text: "OK",
							role: "cancel",
						},
					],
				});
				await toast.present();

				// Navegar a la página principal
				this.navigateToHome();
			},
			error: async (error) => {
				console.error("Error al asignar plan:", error);
				loading.dismiss();

				// Mostrar mensaje de error
				const toast = await this.toastCtrl.create({
					message: "No se pudo asignar un plan. Se asignará uno predeterminado.",
					duration: 3000,
					position: "bottom",
					cssClass: "custom-toast toast-warning",
					buttons: [
						{
							text: "OK",
							role: "cancel",
						},
					],
				});
				await toast.present();

				// Redirigir a la página principal de todas formas
				this.navigateToHome();
			},
		});
	}

	// Método para navegar a la página principal
	private navigateToHome() {
		this.navCtrl.navigateRoot("/tabs/home", { animationDirection: "forward" });
	}

	prevStep() {
		this.nav.pop();
	}

	isInvalid(control: string, group = "") {
		const c = group ? (this.form.get(group) as FormGroup).get(control) : this.form.get(control);
		return c?.invalid && c?.touched;
	}
}
