import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule, LoadingController } from "@ionic/angular";
import { Select, Store } from "@ngxs/store";
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
	imports: [CommonModule, IonicModule, RouterModule, GoalTranslatorPipe],
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
	) {
		const user = this.store.selectSnapshot(AuthState.getUser) as User | null;
		if (user?._id) {
			this.userId = user._id;
			console.log("🔑 ID de usuario obtenido de AuthState:", this.userId);
		} else {
			this.userId = localStorage.getItem("userId") || "unknown_user";
			console.warn("⚠️ No se encontró usuario en AuthState, usando ID de localStorage:", this.userId);
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
					console.log("🔄 ID de usuario actualizado desde AuthState:", this.userId);
				} else {
					console.error("❌ No se pudo obtener un ID de usuario válido");
					throw new Error("Usuario no identificado");
				}
			}

			console.log("📋 Obteniendo datos para el usuario:", this.userId);

			this.store.dispatch(new LoadUser(this.userId)).subscribe(result => {
				const user = this.store.selectSnapshot(UserState.getUser);
				if (user?.planId) {
					console.log("📝 Plan ID del usuario:", user.planId);
					this.store.dispatch(new LoadPlan(user.planId));
				} else {
					console.log("ℹ️ El usuario no tiene un plan asignado");
				}
			});

			this.plan$.subscribe(plan => {
				this.plan = plan;
				if (plan) {
					console.log("✅ Plan cargado desde el state:", plan.name);
				}
			});

			this.checkUserEnrollments();
		} catch (error) {
			console.error("❌ Error al cargar el plan asignado:", error);
		} finally {
			loading.dismiss();
		}
	}

	/**
	 * Verifica si el usuario está inscrito en algún horario
	 */
	private checkUserEnrollments(): void {
		const schedules = this.store.selectSnapshot(ScheduleState.getSchedules);

		if (!schedules || schedules.length === 0) {
			console.log("No hay horarios cargados, verificando más tarde...");

			setTimeout(() => {
				const updatedSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);
				this.checkEnrollmentsFromSchedules(updatedSchedules);
			}, 1000);

			return;
		}

		this.checkEnrollmentsFromSchedules(schedules);
	}

	/**
	 * Comprueba las inscripciones del usuario a partir de los horarios proporcionados
	 */
	private checkEnrollmentsFromSchedules(schedules: Schedule[]): void {
		if (!schedules || !Array.isArray(schedules)) {
			console.log("No hay horarios disponibles para verificar inscripciones");
			return;
		}

		this.userHasEnrollments = schedules.some(
			(schedule) => schedule.clients && Array.isArray(schedule.clients) && schedule.clients.includes(this.userId),
		);

		console.log(`Usuario ${this.userHasEnrollments ? "está" : "no está"} inscrito en horarios`);
	}



	/**
	 * Obtiene el texto descriptivo del nivel de entrenamiento
	 */
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

	/**
	 * Convierte un plan del formato del módulo de perfil al formato que usa este componente
	 */
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
