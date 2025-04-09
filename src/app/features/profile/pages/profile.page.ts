import { AsyncPipe, CommonModule, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { User } from "@feature/profile/interfaces/user.interface";
import { IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { Observable, switchMap } from "rxjs";
import { ProfileImageNameComponent } from "../components/profile-image-name-info/profile-image-name-info.component";
import { ProfilePersonalInfoComponent } from "../components/profile-personal-info/profile-personal-info.component";
import { ProfilePlanInfoComponent } from "../components/profile-plan-info/profile-plan-info.component";
import { Plan } from "../interfaces/plan.interface";
import { LoadPlan, LoadUser } from "../state/user.actions";
import { UserState } from "../state/user.state";

@Component({
	selector: "app-profile",
	templateUrl: "./profile.page.html",
	styleUrls: ["./profile.page.scss"],
	imports: [
		IonContent,
		AsyncPipe,
		IonHeader,
		IonToolbar,
		IonTitle,
		ProfileImageNameComponent,
		ProfilePersonalInfoComponent,
		ProfilePlanInfoComponent,
		CommonModule,
		IonSpinner,
	],
	standalone: true,
})
export class ProfilePage implements OnInit {
	@Select(UserState.getUser) user$!: Observable<User | null>;
	@Select(UserState.getPlan) plan$!: Observable<Plan | null>;
	@Select(UserState.isLoading) loading$!: Observable<boolean>;

	age: number | null = null;
	id: string | null = null;

	constructor(private store: Store) {}

	ngOnInit(): void {
		this.id = "67c1e9620dd078c1a869dbc2";
		this.store.dispatch(new LoadUser(this.id));

		this.user$.subscribe((user) => {
			if (user?.userInfo?.dateBirthday) {
				this.age = this.calculateAge(new Date(user.userInfo.dateBirthday));
			}

			if (user?.planId) {
				this.store.dispatch(new LoadPlan(user.planId));
			}
		});
	}

	calculateAge(birthday: Date): number {
		const today = new Date();
		let age = today.getFullYear() - birthday.getFullYear();
		const m = today.getMonth() - birthday.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
			age--;
		}
		return age;
	}

	formatDate(dateString: string): string {
		if (!dateString) return "";

		const date = new Date(dateString);
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return date.toLocaleDateString("es-ES", options);
	}
}
