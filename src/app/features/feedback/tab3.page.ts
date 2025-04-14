import { Component } from "@angular/core";
import { IonButton, IonContent, IonTextarea, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";

@Component({
	selector: "app-tab3",
	templateUrl: "tab3.page.html",
	styleUrls: ["tab3.page.scss"],
	imports: [IonToolbar, IonTitle, IonContent, IonTextarea, IonButton, AppHeaderComponent],
})
export class Tab3Page {}
