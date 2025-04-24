import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { Store } from "@ngxs/store";
import { AppHeaderComponent } from "../../../../shared/components/app-header/app-header.component";
import { RegisterFormComponent } from "../../components/register-form/register-form.component";

@Component({
	selector: "app-register",
	templateUrl: "./register.page.html",
	styleUrls: ["./register.page.scss"],
	imports: [RegisterFormComponent, IonicModule, AppHeaderComponent],
	standalone: true,
})
export class RegisterPage {
	constructor(private store: Store) {}
}
