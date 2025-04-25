import { CommonModule } from "@angular/common";
import { Component, OnDestroy } from "@angular/core";
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { GoogleLogin, GoogleRegister, Register } from "@feature/auth/state/auth.actions";
import { IonicModule } from "@ionic/angular";
import { IonSpinner } from "@ionic/angular/standalone";
import { Actions, Store, ofActionErrored, ofActionSuccessful } from "@ngxs/store";
import { ToastService } from "@shared/services/toast.service";
import { addIcons } from "ionicons";
import { mailOutline } from "ionicons/icons";
import { lockClosedOutline } from "ionicons/icons";
import { logInOutline } from "ionicons/icons";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: "app-register-form",
	standalone: true,
	templateUrl: "./register-form.component.html",
	styleUrls: ["./register-form.component.scss"],
	imports: [CommonModule, IonicModule, ReactiveFormsModule, IonSpinner],
})
export class RegisterFormComponent implements OnDestroy {
	form: FormGroup;
	private _destroyed = new Subject<void>();
	isLoading = false;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private store: Store,
		private actions: Actions,
		private toastService: ToastService,
	) {
		addIcons({
			"mail-outline": mailOutline,
			"lock-closed-outline": lockClosedOutline,
			"log-in-outline": logInOutline,
		});

		this.form = this.fb.group(
			{
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

	submit() {
		if (this.form.valid) {

			this.store.dispatch(new Register(this.form.value));

			this.actions.pipe(ofActionSuccessful(Register), takeUntil(this._destroyed)).subscribe(() => {
				this.toastService.showSuccess("Cliente creado correctamente");
				this.form.reset();
				this.router.navigate(["/login"]);
			});
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

	registerWithGoogle() {
		this.isLoading = true;
		this.store.dispatch(new GoogleRegister());

		this.actions.pipe(ofActionSuccessful(GoogleRegister), takeUntil(this._destroyed)).subscribe(() => {
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

		this.actions.pipe(ofActionErrored(GoogleRegister), takeUntil(this._destroyed)).subscribe(() => {
			this.isLoading = false;
			// Error handling done in the state
		});
	}

	ngOnDestroy(): void {
		this._destroyed.next();
		this._destroyed.complete();
	}
}
