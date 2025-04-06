import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { Step1, Step2, Step3 } from "../interfaces/onboarding.interfaces";

@Injectable({
	providedIn: "root",
})
export class OnboardingService {
	private apiUrl = environment.apiUrl;
	private userId: string;

	constructor(
		private http: HttpClient,
		private loadingCtrl: LoadingController,
	) {
		// Aquí deberías obtener el ID del usuario autenticado, por ejemplo:
		// Puede ser mediante un token JWT o un servicio de autenticación
		this.userId = localStorage.getItem("userId") || "currentUser";
	}

	// Crear un nuevo registro de onboarding completo
	createOnboarding(data: any): Observable<any> {
		console.log("Creando onboarding con datos:", data);
		return this.http.post(`${this.apiUrl}/onboarding`, data);
	}

	// Obtener el onboarding de un usuario
	getOnboarding(): Observable<any> {
		return this.http.get(`${this.apiUrl}/onboarding/${this.userId}`);
	}

	// Actualizar paso 1 - Información personal
	updateStep1(data: Step1): Observable<any> {
		console.log("Actualizando paso 1 con datos:", data);
		return this.http.patch(`${this.apiUrl}/onboarding/${this.userId}/step/1`, data);
	}

	// Actualizar paso 2 - Información de salud
	updateStep2(data: Step2): Observable<any> {
		console.log("Actualizando paso 2 con datos:", data);
		// Verificar que los campos de history sean strings y no booleans
		const history = data.history;
		if (history) {
			// Verificar campos específicos en lugar de usar Object.keys
			const fields = ["respiratory", "cardiac", "chirurgical", "injuries"] as const;
			for (const field of fields) {
				if (typeof history[field] !== "string") {
					console.error(`El campo history.${field} debería ser un string, no ${typeof history[field]}`);
				}
			}
		}
		return this.http.patch(`${this.apiUrl}/onboarding/${this.userId}/step/2`, data);
	}

	// Actualizar paso 3 - Preferencias de entrenamiento
	updateStep3(data: Step3): Observable<any> {
		console.log("Actualizando paso 3 con datos:", data);
		// Verificar que trainingDays sea un número
		if (typeof data.trainingDays !== "number") {
			console.error(`trainingDays debería ser un número, no ${typeof data.trainingDays}`);
			// Intentar convertir a número si es posible
			data.trainingDays = Number(data.trainingDays);
		}
		return this.http.patch(`${this.apiUrl}/onboarding/${this.userId}/step/3`, data);
	}

	/**
	 * Crea y presenta un loader con estilos mejorados para contraste
	 */
	async createAccessibleLoader(message = "Cargando información..."): Promise<HTMLIonLoadingElement> {
		const loading = await this.loadingCtrl.create({
			message: message,
			spinner: "circles",
			cssClass: "loading-content",
			backdropDismiss: false,
		});

		await loading.present();
		return loading;
	}
}
