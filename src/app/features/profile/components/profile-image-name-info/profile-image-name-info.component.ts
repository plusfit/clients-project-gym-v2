import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
	IonCard,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonIcon,
	IonButton,
	IonSpinner
} from "@ionic/angular/standalone";

@Component({
	selector: "app-profile-image-name-info",
	standalone: true,
	imports: [CommonModule, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonSpinner],
	templateUrl: "./profile-image-name-info.component.html",
	styleUrls: ["../../pages/profile.page.scss", "./profile-image-name-info.component.scss"],
})
export class ProfileImageNameComponent {
	@Input() name!: string;
	@Input() age!: number;
	@Input() imageUrl!: string;
	@Input() planGoal!: string; // Añadido para evitar el error de binding en profile.page.html, aunque ya no se use en este componente.
	@Output() imageClick = new EventEmitter<void>();

	isImageLoaded = false;

	onImageLoad(): void {
		this.isImageLoaded = true;
	}

	onImageClick(): void {
		this.imageClick.emit();
	}
}
