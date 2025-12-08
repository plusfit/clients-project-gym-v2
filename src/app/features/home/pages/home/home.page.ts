import { AsyncPipe, DatePipe, NgFor, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { User } from "@feature/auth/interfaces/user.interface";
import { AuthState } from "@feature/auth/state/auth.state";
import { HomeState, LoadRoutineForToday } from "@feature/home/state/home.state";
import { UserPlanService } from "@feature/profile/services/user-plan.service";
import { SubRoutine } from "@feature/routine/interfaces/routine.interface";
import { ScheduleFacadeService } from "@feature/schedule/services/schedule-facade.service";
import { Schedule } from "@feature/schedule/state/schedule.state";
import { ScheduleState } from "@feature/schedule/state/schedule.state";
import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCol,
	IonContent,
	IonIcon,
	IonRow,
	IonSpinner,
	ViewWillEnter,
} from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { DayTranslatePipe } from "@shared/pipes/day-translate.pipe";
import { addIcons } from "ionicons";
import { warningOutline } from "ionicons/icons";
import { Observable, Subscription, interval, map } from "rxjs";
import { distinctUntilChanged, skip, take } from "rxjs/operators";
import { RoutineCardComponent } from "../../components/routine-card/routine-card.component";

@Component({
	selector: "app-home",
	templateUrl: "./home.page.html",
	styleUrls: ["./home.page.scss"],
	imports: [
		IonContent,
		IonButton,
		IonCard,
		IonCardContent,
		IonIcon,
		IonSpinner,
		DatePipe,
		RoutineCardComponent,
		IonRow,
		IonCol,
		AsyncPipe,
		DayTranslatePipe,
		NgIf,
		NgFor,
		RouterLink,
		AppHeaderComponent,
	],
	standalone: true,
})
export class HomePage implements OnInit, OnDestroy, ViewWillEnter {
	today: Date = new Date();
	currentTime: Date = new Date();
	private clockSubscription!: Subscription;
	private schedulesSubscription!: Subscription;

	@Select(HomeState.getRoutine) routine$!: Observable<SubRoutine | null>;
	@Select(HomeState.isLoading) loading$!: Observable<boolean>;
	@Select(HomeState.getError) error$!: Observable<string | null>;
	@Select(HomeState.getMotivationalMessage)
	motivationalMessage$!: Observable<string>;
	@Select(ScheduleState.getSchedules) schedules$!: Observable<Schedule[]>;

	// Propiedades para días disponibles
	availableDays: number | null = null;
	showPaymentWarning = false;

	constructor(
		private store: Store,
		private router: Router,
		private scheduleFacade: ScheduleFacadeService,
		private userPlanService: UserPlanService,
	) {
		addIcons({
			warningOutline,
		});
	}

	/**
	 * Obtiene la información de días deshabilitados para mostrar en el banner
	 */
	getDisabledDaysInfo(): Observable<{day: string, reason: string}[]> {
		return this.schedules$.pipe(
			map(schedules => {
				if (!schedules) return [];
				
				const disabledDaysMap = new Map<string, string>();
				
				for (const schedule of schedules) {
					if (schedule.disabled && schedule.disabledReason) {
						const dayName = schedule.day; // Usar directamente el nombre del día que ya viene como string
						// Solo agregar si el día no está ya en el mapa
						if (!disabledDaysMap.has(dayName)) {
							disabledDaysMap.set(dayName, schedule.disabledReason);
						}
					}
				}
				
				// Convertir el mapa a array
				return Array.from(disabledDaysMap.entries()).map(([day, reason]) => ({
					day,
					reason
				}));
			})
		);
	}

	ngOnInit(): void {
		// Reloj en tiempo real con actualización cada segundo
		this.clockSubscription = interval(1000).subscribe(() => {
			this.currentTime = new Date();
		});

		// Cargar schedules si no están disponibles y luego cargar la rutina
		this.loadInitialData();

		// Cargar días disponibles
		this.loadAvailableDays();

		// Escuchar cambios en el estado de schedules y recargar la rutina
		this.schedulesSubscription = this.store
			.select(ScheduleState.getSchedules)
			.pipe(
				skip(1), // Saltar la primera emisión (inicial)
				distinctUntilChanged((prev, curr) => {
					// Comparar solo los clientes de cada schedule para detectar cambios de inscripción
					const prevClients = prev.map((s) => ({ id: s._id, clients: s.clients }));
					const currClients = curr.map((s) => ({ id: s._id, clients: s.clients }));
					return JSON.stringify(prevClients) === JSON.stringify(currClients);
				}),
			)
			.subscribe(() => {
				// Solo recargar si no está actualmente cargando
				const isCurrentlyLoading = this.store.selectSnapshot((state) => state.home.loading);
				if (!isCurrentlyLoading) {
					this.store.dispatch(new LoadRoutineForToday());
				}
			});
	}

	private loadInitialData(): void {
		const currentSchedules = this.store.selectSnapshot(ScheduleState.getSchedules);

		if (!currentSchedules || currentSchedules.length === 0) {
			// Si no hay schedules cargados, cargarlos primero
			this.scheduleFacade.loadSchedules();

			// Esperar a que se carguen los schedules antes de cargar la rutina
			this.store
				.select(ScheduleState.getSchedules)
				.pipe(
					skip(1), // Saltar el estado inicial vacío
					take(1), // Tomar solo la primera emisión después de cargar
				)
				.subscribe(() => {
					this.store.dispatch(new LoadRoutineForToday());
				});
		} else {
			// Si ya hay schedules, cargar la rutina directamente
			this.store.dispatch(new LoadRoutineForToday());
		}
	}

	ngOnDestroy(): void {
		if (this.clockSubscription) {
			this.clockSubscription.unsubscribe();
		}
		if (this.schedulesSubscription) {
			this.schedulesSubscription.unsubscribe();
		}
	}

	ionViewWillEnter(): void {
		// Recargar datos cuando el usuario regrese a esta página
		this.loadInitialData();
	}

	reloadRoutine() {
		this.store.dispatch(new LoadRoutineForToday());
	}

	/**
	 * Navega a la página de horarios disponibles
	 */
	goToSchedules() {
		this.router.navigate(["/cliente/horarios"]);
	}

	dismissWarning() {
		this.showPaymentWarning = false;
	}

	private loadAvailableDays(): void {
		const user = this.store.selectSnapshot(AuthState.getUser) as User | null;

		if (user?._id) {
			this.userPlanService.getAvailableDays(user._id).subscribe({
				next: (data) => {
					if (data) {
						this.availableDays = data.availableDays;
						this.showPaymentWarning = data.availableDays < 10;
					}
				},
				error: () => {
					// Error silencioso, no mostrar advertencia si no se puede cargar
					this.showPaymentWarning = false;
				},
			});
		}
	}
}
