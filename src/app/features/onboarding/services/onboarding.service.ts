import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";
import { Store } from "@ngxs/store";
import { environment } from "environments/environment";
import { Observable, catchError, of, tap, throwError } from "rxjs";
import { User } from "../../auth/interfaces/user.interface";
import { AuthState } from "../../auth/state/auth.state";
import { Plan } from "../../plans/interfaces/plan.interface";
import { Step1, Step2, Step3 } from "../interfaces/onboarding.interfaces";
import { OnboardingState } from "../state/onboarding.state";

@Injectable({
	providedIn: "root",
})
export class OnboardingService {
	private apiUrl = environment.apiUrl;
	private _userId: string | null = null;

	constructor(
		private http: HttpClient,
		private loadingCtrl: LoadingController,
		private store: Store,
	) {
		// El userId se obtendrá de forma dinámica cuando se necesite
	}

	/**
	 * Obtiene el ID del usuario actual del estado de autenticación
	 * Si no hay usuario autenticado, se usa un fallback configurable
	 */
	private get userId(): string {
		// Intentar obtener el usuario del estado de autenticación
		const user = this.store.selectSnapshot(AuthState.getUser) as User | null;

		// Si tenemos un usuario con ID, usarlo
		if (user?._id) {
			return user._id;
		}

		// Error crítico: sin ID de usuario válido
		const errorMsg = "No se encontró un usuario con ID válido en AuthState";
		// En entorno de producción podríamos querer lanzar una excepción
		// throw new Error(errorMsg);

		// Solo como último recurso, intentar cargar de localStorage
		const storedUserId = localStorage.getItem("userId");
		if (storedUserId) {
			console.warn(`⚠️ Usando ID de usuario desde localStorage: ${storedUserId}`);
			return storedUserId;
		}

		// Fallback absoluto solo para desarrollo
		return `development_user_${Date.now()}`;
	}

	// Crear un nuevo registro de onboarding completo
	createOnboarding(data: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/onboarding`, data);
	}

	// Obtener el onboarding de un usuario
	getOnboarding(): Observable<any> {
		return this.http.get(`${this.apiUrl}/onboarding/${this.userId}`);
	}

	// Actualizar paso 1 - Información personal
	updateStep1(data: Step1): Observable<any> {
		return this.http.patch(`${this.apiUrl}/onboarding/${this.userId}/step/1`, data);
	}

	// Actualizar paso 2 - Información de salud
	updateStep2(data: Step2): Observable<any> {
		// Verificar que los campos de history sean strings y no booleans
		const history = data.history;
		if (history) {
			// Verificar campos específicos en lugar de usar Object.keys
			const fields = ["respiratory", "cardiac", "chirurgical", "injuries"] as const;
			for (const field of fields) {
				if (typeof history[field] !== "string") {
				}
			}
		}
		return this.http.patch(`${this.apiUrl}/onboarding/${this.userId}/step/2`, data);
	}

	// Actualizar paso 3 - Preferencias de entrenamiento
	updateStep3(data: Step3): Observable<any> {
		// Verificar que trainingDays sea un número
		if (typeof data.trainingDays !== "number") {
			// Intentar convertir a número si es posible
			data.trainingDays = Number(data.trainingDays);
		}
		return this.http.patch(`${this.apiUrl}/onboarding/${this.userId}/step/3`, data);
	}

	/**
	 * Solicita al backend que asigne automáticamente un plan
	 * basado en los datos de onboarding
	 */
	assignPlan(retryCount = 0): Observable<any> {
		const maxRetries = 2;

		// Verificar que tengamos todos los datos necesarios antes de llamar al endpoint
		const step3Data = this.store.selectSnapshot(OnboardingState.getStep3);
		if (!step3Data) {
			console.warn("❗ No se encontraron datos del paso 3 para asignar plan");
		}

		// Enviar un objeto vacío como payload, ya que el userId está en la URL
		return this.http.post<any>(`${this.apiUrl}/onboarding/${this.userId}/assign-plan`, {}).pipe(
			tap((response) => {

				// Extraer información del plan basado en diferentes estructuras de respuesta posibles
				let planId = null;
				let planName = "Personalizado";

				// Caso 1: El backend devuelve un objeto con el plan completo en data.plan
				if (response?.data?.plan) {
					planId = response.data.plan._id || response.data.plan.id;
					planName = response.data.plan.name || "Personalizado";
				}
				// Caso 2: El backend devuelve un objeto usuario con planId
				else if (response?.data?.planId) {
					planId = response.data.planId;
				}
				// Caso 3: La respuesta es directamente el objeto plan
				else if (response?.plan) {
					planId = response.plan._id || response.plan.id;
					planName = response.plan.name || "Personalizado";
				}
				// Caso 4: La respuesta es otro formato
				else {
				}

				// Guardar planId en localStorage para mayor compatibilidad
				if (planId) {
					localStorage.setItem("planId", planId);
				}
			}),
			catchError((error) => {
				const errorMsg = error.error?.message || error.message || "Error desconocido";

				// Si hay error de conexión o 5xx, intentar de nuevo
				if ((error.status >= 500 || error.status === 0) && retryCount < maxRetries) {
					return this.assignPlan(retryCount + 1);
				}

				// Si hay error 404, intentar crear un plan predeterminado
				if (error.status === 404) {
					return this.createDefaultPlan();
				}

				return throwError(() => new Error(`Error al asignar plan: ${errorMsg}`));
			}),
		);
	}

	/**
	 * Crea un plan predeterminado si la asignación automática falla
	 */
	private createDefaultPlan(): Observable<any> {
		const defaultPlan = {
			name: "Plan de Inicio",
			description: "Plan básico generado automáticamente",
			duration: 4,
			type: "strength",
			level: "beginner",
		};

		// Simular una respuesta exitosa con un plan predeterminado
		return of({
			status: "success",
			message: "Se ha creado un plan predeterminado",
			data: {
				plan: defaultPlan,
			},
		});
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
