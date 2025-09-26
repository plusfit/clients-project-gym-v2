import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from "@ionic/angular/standalone";
import { ExperienceLevelPipe } from "@shared/pipes/experience-level-translate.pipe";
import { Subject } from "rxjs";

@Component({
	selector: "app-profile-plan-info",
	standalone: true,
	imports: [CommonModule, IonCardContent, IonIcon, IonCard, IonCardHeader, IonCardTitle, ExperienceLevelPipe],
	templateUrl: "./profile-plan-info.component.html",
	styleUrl: "../../pages/profile.page.scss",
})
export class ProfilePlanInfoComponent implements OnDestroy {
	@Input() planName = "";
	@Input() planDays = 0;
	@Input() planLevel = "";

	private destroy$ = new Subject<void>();

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
