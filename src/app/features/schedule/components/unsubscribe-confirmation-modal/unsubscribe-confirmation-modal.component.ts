import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Schedule } from "@feature/schedule/state/schedule.state";
import {
	IonButton,
	IonContent,
	IonFooter,
	IonHeader,
	IonIcon,
	IonSpinner,
	IonTitle,
	IonToolbar,
} from "@ionic/angular/standalone";

/**
 * Componente modal para confirmar la desinscripción de un horario
 * Responsabilidad única: Presentar la interfaz de confirmación para desinscribirse de un horario
 */
@Component({
	selector: "app-unsubscribe-confirmation-modal",
	templateUrl: "./unsubscribe-confirmation-modal.component.html",
	styleUrls: ["./unsubscribe-confirmation-modal.component.scss"],
	standalone: true,
	imports: [
		CommonModule,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonFooter,
		IonButton,
		IonIcon,
		IonSpinner,
	],
})
export class UnsubscribeConfirmationModalComponent {
	/**
	 * El horario del que el usuario quiere desinscribirse
	 */
	@Input() schedule!: Schedule | null;

	/**
	 * Indica si se está procesando la solicitud
	 */
	@Input() isLoading = false;

	/**
	 * Evento emitido cuando el usuario confirma la desinscripción
	 */
	@Output() confirm = new EventEmitter<void>();

	/**
	 * Evento emitido cuando el usuario cancela la desinscripción
	 */
	@Output() cancel = new EventEmitter<void>();
}
