import { Component, Input } from "@angular/core";
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonPopover } from "@ionic/angular/standalone";

@Component({
	selector: "app-profile-personal-info",
	standalone: true,
	imports: [IonCardContent, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonPopover],
	templateUrl: "./profile-personal-info.component.html",
	styleUrl: "../../pages/profile.page.scss",
})
export class ProfilePersonalInfoComponent {
	@Input() email!: string;
	@Input() phone!: string;
	@Input() medicalSociety!: string;

	isPopoverOpen = false;
	popoverEvent: Event | null = null;
	private popoverTimeout: any;

	showFullEmail(ev: Event) {
		this.popoverEvent = ev;
		this.isPopoverOpen = true;

		if (this.popoverTimeout) {
			clearTimeout(this.popoverTimeout);
		}

		this.popoverTimeout = setTimeout(() => {
			this.isPopoverOpen = false;
		}, 3000);
	}

	onPopoverDismissed() {
		this.isPopoverOpen = false;
		if (this.popoverTimeout) {
			clearTimeout(this.popoverTimeout);
		}
	}
}
