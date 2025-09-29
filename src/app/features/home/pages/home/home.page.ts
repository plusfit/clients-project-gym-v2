import { AsyncPipe, DatePipe, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { User } from "@feature/auth/interfaces/user.interface";
import { GetCurrentUser } from "@feature/auth/state/auth.actions";
import { AuthState } from "@feature/auth/state/auth.state";
import { HomeState, LoadRoutineForToday } from "@feature/home/state/home.state";
import { RewardsService } from "@feature/rewards/services/rewards.service";
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
import { ExchangeStatus } from "@shared/enums/exchange-status.enum";
import { DayTranslatePipe } from "@shared/pipes/day-translate.pipe";
import { Observable, Subject, Subscription, combineLatest, interval } from "rxjs";
import { distinctUntilChanged, map, skip, take, takeUntil } from "rxjs/operators";
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
	private destroy$ = new Subject<void>();

	// Rewards data
	availableRewardsCount = 0;
	userPoints = 0;

	@Select(HomeState.getRoutine) routine$!: Observable<SubRoutine | null>;
	@Select(HomeState.isLoading) loading$!: Observable<boolean>;
	@Select(HomeState.getError) error$!: Observable<string | null>;
	@Select(HomeState.getMotivationalMessage)
	motivationalMessage$!: Observable<string>;
	@Select(AuthState.getUser) user$!: Observable<User | null>;

	constructor(
		private store: Store,
		private router: Router,
		private scheduleFacade: ScheduleFacadeService,
		private rewardsService: RewardsService,
	) {}

	ngOnInit(): void {
		// Reloj en tiempo real con actualización cada segundo
		this.clockSubscription = interval(1000).subscribe(() => {
			this.currentTime = new Date();
		});

		// Cargar schedules si no están disponibles y luego cargar la rutina
		this.loadInitialData();

		// Setup rewards subscription
		this.setupRewardsSubscription();

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
		this.destroy$.next();
		this.destroy$.complete();

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

		// Recargar premios disponibles cada vez que se entre a la página
		this.refreshRewardsData();
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

	/**
	 * Setup rewards subscription to calculate available rewards
	 */
	private setupRewardsSubscription(): void {
		// Combinar user, rewards y exchanges para calcular premios disponibles
		this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
			if (user) {
				// Obtener puntos del usuario
				this.userPoints = (user as User & { availablePoints?: number }).availablePoints || 0;

				// Cargar rewards y calcular disponibles
				this.calculateAvailableRewards(user._id);
			} else {
				this.userPoints = 0;
				this.availableRewardsCount = 0;
			}
		});
	}

	/**
	 * Calcula los premios disponibles para el usuario
	 */
	private calculateAvailableRewards(userId: string): void {
		// Obtener rewards y exchanges en paralelo
		combineLatest([
			this.rewardsService.getAllRewards(),
			this.rewardsService.getClientExchanges(userId)
		]).pipe(
			takeUntil(this.destroy$),
			map(([rewards, exchanges]) => {
				const completedExchanges = exchanges.filter(exchange => exchange.status === ExchangeStatus.COMPLETED || exchange.status === ExchangeStatus.PENDING);

				// Filtrar rewards disponibles: no deshabilitados, suficientes puntos, y no canjeados
				const availableRewards = rewards.filter(reward => {
					const isEnabled = !reward.disabled;
					const hasEnoughPoints = this.userPoints >= reward.pointsRequired;
					const isNotExchanged = !completedExchanges.some(exchange => exchange.rewardId === reward.id);

					return isEnabled && hasEnoughPoints && isNotExchanged;
				});

				return availableRewards.length;
			})
		).subscribe(count => {
			this.availableRewardsCount = count;
		});
	}

	/**
	 * Navega a la página de rewards
	 */
	goToRewards(): void {
		this.router.navigate(["/cliente/premios"]);
	}

	/**
	 * Actualiza los datos de premios al entrar a la página
	 */
	private refreshRewardsData(): void {
		const user = this.store.selectSnapshot(AuthState.getUser);
		if (user) {
			// Actualizar puntos del usuario
			this.store.dispatch(new GetCurrentUser());

			// Recalcular premios disponibles con datos frescos
			this.calculateAvailableRewards(user._id);
		}
	}
}
