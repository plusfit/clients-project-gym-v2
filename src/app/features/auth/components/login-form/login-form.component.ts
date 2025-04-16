import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { Login, Register } from "@feature/auth/state/auth.actions";
import { IonicModule } from "@ionic/angular";
import { Actions, Store, ofActionSuccessful } from "@ngxs/store";
import { ToastService } from "@shared/services/toast.service";
import { Subject, takeUntil } from "rxjs";

@Component({
	selector: "app-login-form",
	standalone: true,
	templateUrl: "./login-form.component.html",
	styleUrls: ["./login-form.component.scss"],
	imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class LoginFormComponent {
	form: FormGroup;
	private _destroyed = new Subject<void>();

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private store: Store,
		private actions: Actions,
		private toastService: ToastService,
	) {
		this.form = this.fb.group({
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, this.passwordValidator]],
		});
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
			this.store.dispatch(new Login(this.form.value));
			this.actions.pipe(ofActionSuccessful(Login), takeUntil(this._destroyed)).subscribe(() => {
				this.toastService.showSuccess("Inicio correctamente");
				this.form.reset();
				//TODO: Validar el onboarding para ver si lo mandamos o no al onboarding
				//this.router.navigate(["/onboarding"]);
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
		console.log("🔐 Registrarse con Google");
	}
}
