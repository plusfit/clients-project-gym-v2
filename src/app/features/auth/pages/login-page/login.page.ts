import { Component } from "@angular/core";
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
} from "@ionic/angular/standalone";
import { ExploreContainerComponent } from "src/app/explore-container/explore-container.component";

@Component({
	selector: "app-login",
	templateUrl: "login.page.html",
	styleUrls: ["login.page.scss"],
	imports: [
		IonHeader,
		IonToolbar,
		IonTitle,
		IonContent,
		ExploreContainerComponent,
	],
})
export class Tab2Page {
	constructor() {}
}
