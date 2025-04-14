import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Exercise } from "@feature/routine/interfaces/routine.interface";
import { IonIcon, IonItem, IonLabel } from "@ionic/angular/standalone";

@Component({
	selector: "app-exercise-item",
	templateUrl: "./exercise-item.component.html",
	styleUrls: ["./exercise-item.component.scss"],
	imports: [IonItem, IonIcon, IonLabel, NgIf, RouterLink],
	standalone: true,
})
export class ExerciseItemComponent {
	@Input() exercise!: Exercise;
}
