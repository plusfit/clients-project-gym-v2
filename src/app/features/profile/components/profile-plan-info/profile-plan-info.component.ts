import { NgOptimizedImage } from "@angular/common";
import { Component, Input, input } from "@angular/core";
import {
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonIcon,
} from "@ionic/angular/standalone";
import { ExperienceLevelPipe } from "@shared/pipes/experience-level-translate.pipe";
@Component({
	selector: "app-profile-plan-info",
	standalone: true,
	imports: [
		IonCardContent,
		IonIcon,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		ExperienceLevelPipe,
	],
	templateUrl: "./profile-plan-info.component.html",
	styleUrl: "../../pages/profile.page.scss",
})
export class ProfilePlanInfoComponent {
	@Input() planName: any;
	@Input() planDays: any;
	@Input() planLevel: any;
}
