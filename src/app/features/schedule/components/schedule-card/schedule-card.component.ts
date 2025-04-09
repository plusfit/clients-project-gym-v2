import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from "@ionic/angular/standalone";

/**
 * Interfaz Schedule que representa un horario
 */
export interface Schedule {
	_id: string;
	startTime: string;
	endTime: string;
	maxCount: number;
	clients: string[];
	day: string;
}

/**
 * Componente para mostrar un horario de entrenamiento
 * Responsabilidad única: Visualizar la información de un horario y permitir interacción
 */
@Component({
	selector: "app-schedule-card",
	templateUrl: "./schedule-card.component.html",
	styleUrls: ["./schedule-card.component.scss"],
	standalone: true,
	imports: [CommonModule, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonBadge],
})
export class ScheduleCardComponent {
	@Input() schedule!: Schedule;
	@Input() currentUserId!: string;
	@Output() scheduleClicked = new EventEmitter<Schedule>();
	@Output() unsubscribeClicked = new EventEmitter<Schedule>();

	/**
	 * Determina si el horario está lleno
	 */
	get isFull(): boolean {
		return this.schedule.clients && this.schedule.clients.length >= this.schedule.maxCount;
	}

	/**
	 * Determina si el usuario actual está inscrito en este horario
	 */
	get isEnrolled(): boolean {
		return this.schedule.clients?.includes(this.currentUserId);
	}

	/**
	 * Manejador de click en el horario
	 * Solo permite hacer clic si no está lleno o si el usuario ya está inscrito
	 */
	handleClick(): void {
		if (!this.isFull || this.isEnrolled) {
			this.scheduleClicked.emit(this.schedule);
		}
	}

	/**
	 * Manejador para desinscribirse de un horario
	 * Detiene la propagación para evitar activar el click del card
	 */
	handleUnsubscribe(event: Event): void {
		event.stopPropagation();
		this.unsubscribeClicked.emit(this.schedule);
	}
}
