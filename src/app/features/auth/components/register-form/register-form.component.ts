import { CommonModule } from "@angular/common";
import { Component, OnDestroy, ViewChild } from "@angular/core";
import {
	AbstractControl,
	AsyncValidatorFn,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { RecaptchaService } from "@core/services/recaptcha.service";
import { AuthService } from "@feature/auth/services/auth.service";
import { GoogleLogin, GoogleRegister, HidePasswordReminder, Register } from "@feature/auth/state/auth.actions";
import { AuthState } from "@feature/auth/state/auth.state";
import { SetCIFromRegister } from "@feature/onboarding/state/onboarding.actions";
import {
	IonButton,
	IonContent,
	IonIcon,
	IonInput,
	IonItem,
	IonList,
	IonModal,
	IonSpinner,
	IonText
} from "@ionic/angular/standalone";
import { Actions, Select, Store, ofActionErrored, ofActionSuccessful } from "@ngxs/store";
import { ToastService } from "@shared/services/toast.service";
import { addIcons } from "ionicons";
import { cardOutline, mailOutline } from "ionicons/icons";
import { lockClosedOutline } from "ionicons/icons";
import { logInOutline } from "ionicons/icons";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
import { Observable, Subject, catchError, map, of, takeUntil } from "rxjs";
import { PasswordReminderModalComponent } from "../password-reminder-modal/password-reminder-modal.component";

@Component({
	selector: "app-register-form",
	standalone: true,
	templateUrl: "./register-form.component.html",
	styleUrls: ["./register-form.component.scss"],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		IonSpinner,
		IonModal,
		IonContent,
		IonList,
		IonItem,
		IonIcon,
		IonInput,
		IonText,
		IonButton,
		PasswordReminderModalComponent
	],
})
export class RegisterFormComponent implements OnDestroy {
	form: FormGroup;
	private _destroyed = new Subject<void>();
	isLoading = false;
	showPassword = false;
	showRepeatPassword = false;

	@Select(AuthState.getShowPasswordReminder) showPasswordReminder$!: Observable<boolean>;
	@Select(AuthState.getRegisteredPassword) registeredPassword$!: Observable<string | undefined>;

	@ViewChild('passwordReminderModal', { static: false }) passwordReminderModal!: IonModal;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private store: Store,
		private actions: Actions,
		private toastService: ToastService,
		private recaptchaService: RecaptchaService,
		private authService: AuthService,
	) {
		addIcons({ cardOutline, mailOutline, lockClosedOutline, logInOutline, eyeOutline, eyeOffOutline });

		this.form = this.fb.group(
			{
				ci: ["", [Validators.required, Validators.pattern(/^\d{8}$/)], [this.ciAvailableValidator()]],
				email: ["", [Validators.required, Validators.email]],
				repeatEmail: ["", [Validators.required, Validators.email]],
				password: ["", [Validators.required, this.passwordValidator]],
				repeatPassword: ["", Validators.required],
			},
			{
				validators: [this.emailsMatchValidator, this.passwordsMatchValidator],
			},
		);
	}

	emailsMatchValidator(group: AbstractControl): ValidationErrors | null {
		const email = group.get("email")?.value;
		const repeat = group.get("repeatEmail")?.value;
		return email === repeat ? null : { emailsDontMatch: true };
	}

	passwordValidator(control: AbstractControl): ValidationErrors | null {
		const value = control.value;
		if (!value) return null;

		const hasUppercase = /[A-Z]/.test(value);
		const hasNumberOrSymbol = /[\d\W]/.test(value);

		if (hasUppercase && hasNumberOrSymbol) {
			return null;
		}

		return { passwordWeak: true };
	}

	passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
		const pass = group.get("password")?.value;
		const repeat = group.get("repeatPassword")?.value;
		return pass === repeat ? null : { passwordsDontMatch: true };
	}

	ciAvailableValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			if (!control.value || control.value.length !== 8) {
				return of(null);
			}

			return this.authService.validateCI(control.value).pipe(
				map((response) => {
					// Si data es true, el usuario existe (CI ya está registrado)
					// Si data es false, el usuario no existe (CI disponible)
					return response.data ? { ciAlreadyExists: true } : null;
				}),
				catchError(() => of(null))
			);
		};
	}

	togglePasswordVisibility() {
		this.showPassword = !this.showPassword;
	}

	toggleRepeatPasswordVisibility() {
		this.showRepeatPassword = !this.showRepeatPassword;
	}

	async submit() {
		if (this.form.valid) {
			this.isLoading = true;

			try {
				// Ejecutar reCAPTCHA antes del registro
				const recaptchaToken = await this.recaptchaService.executeRecaptcha("register");

				// Agregar el token al payload
				const registerData = {
					...this.form.value,
					recaptchaToken,
				};

				this.store.dispatch(new Register(registerData));

				this.actions.pipe(ofActionSuccessful(Register), takeUntil(this._destroyed)).subscribe(() => {
					this.isLoading = false;
					// Guardar la CI en el estado de onboarding para usarla en el step1
					const ci = this.form.get('ci')?.value;
					if (ci) {
						this.store.dispatch(new SetCIFromRegister(ci));
					}
					this.toastService.showSuccess("Cliente creado correctamente");
					// El modal se mostrará automáticamente desde el estado
					// No navegamos inmediatamente, esperamos a que el usuario confirme el modal
				});

				this.actions.pipe(ofActionErrored(Register), takeUntil(this._destroyed)).subscribe(() => {
					this.isLoading = false;
				});
			} catch (error) {
				this.isLoading = false;
				this.toastService.showError("Error de verificación. Por favor, intenta nuevamente.");
				console.error("reCAPTCHA error:", error);
			}
		} else {
			this.form.markAllAsTouched();
		}
	}

	isInvalid(control: string): boolean {
		const c = this.form.get(control);
		return !!(c?.invalid && (c.dirty || c.touched));
	}

	goToLogin() {
		this.router.navigate(["/login"]);
	}

	async registerWithGoogle() {
		this.isLoading = true;

		try {
			// Ejecutar reCAPTCHA antes del registro con Google
			const recaptchaToken = await this.recaptchaService.executeRecaptcha("google_register");

			this.store.dispatch(new GoogleRegister(recaptchaToken));

			this.actions.pipe(ofActionSuccessful(GoogleRegister), takeUntil(this._destroyed)).subscribe(() => {
				this.isLoading = false;
				const user = this.store.selectSnapshot((state) => state.auth.user);
				if (user) {
					if (user.isOnboardingCompleted) {
						this.router.navigate(["/cliente/mi-plan"]);
					} else {
						this.router.navigate(["/onboarding"]);
					}
				}
			});

			this.actions.pipe(ofActionErrored(GoogleRegister), takeUntil(this._destroyed)).subscribe(() => {
				this.isLoading = false;
				// Error handling done in the state
			});
		} catch (error) {
			this.isLoading = false;
			this.toastService.showError("Error de verificación. Por favor, intenta nuevamente.");
			console.error("reCAPTCHA error:", error);
		}
	}

	ngOnDestroy(): void {
		this._destroyed.next();
		this._destroyed.complete();
	}

	onPasswordReminderConfirm() {
		// Cerrar el modal directamente
		if (this.passwordReminderModal) {
			this.passwordReminderModal.dismiss();
		}

		// Actualizar el estado
		this.store.dispatch(new HidePasswordReminder());

		// Navegar al onboarding después del registro exitoso
		this.router.navigate(["/onboarding"]);
	}
}
