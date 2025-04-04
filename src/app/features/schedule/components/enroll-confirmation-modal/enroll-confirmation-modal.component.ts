import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
	IonButton,
	IonCol,
	IonContent,
	IonFooter,
	IonGrid,
	IonHeader,
	IonIcon,
	IonLabel,
	IonRow,
	IonSpinner,
	IonTitle,
	IonToolbar,
} from "@ionic/angular/standalone";
import { Schedule } from "../schedule-card/schedule-card.component";

/**
 * Componente modal para confirmar la inscripción a un horario
 * Responsabilidad única: Presentar la interfaz de confirmación para inscribirse a un horario
 */
@Component({
	selector: "app-enroll-confirmation-modal",
	templateUrl: "./enroll-confirmation-modal.component.html",
	styleUrls: ["./enroll-confirmation-modal.component.scss"],
	standalone: true,
	imports: [
		CommonModule,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonContent,
		IonFooter,
		IonButton,
		IonGrid,
		IonRow,
		IonCol,
		IonLabel,
		IonIcon,
		IonSpinner,
	],
})
export class EnrollConfirmationModalComponent {
	/**
	 * El horario al que el usuario se quiere inscribir
	 */
	@Input() schedule!: Schedule | null;

	/**
	 * Indica si se está procesando la solicitud
	 */
	@Input() isLoading = false;

	/**
	 * Evento emitido cuando el usuario confirma la inscripción
	 */
	@Output() confirm = new EventEmitter<void>();

	/**
	 * Evento emitido cuando el usuario cancela la inscripción
	 */
	@Output() cancel = new EventEmitter<void>();
}
