import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { RegisterFormComponent } from "../../components/register-form/register-form.component";

@Component({
	selector: "app-register",
	templateUrl: "./register.page.html",
	styleUrls: ["./register.page.scss"],
	imports: [RegisterFormComponent, IonicModule],
	standalone: true,
})
export class RegisterPage {
}
