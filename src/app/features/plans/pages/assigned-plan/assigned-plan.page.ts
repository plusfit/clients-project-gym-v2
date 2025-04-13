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
import { Schedule, ScheduleState } from "../../../schedule/state/schedule.state";
import { Plan } from "../../interfaces/plan.interface";
import { Plan as ProfilePlan } from "../../../profile/interfaces/plan.interface";
import { LoadPlan, LoadUser } from "../../../profile/state/user.actions";
import { UserState } from "../../../profile/state/user.state";

@Component({
	selector: "app-assigned-plan",
	standalone: true,
	imports: [CommonModule, IonicModule, RouterModule, GoalTranslatorPipe],
	templateUrl: './assigned-plan.page.html',
	styleUrls: ['./assigned-plan.page.scss']
})

export class AssignedPlanPage implements OnInit {
	// Seleccionar el plan del UserState y convertirlo al formato que necesita este componente
	plan$!: Observable<Plan | null>;
	@Select(UserState.isLoading) loading$!: Observable<boolean>;

	plan: Plan | null = null;
	private userId: string;
	userHasEnrollments = false;

	constructor(
		private loadingCtrl: LoadingController,
		private store: Store,
	) {
		// Obtener el userId del AuthState
		const user = this.store.selectSnapshot(AuthState.getUser) as User | null;
		if (user?._id) {
			this.userId = user._id;
			console.log("🔑 ID de usuario obtenido de AuthState:", this.userId);
		} else {
			// Fallback solo si no hay usuario en AuthState
			this.userId = localStorage.getItem("userId") || "unknown_user";
			console.warn("⚠️ No se encontró usuario en AuthState, usando ID de localStorage:", this.userId);
		}

		// Configurar el observable para convertir el formato del plan
		this.plan$ = this.store.select(UserState.getPlan).pipe(
			map((profilePlan: ProfilePlan | null) => {
				if (!profilePlan) return null;
				
				// Convertir del formato de perfil al formato que espera este componente
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
			// Verificar que tenemos un ID de usuario válido
			if (!this.userId || this.userId === "unknown_user") {
				// Intentar obtener el ID del AuthState nuevamente en caso de que haya cambiado
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

			// Despachar acción para cargar los datos del usuario
			this.store.dispatch(new LoadUser(this.userId)).subscribe(result => {
				// Obtener la información del usuario, incluido su planId
				const user = this.store.selectSnapshot(UserState.getUser);
				if (user?.planId) {
					console.log("📝 Plan ID del usuario:", user.planId);
					// Cargar el plan usando el planId del usuario
					this.store.dispatch(new LoadPlan(user.planId));
				} else {
					console.log("ℹ️ El usuario no tiene un plan asignado");
				}
			});

			// Suscribirse al plan$ para actualizar la propiedad plan cuando cambie el estado
			this.plan$.subscribe(plan => {
				this.plan = plan;
				if (plan) {
					console.log("✅ Plan cargado desde el state:", plan.name);
				}
			});

			// Verificar si el usuario ya está inscrito en algún horario
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
		// Obtener todos los horarios disponibles
		const schedules = this.store.selectSnapshot(ScheduleState.getSchedules);

		// Si no hay horarios cargados, intentar obtenerlos del estado
		if (!schedules || schedules.length === 0) {
			console.log("No hay horarios cargados, verificando más tarde...");

			// Intentar verificar después que se carguen
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

		// Verificar si el usuario está inscrito en algún horario
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
		// Crear una estructura compatible con lo que espera el componente
		return {
			_id: profilePlan.id,
			name: profilePlan.name,
			description: "Plan de entrenamiento personalizado.",
			level: profilePlan.experienceLevel as "beginner" | "intermediate" | "advanced",
			daysPerWeek: profilePlan.days || 3,
			goal: profilePlan.goal || "Mejorar condición física",
			duration: 4, // Valor predeterminado
			exercises: [], // Por defecto sin ejercicios
			createdAt: profilePlan.createdAt?.toString(),
			updatedAt: profilePlan.updatedAt?.toString()
		};
	}

	/**
	 * Obtiene los días únicos para los que hay ejercicios
	 */
	getDayGroups(): number[] {
		if (!this.plan?.exercises || !this.plan.exercises.length) return [1, 2, 3];

		const uniqueDays = [...new Set(this.plan.exercises.map((ex) => ex.day))];
		return uniqueDays.sort((a, b) => a - b);
	}

	/**
	 * Filtra los ejercicios para un día específico
	 */
	getExercisesForDay(day: number) {
		return this.plan?.exercises?.filter((ex) => ex.day === day) || [];
	}
}
