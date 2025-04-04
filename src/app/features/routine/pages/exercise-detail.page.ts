import {
	AsyncPipe,
	NgClass,
	NgIf,
	NgOptimizedImage,
	UpperCasePipe,
} from "@angular/common";
import { Component, OnInit } from "@angular/core";
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
	IonHeader,
	IonIcon,
	IonSpinner,
	IonTitle,
	IonToolbar,
} from "@ionic/angular/standalone";

import {
	LoadSelectedExercise,
	RoutineState,
} from "@feature/routine/state/routine.state";
import { Select, Store } from "@ngxs/store";
import { PluralizePipe } from "@shared/pipes/pluralize.pipe";
import { Observable } from "rxjs";
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
		IonHeader,
		IonContent,
		IonTitle,
		IonToolbar,
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
	],
})
export class ExerciseDetailPage implements OnInit {
	@Select(RoutineState.getSelectedExercise)
	selectedExercise$!: Observable<Exercise | null>;
	isLoading = false;

	constructor(
		private route: ActivatedRoute,
		private store: Store,
	) {}

	ngOnInit() {
		const exerciseId = this.route.snapshot.paramMap.get("id");
		if (exerciseId) {
			this.isLoading = true;
			this.store.dispatch(new LoadSelectedExercise(exerciseId)).subscribe({
				next: () => (this.isLoading = false),
				error: () => (this.isLoading = false),
			});
		}
	}
}
