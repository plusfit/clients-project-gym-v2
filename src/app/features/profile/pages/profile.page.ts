import { AsyncPipe, CommonModule, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { UserRole } from '@feature/auth/interfaces/user.interface';
import { Logout, UpdateUser } from '@feature/auth/state/auth.actions';
import { AuthState } from '@feature/auth/state/auth.state';
import { User } from "@feature/profile/interfaces/user.interface";
import { IonButton, IonContent, IonSpinner } from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { Observable, switchMap, tap } from "rxjs";
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
		ProfileImageNameComponent,
		ProfilePersonalInfoComponent,
		ProfilePlanInfoComponent,
		CommonModule,
		IonSpinner,
		IonButton,
		AppHeaderComponent,
	],
	standalone: true,
})
export class ProfilePage implements OnInit {
	@Select(UserState.getUser) user$!: Observable<User | null>;
	@Select(UserState.getPlan) plan$!: Observable<Plan | null>;
	@Select(UserState.isLoading) loading$!: Observable<boolean>;

	age: number | null = null;
	id: string | null = null;

	constructor(private store: Store, private router: Router) {}

	ngOnInit(): void {
		const authUser = this.store.selectSnapshot(AuthState.getUser);
		this.id = authUser?._id || null;
		if (this.id) {
			this.store.dispatch(new LoadUser(this.id));
			this.user$.pipe().subscribe((user) => {
				if (user) {
					const savedAvatar = localStorage.getItem(`avatar_url_${this.id}`);

					const userInfo = {
						_id: (user.userInfo as any)._id || '',
						...user.userInfo,
						historyofPathologicalLesions: String(user.userInfo.historyofPathologicalLesions),
						cardiacHistory: String(user.userInfo.cardiacHistory),
						respiratoryHistory: String(user.userInfo.respiratoryHistory),
						surgicalHistory: String(user.userInfo.surgicalHistory),
						avatarUrl: savedAvatar || user.userInfo.avatarUrl
					};

					const mappedUser = {
						...user,
						role: (user.role as keyof typeof UserRole) in UserRole ? UserRole[user.role as keyof typeof UserRole] : UserRole.USER,
						userInfo
					};
					this.store.dispatch(new UpdateUser(mappedUser));
				}
			});
		}
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

	logout(): void {
		this.store.dispatch(new Logout()).pipe(
			tap(() => {
				this.router.navigate(['/login']);
			})
		).subscribe();
	}
}
