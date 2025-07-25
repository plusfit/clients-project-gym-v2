import { AsyncPipe, DatePipe, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { HomeState, LoadRoutineForToday } from "@feature/home/state/home.state";
import { SubRoutine } from "@feature/routine/interfaces/routine.interface";
import { ScheduleFacadeService } from "@feature/schedule/services/schedule-facade.service";
import { ScheduleState } from "@feature/schedule/state/schedule.state";
import {
	IonButton,
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
import { Observable, Subscription, interval } from "rxjs";
import { distinctUntilChanged, skip, take } from "rxjs/operators";
import { RoutineCardComponent } from "../../components/routine-card/routine-card.component";

@Component({
	selector: "app-home",
	templateUrl: "./home.page.html",
	styleUrls: ["./home.page.scss"],
	imports: [
		IonContent,
		IonButton,
		IonIcon,
		IonSpinner,
		DatePipe,
		RoutineCardComponent,
		IonRow,
		IonCol,
		AsyncPipe,
		DayTranslatePipe,
		NgIf,
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

	constructor(
		private store: Store,
		private router: Router,
		private scheduleFacade: ScheduleFacadeService,
	) {}

	ngOnInit(): void {
		// Reloj en tiempo real con actualización cada segundo
		this.clockSubscription = interval(1000).subscribe(() => {
			this.currentTime = new Date();
		});

		// Cargar schedules si no están disponibles y luego cargar la rutina
		this.loadInitialData();

		// Escuchar cambios en el estado de schedules y recargar la rutina
		this.schedulesSubscription = this.store.select(ScheduleState.getSchedules).pipe(
			skip(1), // Saltar la primera emisión (inicial)
			distinctUntilChanged((prev, curr) => {
				// Comparar solo los clientes de cada schedule para detectar cambios de inscripción
				const prevClients = prev.map(s => ({ id: s._id, clients: s.clients }));
				const currClients = curr.map(s => ({ id: s._id, clients: s.clients }));
				return JSON.stringify(prevClients) === JSON.stringify(currClients);
			})
		).subscribe(() => {
			// Solo recargar si no está actualmente cargando
			const isCurrentlyLoading = this.store.selectSnapshot(state => state.home.loading);
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
			this.store.select(ScheduleState.getSchedules).pipe(
				skip(1), // Saltar el estado inicial vacío
				take(1)  // Tomar solo la primera emisión después de cargar
			).subscribe(() => {
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

	onExerciseClicked(exercise: any) {
		this.router.navigate(["/cliente/rutinas", exercise.id]);
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
}
