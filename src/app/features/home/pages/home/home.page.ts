import { AsyncPipe, DatePipe, NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { HomeState, LoadRoutineForToday } from "@feature/home/state/home.state";
import { SubRoutine } from "@feature/routine/interfaces/routine.interface";
import {
	IonButton,
	IonCol,
	IonContent,
	IonIcon,
	IonRow,
	IonSpinner,
} from "@ionic/angular/standalone";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { DayTranslatePipe } from "@shared/pipes/day-translate.pipe";
import { Observable, Subscription, interval } from "rxjs";
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
export class HomePage implements OnInit, OnDestroy {
	today: Date = new Date();
	currentTime: Date = new Date();
	private clockSubscription!: Subscription;

	@Select(HomeState.getRoutine) routine$!: Observable<SubRoutine | null>;
	@Select(HomeState.isLoading) loading$!: Observable<boolean>;
	@Select(HomeState.getError) error$!: Observable<string | null>;
	@Select(HomeState.getMotivationalMessage)
	motivationalMessage$!: Observable<string>;

	constructor(
		private store: Store,
		private router: Router,
	) {}

	ngOnInit(): void {
		// Reloj en tiempo real con actualización cada segundo
		this.clockSubscription = interval(1000).subscribe(() => {
			this.currentTime = new Date();
		});

		// Cargar la rutina para hoy
		this.store.dispatch(new LoadRoutineForToday());
	}

	ngOnDestroy(): void {
		if (this.clockSubscription) {
			this.clockSubscription.unsubscribe();
		}
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
