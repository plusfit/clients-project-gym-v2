import { Component, OnInit } from "@angular/core";
import { RecaptchaService } from "@core/services/recaptcha.service";
import { environment } from "@environments/environment";
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";
import { SplashScreenComponent } from "@shared/components/splash-screen/splash-screen.component";

@Component({
	selector: "app-root",
	templateUrl: "app.component.html",
	standalone: true,
	imports: [IonApp, IonRouterOutlet, SplashScreenComponent],
})
export class AppComponent implements OnInit {
	constructor(private recaptchaService: RecaptchaService) {}

	ngOnInit(): void {
		// Inicializar reCAPTCHA con la site key
		this.recaptchaService.init(environment.recaptcha.siteKey);
	}
}
