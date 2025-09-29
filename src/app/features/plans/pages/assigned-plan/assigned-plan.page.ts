import { CommonModule } from "@angular/common";
import { NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RouterLink } from "@angular/router";
import { UserService } from "@feature/profile/services/user.service";
import { ScheduleFacadeService } from "@feature/schedule/services/schedule-facade.service";
import { AlertController, LoadingController } from "@ionic/angular/standalone";
import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonContent,
	IonIcon,
	IonTitle,
	IonToolbar,
} from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { addIcons } from "ionicons";
import {
	bodyOutline,
	calendarNumberOutline,
	createOutline,
	fitnessOutline,
	helpCircleOutline,
	layersOutline,
	personOutline,
	playOutline,
	ribbonOutline,
	shapesOutline,
	trophyOutline,
	warningOutline,
} from "ionicons/icons";
import { Observable, Subject, Subscription } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { CategoryTranslatorPipe } from "../../../../shared/pipes/category-translator.pipe";
import { GoalTranslatorPipe } from "../../../../shared/pipes/goal-translator.pipe";
import { InjuryTypeTranslatorPipe } from "../../../../shared/pipes/injury-type-translator.pipe";
import { PlanTypeTranslatorPipe } from "../../../../shared/pipes/plan-type-translator.pipe";
import { User } from "../../../auth/interfaces/user.interface";
import { AuthState } from "../../../auth/state/auth.state";
import { Plan as ProfilePlan } from "../../../profile/interfaces/plan.interface";
import { UserPlanService } from "../../../profile/services/user-plan.service";
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
		CategoryTranslatorPipe,
		PlanTypeTranslatorPipe,
		InjuryTypeTranslatorPipe,
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
		AppHeaderComponent,
	],
	templateUrl: "./assigned-plan.page.html",
	styleUrls: ["./assigned-plan.page.scss"],
})
export class AssignedPlanPage implements OnInit, OnDestroy {
	plan$!: Observable<Plan | null>;
	@Select(UserState.isLoading) loading$!: Observable<boolean>;

	plan: Plan | null = null;
	private userId: string;
	userHasEnrollments = false;
	private destroy$ = new Subject<void>();
	private scheduleSub: Subscription | null = null;

	// Propiedades para días disponibles
	availableDays: number | null = null;
	totalDays: number | null = null;
	loadingAvailableDays = false;

	constructor(
		private loadingCtrl: LoadingController,
		private alertCtrl: AlertController,
		private store: Store,
		private userService: UserService,
		private scheduleFacade: ScheduleFacadeService,
		private userPlanService: UserPlanService,
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
			}),
		);
		addIcons({
			ribbonOutline,
			calendarNumberOutline,
			layersOutline,
			shapesOutline,
			bodyOutline,
			personOutline,
			trophyOutline,
			playOutline,
			createOutline,
			fitnessOutline,
			helpCircleOutline,
			warningOutline,
		});
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

			this.store.dispatch(new LoadUser(this.userId)).subscribe((result) => {
				const user = this.store.selectSnapshot(UserState.getUser);
				if (user?.planId) {
					this.store.dispatch(new LoadPlan(user.planId));
				}
			});

			this.plan$.subscribe((plan) => {
				this.plan = plan;
			});

			this.scheduleFacade.loadSchedules();
			this.subscribeToSchedules();
			this.loadAvailableDays();
		} catch (error) {
		} finally {
			loading.dismiss();
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private subscribeToSchedules(): void {
		this.store
			.select(ScheduleState.getSchedules)
			.pipe(takeUntil(this.destroy$))
			.subscribe((schedules) => {
				this.checkEnrollmentsFromSchedules(schedules);
			});
	}

	private checkEnrollmentsFromSchedules(schedules: Schedule[]): void {
		if (!this.userId || this.userId === "unknown_user" || !schedules || !Array.isArray(schedules)) {
			this.userHasEnrollments = false;
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

	private loadAvailableDays(): void {
		if (this.userId && this.userId !== "unknown_user") {
			this.loadingAvailableDays = true;

			this.userPlanService
				.getAvailableDays(this.userId)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (data) => {
						if (data) {
							this.availableDays = data.availableDays;
							this.totalDays = data.totalDays;
						}
						this.loadingAvailableDays = false;
					},
					error: () => {
						this.loadingAvailableDays = false;
					},
				});
		}
	}

	private convertProfilePlanToPlan(profilePlan: ProfilePlan): Plan {
		return {
			_id: profilePlan.id,
			name: profilePlan.name,
			type: profilePlan.type,
			category: profilePlan.category,
			goal: profilePlan.goal || "Mejorar condición física",
			injuryType: profilePlan.injuryType,
			experienceLevel: profilePlan.experienceLevel as "beginner" | "intermediate" | "advanced",
			minAge: profilePlan.minAge,
			maxAge: profilePlan.maxAge,
			includesCoach: profilePlan.includesCoach,
			tags: profilePlan.tags,
			days: profilePlan.days || 3,
			createdAt: profilePlan.createdAt?.toString(),
			updatedAt: profilePlan.updatedAt?.toString(),
		};
	}

	async showAvailableDaysHelp() {
		const alert = await this.alertCtrl.create({
			header: "Días Disponibles",
			message: "Los días disponibles representan la cantidad de días restantes del plan que has abonado.",
			buttons: [
				{
					text: "Entendido",
					role: "cancel",
				},
			],
			cssClass: "help-alert",
		});

		await alert.present();
	}

	getDaysColorClass(): string {
		if (this.availableDays === null) return "";

		if (this.availableDays === 0) {
			return "danger"; // Rojo para 0 días
		}
		if (this.availableDays < 5) {
			return "warning-low"; // Rojizo para menos de 5
		}
		if (this.availableDays < 10) {
			return "warning"; // Ámbar para menos de 10
		}
		return "success"; // Verde para 10 o más
	}
}
