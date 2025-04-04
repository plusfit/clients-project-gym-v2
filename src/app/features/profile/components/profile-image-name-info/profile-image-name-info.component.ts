import { NgOptimizedImage } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonIcon,
} from "@ionic/angular/standalone";
import { GoalPipe } from "../../../../shared/pipes/plan-goal.translate.pipe";

@Component({
	selector: "app-profile-image-name-info",
	standalone: true,
	imports: [
		NgOptimizedImage,
		IonCardContent,
		IonIcon,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardSubtitle,
		GoalPipe,
	],
	templateUrl: "./profile-image-name-info.component.html",
	styleUrl: "../../pages/profile.page.scss",
})
export class ProfileImageNameComponent {
	@Input() name!: string;
	@Input() age!: number;
	@Input() imageUrl!: string;
	@Input() planGoal!: string;
}
