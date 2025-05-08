import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonNav, IonicModule, LoadingController, NavController, ToastController } from "@ionic/angular";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import { addIcons } from "ionicons";
import {
	arrowBack,
	bandageOutline,
	barChartOutline,
	barbellOutline,
	calendarOutline,
	checkmarkOutline,
	fitnessOutline,
	trendingUpOutline,
} from "ionicons/icons";
import { finalize, take, takeUntil } from "rxjs";
import { UserRole } from '../../../auth/interfaces/user.interface';
import { SetOnboardingCompleted, UpdateUser } from "../../../auth/state/auth.actions";
import { AuthState } from '../../../auth/state/auth.state';
import { UserService } from '../../../profile/services/user.service';
import { OnboardingService } from "../../services/onboarding.service";
import { SetStep3 } from "../../state/onboarding.actions";
import { OnboardingState } from "../../state/onboarding.state";

export enum InjuryType {
	SHOULDER = "shoulder",
	KNEE = "knee",
	BACK = "back",
	ANKLE = "ankle",
	HIP = "hip",
	ELBOW = "elbow",
	WRIST = "wrist",
	NECK = "neck",
	OTHER = "other",
}

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
	private destroyed = false;

	injuryTypes = [
		{ value: InjuryType.SHOULDER, label: 'Hombro' },
		{ value: InjuryType.KNEE, label: 'Rodilla' },
		{ value: InjuryType.BACK, label: 'Espalda' },
		{ value: InjuryType.ANKLE, label: 'Tobillo' },
		{ value: InjuryType.HIP, label: 'Cadera' },
		{ value: InjuryType.ELBOW, label: 'Codo' },
		{ value: InjuryType.WRIST, label: 'Muñeca' },
		{ value: InjuryType.NECK, label: 'Cuello' },
		{ value: InjuryType.OTHER, label: 'Otra' },
	];

	constructor(
		private fb: FormBuilder,
		private store: Store,
		private actions: Actions,
		private onboardingService: OnboardingService,
		private loadingController: LoadingController,
		private navCtrl: NavController,
		private toastCtrl: ToastController,
		private userService: UserService,
	) {
		addIcons({
			"calendar-outline": calendarOutline,
			"trending-up-outline": trendingUpOutline,
			"barbell-outline": barbellOutline,
			"bar-chart-outline": barChartOutline,
			"arrow-back": arrowBack,
			"checkmark-outline": checkmarkOutline,
			"fitness-outline": fitnessOutline,
			"bandage-outline": bandageOutline,
		});

		this.form = this.fb.group({
			trainingDays: [3, Validators.required],
			goal: ["", Validators.required],
			injuryType: [""],
			trainingType: ["", Validators.required],
			trainingLevel: ["", Validators.required],
		});

		// Agregar validador condicional para el tipo de lesión
		this.form.get('goal')?.valueChanges.subscribe(goal => {
			const injuryTypeControl = this.form.get('injuryType');
			if (goal === 'injuryRecovery') {
				injuryTypeControl?.setValidators([Validators.required]);
			} else {
				injuryTypeControl?.clearValidators();
				injuryTypeControl?.setValue('');
			}
			injuryTypeControl?.updateValueAndValidity();
		});
	}

	ngOnInit() {
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
		loading.message = "Asignando plan de entrenamiento...";
		this.onboardingService.assignPlan().subscribe({
			next: async (response) => {
				loading.dismiss();
				this.store.dispatch(new SetOnboardingCompleted());
				let planName = "Personalizado";
				if (response?.data?.plan) {
					planName = response.data.plan.name || planName;
				} else if (response?.data?.planId) {
					planName = "Plan Asignado";
				} else if (response?.plan) {
					planName = response.plan.name || planName;
				}
				await this.updateUserStateFromBackend();
				const toast = await this.toastCtrl.create({
					message: `Plan "${planName}" asignado con éxito`,
					duration: 3000,
					position: "bottom",
					cssClass: "custom-toast toast-success",
					buttons: [{ text: "OK", role: "cancel" }],
				});
				await toast.present();
				this.navigateToPlan();
			},
			error: async () => {
				loading.dismiss();
				this.store.dispatch(new SetOnboardingCompleted());
				await this.updateUserStateFromBackend();
				const toast = await this.toastCtrl.create({
					message: "No se pudo asignar un plan. Se asignará uno predeterminado.",
					duration: 3000,
					position: "bottom",
					cssClass: "custom-toast toast-warning",
					buttons: [{ text: "OK", role: "cancel" }],
				});
				await toast.present();
				this.navigateToPlan();
			},
		});
	}

	private async updateUserStateFromBackend() {
		const authUser = this.store.selectSnapshot(AuthState.getUser);
		const userId = authUser?._id;
		if (!userId) return;
		const user = await this.userService.getUser(userId).toPromise();
		if (user) {
			const userInfo = {
				_id: (user.userInfo as any)._id || '',
				...user.userInfo,
				historyofPathologicalLesions: String(user.userInfo.historyofPathologicalLesions),
				cardiacHistory: String(user.userInfo.cardiacHistory),
				respiratoryHistory: String(user.userInfo.respiratoryHistory),
				surgicalHistory: String(user.userInfo.surgicalHistory),
			};
			const mappedUser = {
				...user,
				role: (user.role as keyof typeof UserRole) in UserRole ? UserRole[user.role as keyof typeof UserRole] : UserRole.USER,
				userInfo
			};
			this.store.dispatch(new UpdateUser(mappedUser));
		}
	}

	private navigateToPlan() {
		// Navegar a la página del plan dentro de las pestañas cliente
		this.navCtrl.navigateRoot("/cliente/mi-plan", { animationDirection: "forward" });
	}

	prevStep() {
		this.nav.pop();
	}

	isInvalid(control: string, group = "") {
		const c = group ? (this.form.get(group) as FormGroup).get(control) : this.form.get(control);
		return c?.invalid && c?.touched;
	}
}
