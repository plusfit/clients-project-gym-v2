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
import { User } from "../../../auth/interfaces/user.interface";
import { AuthFacadeService } from "../../../auth/services/auth-facade.service";
import { AuthState } from "../../../auth/state/auth.state";
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
		private authFacadeService: AuthFacadeService,
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
		// Inicializar un usuario ficticio en el estado de autenticación para pruebas
		console.log("🧪 Inicializando usuario de prueba para desarrollo");
		this.authFacadeService.setMockUserState();

		// Verificar si hay datos del paso 3 en el store
		this.store
			.select(OnboardingState.getStep3)
			.pipe(take(1))
			.subscribe(async (step3Data) => {
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

						// Verificar si debemos avanzar a la página principal
						this.store
							.select(OnboardingState.getCurrentStep)
							.pipe(take(1))
							.subscribe((currentStep) => {
								if (currentStep > 3) {
									// Si ya completó este paso, redirigir a la página principal
									this.navigateToPlan();
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

			try {
				// Mostrar indicador de carga
				const loading = await this.loadingController.create({
					message: "Finalizando registro...",
					spinner: "circles",
					cssClass: "loading-content",
				});
				await loading.present();

				const step3Data = this.form.value;
				console.log("📤 Guardando preferencias de entrenamiento");

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
						error: async (error) => {
							console.error("⚠️ Error al guardar preferencias:", error);
							loading.dismiss();

							// Mostrar mensaje de error
							const toast = await this.toastCtrl.create({
								message: "No pudimos guardar tus preferencias, pero continuaremos con tu plan",
								duration: 3000,
								position: "bottom",
								cssClass: "custom-toast toast-warning",
							});
							await toast.present();

							// Intentar asignar plan de todas formas
							this.assignPlanToUser(
								await this.loadingController.create({
									message: "Intentando asignar plan...",
									spinner: "circles",
								}),
							);
						},
					});
			} catch (error) {
				console.error("Error fatal en el paso 3:", error);
				this.isSubmitting = false;

				// Mostrar mensaje de error crítico
				const toast = await this.toastCtrl.create({
					message: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
					duration: 3000,
					position: "bottom",
					cssClass: "custom-toast toast-error",
					buttons: [
						{
							text: "Reintentar",
							handler: () => {
								this.nextStep();
							},
						},
					],
				});
				await toast.present();
			}
		} else {
			this.form.markAllAsTouched();

			// Mostrar mensaje si el formulario es inválido
			if (!this.form.valid) {
				const toast = await this.toastCtrl.create({
					message: "Por favor completa todos los campos requeridos",
					duration: 2000,
					position: "bottom",
					cssClass: "custom-toast toast-warning",
				});
				await toast.present();
			}
		}
	}

	/**
	 * Asigna un plan al usuario según sus preferencias
	 */
	private assignPlanToUser(loading: HTMLIonLoadingElement) {
		// Obtener el usuario del AuthState
		const user = this.store.selectSnapshot(AuthState.getUser) as User | null;

		// Log de información crítica
		console.log("🔐 ID del usuario actual:", user?._id || "No disponible");

		// Verificar que tenemos un ID de usuario
		if (!user?._id) {
			console.error("❌ No se encontró un ID de usuario válido en AuthState");
			console.log("Intentando con ID de localStorage...");
			const localId = localStorage.getItem("userId");
			if (localId) {
				console.log(`✅ ID recuperado de localStorage: ${localId}`);
			} else {
				console.error("❌ No se encontró un ID ni en el estado ni en localStorage");
			}
		}

		// Actualizar mensaje de carga
		loading.message = "Asignando plan de entrenamiento...";

		this.onboardingService.assignPlan().subscribe({
			next: async (response) => {
				console.log("✅ Plan asignado correctamente", response);
				loading.dismiss();

				// Extraer la información del plan según la estructura de respuesta
				let planName = "Personalizado";
				let planId = null;

				// Caso 1: Respuesta con plan en data.plan
				if (response?.data?.plan) {
					planName = response.data.plan.name || "Personalizado";
					planId = response.data.plan._id || response.data.plan.id;
				}
				// Caso 2: Respuesta con planId en data
				else if (response?.data?.planId) {
					planId = response.data.planId;
					planName = "Plan Asignado";
				}
				// Caso 3: Respuesta directa con plan
				else if (response?.plan) {
					planName = response.plan.name || "Personalizado";
					planId = response.plan._id || response.plan.id;
				}

				// Mostrar toast con confirmación
				const toast = await this.toastCtrl.create({
					message: `Plan "${planName}" asignado con éxito`,
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

				// Navegar a la página del plan
				this.navigateToPlan();
			},
			error: async (error) => {
				console.error("❌ Error al asignar plan:", error);
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
				this.navigateToPlan();
			},
		});
	}

	private navigateToPlan() {
		// Navegar a la página del plan dentro de las pestañas cliente
		this.navCtrl.navigateRoot("/cliente/mi-plan", { animationDirection: "forward" });
		console.log("Navegando a /cliente/mi-plan");
	}

	prevStep() {
		this.nav.pop();
	}

	isInvalid(control: string, group = "") {
		const c = group ? (this.form.get(group) as FormGroup).get(control) : this.form.get(control);
		return c?.invalid && c?.touched;
	}
}
