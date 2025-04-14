import { AsyncPipe, NgClass, NgIf, NgOptimizedImage, UpperCasePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonContent,
	IonIcon,
	IonSpinner,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
	alertCircleOutline,
	arrowForward,
	barbellOutline,
	bookmarkOutline,
	documentTextOutline,
	fitnessOutline,
	informationCircleOutline,
	layersOutline,
	listOutline,
	repeatOutline,
	starOutline,
	stopwatchOutline,
	timeOutline,
} from "ionicons/icons";

import { LoadSelectedExercise, RoutineState } from "@feature/routine/state/routine.state";
import { Select, Store } from "@ngxs/store";
import { AppHeaderComponent } from "@shared/components/app-header/app-header.component";
import { PluralizePipe } from "@shared/pipes/pluralize.pipe";
import { Observable, Subject, takeUntil } from "rxjs";
import { Exercise } from "../interfaces/routine.interface";

declare module "../interfaces/routine.interface" {
	interface Exercise {
		instructions?: string;
		category?: string;
	}
}

@Component({
	selector: "app-exercise-detail",
	standalone: true,
	templateUrl: "./exercise-detail.page.html",
	styleUrls: ["./exercise-detail.page.scss"],
	imports: [
		NgIf,
		IonContent,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
		IonSpinner,
		IonIcon,
		IonButtons,
		IonBackButton,
		AsyncPipe,
		NgOptimizedImage,
		UpperCasePipe,
		NgClass,
		IonButton,
		RouterLink,
		PluralizePipe,
		AppHeaderComponent,
	],
})
export class ExerciseDetailPage implements OnInit, OnDestroy {
	@Select(RoutineState.getSelectedExercise)
	selectedExercise$!: Observable<Exercise | null>;
	isLoading = false;
	private destroy$ = new Subject<void>();

	constructor(
		private route: ActivatedRoute,
		private store: Store,
	) {
		// Registrar todos los iconos utilizados en el componente
		addIcons({
			starOutline,
			documentTextOutline,
			informationCircleOutline,
			timeOutline,
			repeatOutline,
			layersOutline,
			stopwatchOutline,
			listOutline,
			alertCircleOutline,
			fitnessOutline,
			arrowForward,
		});
	}

	ngOnInit() {
		const exerciseId = this.route.snapshot.paramMap.get("id");
		if (exerciseId) {
			this.isLoading = true;
			this.store
				.dispatch(new LoadSelectedExercise(exerciseId))
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: () => {
						this.isLoading = false;
					},
					error: () => {
						this.isLoading = false;
					},
				});
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
