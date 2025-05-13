import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ForgotPassword, GoogleLogin, Login } from "@feature/auth/state/auth.actions";
import { AlertController, IonicModule } from "@ionic/angular";
import { ToastController } from "@ionic/angular";
import {
	IonButton,
	IonContent,
	IonIcon,
	IonInput,
	IonItem,
	IonList,
	IonSpinner,
	IonText,
} from "@ionic/angular/standalone";
import { Actions, Store, ofActionErrored, ofActionSuccessful } from "@ngxs/store";
import { ToastService } from "@shared/services/toast.service";
import { addIcons } from "ionicons";
import { eyeOffOutline, eyeOutline, lockClosedOutline, logInOutline, mailOutline } from "ionicons/icons";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../../services/auth.service";

@Component({
	selector: "app-login-form",
	standalone: true,
	templateUrl: "./login-form.component.html",
	styleUrls: ["./login-form.component.scss"],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		IonContent,
		IonList,
		IonItem,
		IonInput,
		IonText,
		IonButton,
		IonIcon,
		IonSpinner,
	],
})
export class LoginFormComponent implements OnDestroy {
	form: FormGroup;
	isLoading = false;
	showPassword = false;
	private _destroyed = new Subject<void>();

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private store: Store,
		private actions: Actions,
		private toastService: ToastService,
		private alertController: AlertController,
	) {
		addIcons({
			"mail-outline": mailOutline,
			"lock-closed-outline": lockClosedOutline,
			"log-in-outline": logInOutline,
			"eye-outline": eyeOutline,
			"eye-off-outline": eyeOffOutline,
		});

		this.form = this.fb.group({
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, this.passwordValidator]],
		});
	}

	togglePasswordVisibility() {
		this.showPassword = !this.showPassword;
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

	submit() {
		if (this.form.valid) {
			this.isLoading = true;

			this.store.dispatch(new Login(this.form.value));

			this.actions.pipe(ofActionSuccessful(Login), takeUntil(this._destroyed)).subscribe(() => {
				this.isLoading = false;
				const user = this.store.selectSnapshot((state) => state.auth.user);
				if (user?.onboardingCompleted) {
					this.router.navigate(["/cliente/mi-plan"]);
				} else {
					this.router.navigate(["/onboarding"]);
				}
				this.toastService.showSuccess("Inicio correctamente");
				this.form.reset();
			});

			this.actions.pipe(ofActionErrored(Login), takeUntil(this._destroyed)).subscribe(() => {
				this.isLoading = false;
			});
		} else {
			this.form.markAllAsTouched();
		}
	}

	isInvalid(control: string): boolean {
		const c = this.form.get(control);
		return !!(c?.invalid && (c.dirty || c.touched));
	}

	goToRegister() {
		this.router.navigate(["/registro"]);
	}

	registerWithGoogle() {
		this.isLoading = true;

		this.store.dispatch(new GoogleLogin());

		this.actions.pipe(ofActionSuccessful(GoogleLogin), takeUntil(this._destroyed)).subscribe(() => {
			this.isLoading = false;
			const user = this.store.selectSnapshot((state) => state.auth.user);
			if (user) {
				if (user.onboardingCompleted) {
					this.router.navigate(["/cliente/mi-plan"]);
				} else {
					this.router.navigate(["/onboarding"]);
				}
			}
		});

		this.actions.pipe(ofActionErrored(GoogleLogin), takeUntil(this._destroyed)).subscribe(() => {
			this.isLoading = false;
		});
	}

	async forgotPassword() {
		const alert = await this.alertController.create({
			header: "Recuperar contraseña",
			message: "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.",
			inputs: [
				{
					name: "email",
					type: "email",
					placeholder: "Email",
					value: this.form.get("email")?.value || "",
				},
			],
			buttons: [
				{
					text: "Cancelar",
					role: "cancel",
				},
				{
					text: "Enviar",
					handler: (data) => {
						if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
							this.toastService.showError("Por favor, ingresa un email válido");
							return false;
						}

						this.isLoading = true;
						this.store.dispatch(new ForgotPassword(data.email));

						this.actions.pipe(ofActionSuccessful(ForgotPassword), takeUntil(this._destroyed)).subscribe(() => {
							this.isLoading = false;
						});

						this.actions.pipe(ofActionErrored(ForgotPassword), takeUntil(this._destroyed)).subscribe(() => {
							this.isLoading = false;
						});
						return true;
					},
				},
			],
		});

		await alert.present();
	}

	ngOnDestroy(): void {
		this._destroyed.next();
		this._destroyed.complete();
	}
}
