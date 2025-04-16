import { Component } from "@angular/core";
import { LoginFormComponent } from "@feature/auth/components/login-form/login-form.component";
import { IonicModule } from "@ionic/angular";
import { Store } from "@ngxs/store";

@Component({
	selector: "app-register",
	templateUrl: "./login.page.html",
	styleUrls: ["./login.page.scss"],
	imports: [LoginFormComponent, IonicModule],
	standalone: true,
})
export class LoginPage {
	constructor(private store: Store) {}
}
