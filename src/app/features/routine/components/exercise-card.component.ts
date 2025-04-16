import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { IonIcon, IonItem, IonLabel } from "@ionic/angular/standalone";
import { Exercise } from "../interfaces/routine.interface";

@Component({
	selector: "app-exercise-card",
	templateUrl: "./exercise-card.component.html",
	styleUrls: ["./exercise-card.component.scss"],
	standalone: true,
	imports: [IonItem, IonLabel, IonIcon, CommonModule, RouterLink],
})
export class ExerciseCardComponent {
	@Input() exercise!: Exercise;

	get isCardio(): boolean {
		return this.exercise.type === "cardio";
	}
}
