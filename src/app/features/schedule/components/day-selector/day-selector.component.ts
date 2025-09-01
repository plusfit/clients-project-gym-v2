import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IonBadge } from "@ionic/angular/standalone";

interface DayEnrollment {
	day: string;
	count: number;
}

interface DayStatus {
	day: string;
	disabled: boolean;
	hasSchedules: boolean;
}

@Component({
	selector: "app-day-selector",
	templateUrl: "./day-selector.component.html",
	styleUrls: ["./day-selector.component.scss"],
	standalone: true,
	imports: [CommonModule, IonBadge],
})
export class DaySelectorComponent {
	@Input() enrollmentsByDay: DayEnrollment[] = [];
	@Input() dayStatuses: DayStatus[] = [];
	@Output() daySelected = new EventEmitter<string>();

	days: string[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

	selectedDay = "Lunes";

	selectDay(day: string) {
		// Solo permitir seleccionar días que tienen horarios habilitados
		if (this.isDayEnabled(day)) {
			this.selectedDay = day;
			this.daySelected.emit(day);
		}
	}

	getEnrollmentCount(day: string): number {
		const enrollment = this.enrollmentsByDay.find((e) => e.day === day);
		return enrollment ? enrollment.count : 0;
	}

	isDayEnabled(day: string): boolean {
		const dayStatus = this.dayStatuses.find((status) => status.day === day);
		return dayStatus ? !dayStatus.disabled && dayStatus.hasSchedules : true;
	}

	isDayDisabled(day: string): boolean {
		return !this.isDayEnabled(day);
	}
}
