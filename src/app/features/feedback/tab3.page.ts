import { Component } from "@angular/core";
import {
	IonButton,
	IonContent,
	IonHeader,
	IonTextarea,
	IonTitle,
	IonToolbar,
} from "@ionic/angular/standalone";

@Component({
	selector: "app-tab3",
	templateUrl: "tab3.page.html",
	styleUrls: ["tab3.page.scss"],
	imports: [
		IonHeader,
		IonToolbar,
		IonTitle,
		IonContent,
		IonTextarea,
		IonButton,
	],
})
export class Tab3Page {}
