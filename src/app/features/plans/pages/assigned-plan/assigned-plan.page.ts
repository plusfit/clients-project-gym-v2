import { CommonModule } from "@angular/common";
import { NgIf } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RouterLink } from "@angular/router";
import { UserService } from "@feature/profile/services/user.service";
import { IonicModule, LoadingController } from "@ionic/angular";
import {IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GoalTranslatorPipe } from "../../../../shared/pipes/goal-translator.pipe";
import { User } from "../../../auth/interfaces/user.interface";
import { AuthState } from "../../../auth/state/auth.state";
import { Plan as ProfilePlan } from "../../../profile/interfaces/plan.interface";
import { LoadPlan, LoadUser } from "../../../profile/state/user.actions";
import { UserState } from "../../../profile/state/user.state";
import { Schedule, ScheduleState } from "../../../schedule/state/schedule.state";
import { Plan } from "../../interfaces/plan.interface";

@Component({
	selector: "app-assigned-plan",
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		GoalTranslatorPipe,
		IonContent,
		IonCard,
		IonCardContent,
		IonCardHeader,
		IonCardSubtitle,
		IonCardTitle,
		IonButton,
		IonIcon,
		RouterLink,
		NgIf,
		AppHeaderComponent
	],
	templateUrl: './assigned-plan.page.html',
	styleUrls: ['./assigned-plan.page.scss']
})

export class AssignedPlanPage implements OnInit {
	plan$!: Observable<Plan | null>;
	@Select(UserState.isLoading) loading$!: Observable<boolean>;

	plan: Plan | null = null;
	private userId: string;
	userHasEnrollments = false;

	constructor(
		private loadingCtrl: LoadingController,
		private store: Store,
		private userService: UserService
	) {
		const user = this.store.selectSnapshot(AuthState.getUser) as User | null;
		if (user?._id) {
			this.userId = user._id;
		} else {
			this.userId = localStorage.getItem("userId") || "unknown_user";
		}

		this.plan$ = this.store.select(UserState.getPlan).pipe(
			map((profilePlan: ProfilePlan | null) => {
				if (!profilePlan) return null;

				return this.convertProfilePlanToPlan(profilePlan);
			})
		);
	}

	async ngOnInit() {
		const loading = await this.loadingCtrl.create({
			message: "Cargando tu plan...",
			spinner: "circles",
			cssClass: "loading-content",
		});

		await loading.present();

		try {
			if (!this.userId || this.userId === "unknown_user") {
				const user = this.store.selectSnapshot(AuthState.getUser) as User | null;
				if (user?._id) {
					this.userId = user._id;
				} else {
					throw new Error("Usuario no identificado");
				}
			}

			this.store.dispatch(new LoadUser(this.userId)).subscribe(result => {
				const user = this.store.selectSnapshot(UserState.getUser);
				if (user?.planId) {
					this.store.dispatch(new LoadPlan(user.planId));
				}
			});

			this.plan$.subscribe(plan => {
				this.plan = plan;
			});

			this.checkUserEnrollments();
		} catch (error) {
		} finally {
			loading.dismiss();
		}
	}

	private checkUserEnrollments(): void {
		const schedules = this.store.selectSnapshot(ScheduleState.getSchedules);

		if (!schedules || schedules.length === 0) {
			setTimeout(() => {
				const updatedSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);
				this.checkEnrollmentsFromSchedules(updatedSchedules);
			}, 1000);

			return;
		}

		this.checkEnrollmentsFromSchedules(schedules);
	}

	private checkEnrollmentsFromSchedules(schedules: Schedule[]): void {
		if (!schedules || !Array.isArray(schedules)) {
			return;
		}

		this.userHasEnrollments = schedules.some(
			(schedule) => schedule.clients && Array.isArray(schedule.clients) && schedule.clients.includes(this.userId),
		);
	}

	getLevelText(level: string): string {
		switch (level) {
			case "beginner":
				return "Principiante";
			case "intermediate":
				return "Intermedio";
			case "advanced":
				return "Avanzado";
			default:
				return level || "Principiante";
		}
	}

	private convertProfilePlanToPlan(profilePlan: ProfilePlan): Plan {
		return {
			_id: profilePlan.id,
			name: profilePlan.name,
			description: "Plan de entrenamiento personalizado.",
			level: profilePlan.experienceLevel as "beginner" | "intermediate" | "advanced",
			daysPerWeek: profilePlan.days || 3,
			goal: profilePlan.goal || "Mejorar condición física",
			createdAt: profilePlan.createdAt?.toString(),
			updatedAt: profilePlan.updatedAt?.toString()
		};
	}
}
